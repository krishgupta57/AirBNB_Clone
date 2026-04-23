from django.utils import timezone
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Sum, Count
import random

from .models import Property, Booking, Review, Wishlist, SubscriptionTransaction
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    PropertySerializer,
    BookingSerializer,
    ReviewSerializer,
    WishlistSerializer,
    SubscriptionTransactionSerializer,
)
from decimal import Decimal

User = get_user_model()

# --- Auth & User Views ---
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        otp = str(random.randint(100000, 999999))
        user.otp = otp
        user.save()
        subject = "Your Verification Code - AirBNB Clone"
        message = f"Hi {user.username},\n\nYour 6-digit verification code is: {otp}\n\nPlease enter this code on the website to activate your account.\n\nIf you didn't register on our site, please ignore this email."
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
        if user.otp == otp:
            user.is_active = True
            user.otp = None
            user.save()
            return Response({"message": "Email verified successfully! You can now log in."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class SubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = request.data.get('plan')
        action_type = request.data.get('action') # 'purchase', 'credit', 'refund'
        amount_paid = Decimal(request.data.get('amount', 0))
        balance_used = Decimal(request.data.get('balance_used', 0))

        if plan not in ['trial', 'standard', 'premium', 'ultimate']:
            return Response({"error": "Invalid plan selected"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        old_tier = user.subscription_tier
        
        # Financial logic
        if balance_used > 0:
            user.wallet_balance -= balance_used
            user.subscription_transactions.create(
                amount=balance_used,
                transaction_type='adjustment',
                description=f"Applied ₹{balance_used} from wallet balance for {plan} upgrade."
            )

        if action_type == 'credit' and amount_paid < 0:
            # Downgrade credit to wallet
            credit_amt = abs(amount_paid)
            user.wallet_balance += credit_amt
            user.subscription_transactions.create(
                amount=credit_amt,
                transaction_type='credit',
                tier_from=old_tier,
                tier_to=plan,
                description=f"Credited ₹{credit_amt} to wallet after downgrading from {old_tier} to {plan}."
            )
        elif action_type == 'refund' and amount_paid < 0:
            # Downgrade simulated refund
            refund_amt = abs(amount_paid)
            user.subscription_transactions.create(
                amount=refund_amt,
                transaction_type='refund',
                tier_from=old_tier,
                tier_to=plan,
                description=f"Refund initiated for ₹{refund_amt} after downgrading from {old_tier} to {plan}."
            )
        elif amount_paid > 0:
            # Plan purchase/upgrade
            user.subscription_transactions.create(
                amount=amount_paid,
                transaction_type='purchase',
                tier_from=old_tier,
                tier_to=plan,
                description=f"Upgraded from {old_tier} to {plan}."
            )

        user.subscription_tier = plan
        user.last_billed_at = timezone.now()
        user.save()
        
        # Automatically sync visibility based on new plan limits
        user.sync_listing_limits()
        
        return Response({
            "message": f"Successfully updated to {plan} plan!",
            "tier": user.subscription_tier,
            "balance": str(user.wallet_balance)
        })


class SubscriptionQuoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_plan = request.data.get('plan')
        if new_plan not in ['trial', 'standard', 'premium', 'ultimate']:
            return Response({"error": "Invalid plan selected"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        current_plan = user.subscription_tier
        
        current_price = Decimal(user.get_plan_price())
        new_price = Decimal(user.get_plan_price(new_plan))
        
        # Proration Calculation (30-day cycle)
        now = timezone.now()
        days_used = (now - user.last_billed_at).days
        days_remaining = Decimal(max(1, 30 - days_used))
        
        current_daily_rate = current_price / Decimal(30)
        new_daily_rate = new_price / Decimal(30)
        
        credit_for_unused = (current_daily_rate * days_remaining).quantize(Decimal('0.01'))
        cost_for_new_remaining = (new_daily_rate * days_remaining).quantize(Decimal('0.01'))
        
        total_adjustment = (cost_for_new_remaining - credit_for_unused).quantize(Decimal('0.01'))

        return Response({
            "current_plan": current_plan,
            "new_plan": new_plan,
            "current_credit": str(credit_for_unused),
            "new_cost_remaining": str(cost_for_new_remaining),
            "total_adjustment": str(total_adjustment),
            "wallet_balance": str(user.wallet_balance),
            "days_remaining": int(days_remaining)
        })


class TransactionView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SubscriptionTransactionSerializer

    def get(self, request):
        txs = request.user.subscription_transactions.all().order_by('-created_at')
        serializer = SubscriptionTransactionSerializer(txs, many=True)
        return Response(serializer.data)


# --- Core ViewSets ---

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer

    def get_queryset(self):
        properties = Property.objects.select_related('host').prefetch_related('reviews', 'reviews__user').order_by('-created_at')
        
        # Subscription Logic: Only show active properties to guests
        # Admins can see everything, hosts can see their own
        if not self.request.user.is_staff and self.action not in ['my', 'retrieve']:
            properties = properties.filter(is_active=True)
        
        # Query parameters
        search = self.request.query_params.get('search')
        limit = self.request.query_params.get('limit')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        p_type = self.request.query_params.get('property_type')
        bedrooms = self.request.query_params.get('bedrooms')
        bathrooms = self.request.query_params.get('bathrooms')
        guests = self.request.query_params.get('guests')
        sort = self.request.query_params.get('sort')

        # Multi-layered Filtering
        if search:
            properties = properties.filter(title__icontains=search) | properties.filter(location__icontains=search)
        
        if min_price:
            properties = properties.filter(price_per_night__gte=min_price)
        if max_price:
            properties = properties.filter(price_per_night__lte=max_price)
        if p_type:
            properties = properties.filter(property_type=p_type)
        if bedrooms:
            properties = properties.filter(bedrooms__gte=bedrooms)
        if bathrooms:
            properties = properties.filter(bathrooms__gte=bathrooms)
        if guests:
            properties = properties.filter(guests__gte=guests)

        # Sorting
        if sort == 'price_asc':
            properties = properties.order_by('price_per_night')
        elif sort == 'price_desc':
            properties = properties.order_by('-price_per_night')
        elif sort == 'newest':
            properties = properties.order_by('-created_at')

        # Pagination/Limit
        if limit:
            try:
                properties = properties[:int(limit)]
            except ValueError:
                pass
        return properties

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'my']:
            return [IsAuthenticated()]
        return [AllowAny()]

    def check_object_permissions(self, request, obj):
        if request.method in ['PUT', 'PATCH', 'DELETE']:
            if obj.host != request.user:
                raise PermissionDenied({"error": "You can modify only your own property"})
        super().check_object_permissions(request, obj)

    def perform_create(self, serializer):
        if self.request.user.role != 'host':
            raise PermissionDenied({"error": "Only hosts can add properties"})
        serializer.save(host=self.request.user)

    @action(detail=False, methods=['get'])
    def my(self, request):
        properties = self.get_queryset().filter(host=request.user)
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        if request.user.role != 'host':
            raise PermissionDenied({"error": "Only hosts can view analytics"})
        
        from django.db.models import Sum
        from django.db.models.functions import TruncMonth
        from django.utils import timezone
        from datetime import timedelta

        properties = self.get_queryset().filter(host=request.user)
        bookings = Booking.objects.filter(property__in=properties)
        
        total_revenue = bookings.filter(status='confirmed').aggregate(total=Sum('total_price'))['total'] or 0
        total_bookings = bookings.count()
        cancelled_bookings = bookings.filter(status='cancelled').count()
        
        six_months_ago = timezone.now() - timedelta(days=180)
        
        revenue_data = (
            bookings.filter(status='confirmed', created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(revenue=Sum('total_price'))
            .order_by('month')
        )
        
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        chart_data = []
        for rd in revenue_data:
            if rd['month']:
                chart_data.append({
                    "name": months[rd['month'].month - 1] + f" '{str(rd['month'].year)[2:]}",
                    "revenue": float(rd['revenue'] or 0)
                })
                
        return Response({
            "total_revenue": float(total_revenue),
            "total_bookings": total_bookings,
            "cancelled_bookings": cancelled_bookings,
            "chart_data": chart_data
        })

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def booked_dates(self, request, pk=None):
        from datetime import timedelta
        property_obj = self.get_object()
        bookings = Booking.objects.filter(property=property_obj, status='confirmed')
        
        booked_dates = set()
        for booking in bookings:
            current_date = booking.check_in
            # We don't exclude the check_out day so another person can check-in on that afternoon
            while current_date < booking.check_out: 
                booked_dates.add(current_date.strftime('%Y-%m-%d'))
                current_date += timedelta(days=1)
                
        return Response(list(booked_dates))

class BookingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Booking.objects.select_related(
            'user', 'property', 'property__host'
        ).prefetch_related(
            'property__reviews', 'property__reviews__user'
        ).order_by('-created_at')

        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'cancelled':
            return Response({"error": "Booking is already cancelled"}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'cancelled'
        booking.save()
        return Response({"message": "Booking cancelled successfully"})


class ReviewViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --- Additional Views ---

class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist_items = Wishlist.objects.filter(user=request.user).select_related(
            'property', 'property__host'
        ).prefetch_related(
            'property__reviews', 'property__reviews__user'
        )
        serializer = WishlistSerializer(wishlist_items, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        property_id = request.data.get('property')
        if not property_id:
            return Response({"error": "Property id is required"}, status=status.HTTP_400_BAD_REQUEST)
        if Wishlist.objects.filter(user=request.user, property_id=property_id).exists():
            return Response({"message": "Already in wishlist"}, status=status.HTTP_200_OK)
        wishlist = Wishlist.objects.create(user=request.user, property_id=property_id)
        serializer = WishlistSerializer(wishlist)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        property_id = request.data.get('property')
        if not property_id:
            return Response({"error": "Property id is required"}, status=status.HTTP_400_BAD_REQUEST)
        item = Wishlist.objects.filter(user=request.user, property_id=property_id).first()
        if item:
            item.delete()
            return Response({"message": "Removed from wishlist"}, status=status.HTTP_200_OK)
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)

# --- Admin Analytics ---

class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    # This view returns a custom complex object, so we let spectacular infer or use a mock


    def get(self, request):
        # 1. Financials
        confirmed_bookings = Booking.objects.filter(status='confirmed')
        total_booking_revenue = confirmed_bookings.aggregate(total=Sum('total_price'))['total'] or 0
        platform_fee_income = (Decimal(total_booking_revenue) * Decimal('0.10')).quantize(Decimal('0.01'))
        
        subscription_revenue = SubscriptionTransaction.objects.filter(
            transaction_type__in=['purchase', 'adjustment']
        ).aggregate(total=Sum('amount'))['total'] or 0

        # 2. Users
        total_hosts = User.objects.filter(role='host').count()
        total_guests = User.objects.filter(role='guest').count()
        
        # 3. Listings
        total_listings = Property.objects.count()
        active_listings = Property.objects.filter(is_active=True).count()
        
        # 4. Recent Activity
        recent_bookings = BookingSerializer(
            Booking.objects.order_by('-created_at')[:5], 
            many=True, 
            context={'request': request}
        ).data
        recent_properties = PropertySerializer(
            Property.objects.order_by('-created_at')[:5], 
            many=True, 
            context={'request': request}
        ).data

        return Response({
            "financials": {
                "total_booking_revenue": str(total_booking_revenue),
                "platform_fee_income": str(platform_fee_income),
                "subscription_revenue": str(subscription_revenue),
                "total_platform_revenue": str(Decimal(platform_fee_income) + Decimal(subscription_revenue))
            },
            "users": {
                "total_hosts": total_hosts,
                "total_guests": total_guests,
                "total_users": User.objects.count()
            },
            "listings": {
                "total": total_listings,
                "active": active_listings,
                "inactive": total_listings - active_listings
            },
            "recent_activity": {
                "bookings": recent_bookings,
                "properties": recent_properties
            }
        })

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        users = User.objects.annotate(listing_count=Count('properties')).order_by('-date_joined')
        
        # Categorize
        hosts = users.filter(role='host')
        guests = users.filter(role='guest')

        host_data = []
        for h in hosts:
            host_data.append({
                "id": h.id,
                "username": h.username,
                "email": h.email,
                "listing_count": h.listing_count,
                "tier": h.subscription_tier,
                "date_joined": h.date_joined
            })

        guest_data = []
        for g in guests:
            guest_data.append({
                "id": g.id,
                "username": g.username,
                "email": g.email,
                "date_joined": g.date_joined
            })

        return Response({
            "hosts": host_data,
            "guests": guest_data,
            "total_count": users.count()
        })