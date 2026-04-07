from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Generate 6-digit OTP
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
            user.otp = None  # Clear OTP after successful verification
            user.save()
            return Response({"message": "Email verified successfully! You can now log in."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)


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

        serializer = PropertySerializer(properties, many=True, context={'request': request})
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
        serializer = PropertySerializer(property_obj, context={'request': request})
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
        serializer = PropertySerializer(properties, many=True, context={'request': request})
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