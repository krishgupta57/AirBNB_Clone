from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, viewsets, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.conf import settings
import random

from .models import Property, Booking, Review, Wishlist
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    PropertySerializer,
    BookingSerializer,
    ReviewSerializer,
    WishlistSerializer,
)

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

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# --- Core ViewSets ---

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer

    def get_queryset(self):
        properties = Property.objects.select_related('host').prefetch_related('reviews', 'reviews__user').order_by('-created_at')
        search = self.request.query_params.get('search')
        limit = self.request.query_params.get('limit')
        if search:
            properties = properties.filter(title__icontains=search) | properties.filter(location__icontains=search)
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


class BookingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user).select_related(
            'user', 'property', 'property__host'
        ).prefetch_related(
            'property__reviews', 'property__reviews__user'
        ).order_by('-created_at')

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