from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, Property, Booking, Review, Wishlist


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role', 'password', 'confirm_password']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        validate_password(attrs['password'])
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        user.is_active = False  # Set to False until email is verified
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'role']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'property', 'rating', 'comment', 'created_at']
        read_only_fields = ['user']


class PropertySerializer(serializers.ModelSerializer):
    host = UserSerializer(read_only=True)
    average_rating = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id',
            'host',
            'title',
            'description',
            'location',
            'price_per_night',
            'bedrooms',
            'bathrooms',
            'guests',
            'property_type',
            'image',
            'created_at',
            'average_rating',
            'reviews',
        ]

    def get_average_rating(self, obj):
        return obj.average_rating()


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    property_detail = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'property',
            'property_detail',
            'check_in',
            'check_out',
            'total_price',
            'status',
            'created_at',
        ]
        read_only_fields = ['user', 'total_price', 'status']


class WishlistSerializer(serializers.ModelSerializer):
    property_detail = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'property', 'property_detail']