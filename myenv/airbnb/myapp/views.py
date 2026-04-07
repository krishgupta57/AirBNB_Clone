from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator

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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        verify_url = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"
        
        subject = "Verify your Email - AirBNB Clone"
        message = f"Hi {user.username},\n\nPlease click the link below to verify your email and activate your account:\n{verify_url}\n\nIf you didn't register on our site, please ignore this email."
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully! You can now log in."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired verification link."}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class PropertyListCreateView(APIView):
    def get(self, request):
        properties = Property.objects.all().order_by('-created_at')
        search = request.GET.get('search')

        if search:
            properties = Property.objects.filter(title__icontains=search) | Property.objects.filter(location__icontains=search)

        serializer = PropertySerializer(properties, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if request.user.role != 'host':
            return Response({"error": "Only hosts can add properties"}, status=status.HTTP_403_FORBIDDEN)

        serializer = PropertySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(host=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PropertyDetailView(APIView):
    def get(self, request, pk):
        property_obj = get_object_or_404(Property, pk=pk)
        serializer = PropertySerializer(property_obj)
        return Response(serializer.data)

    def put(self, request, pk):
        property_obj = get_object_or_404(Property, pk=pk)

        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if property_obj.host != request.user:
            return Response({"error": "You can update only your own property"}, status=status.HTTP_403_FORBIDDEN)

        serializer = PropertySerializer(property_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(host=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        property_obj = get_object_or_404(Property, pk=pk)

        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        if property_obj.host != request.user:
            return Response({"error": "You can delete only your own property"}, status=status.HTTP_403_FORBIDDEN)

        property_obj.delete()
        return Response({"message": "Property deleted successfully"}, status=status.HTTP_200_OK)


class MyPropertiesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        properties = Property.objects.filter(host=request.user).order_by('-created_at')
        serializer = PropertySerializer(properties, many=True)
        return Response(serializer.data)


class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class WishlistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist_items = Wishlist.objects.filter(user=request.user)
        serializer = WishlistSerializer(wishlist_items, many=True)
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