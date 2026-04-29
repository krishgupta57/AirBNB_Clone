from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from .models import User, Property, Booking, Review, Wishlist, SubscriptionTransaction, Message


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
        fields = ['id', 'username', 'email', 'phone', 'role', 'subscription_tier', 'wallet_balance', 'is_staff', 'avatar', 'bio']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.avatar:
            request = self.context.get('request')
            if request:
                ret['avatar'] = request.build_absolute_uri(instance.avatar.url)
        return ret


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
            'status',
            'image',
            'image_file',
            'amenities',
            'is_active',
            'created_at',
            'average_rating',
            'reviews',
            'host_username',
        ]
        read_only_fields = ['is_active']

    host_username = serializers.CharField(source='host.username', read_only=True)
    
    def validate(self, attrs):
        user = self.context['request'].user
        
        # Check listing limit (only for new listings)
        if not self.instance:
            limit = user.get_listing_limit()
            current_count = user.properties.count()
            if current_count >= limit:
                raise serializers.ValidationError(f"Your {user.subscription_tier} plan limit of {limit} listings has been reached. Please upgrade to add more.")

        # Amenity Gating Logic
        amenities = attrs.get('amenities', [])
        TIER_AMENITIES = {
            'trial': ['WiFi', 'Kitchen', 'Essentials'],
            'standard': ['WiFi', 'Kitchen', 'Essentials', 'TV', 'Air Conditioning', 'Dedicated Workspace'],
            'premium': ['WiFi', 'Kitchen', 'Essentials', 'TV', 'Air Conditioning', 'Dedicated Workspace', 'Gym', 'Parking', 'Breakfast', 'Private Entrance'],
            'ultimate': None # Unlimited
        }
        allowed = TIER_AMENITIES.get(user.subscription_tier)
        if allowed is not None:
            for am in amenities:
                if am not in allowed:
                    raise serializers.ValidationError(f"The amenity '{am}' is not available in your {user.subscription_tier} plan. Please upgrade to unlock it.")
        return attrs

    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Ensure image has full URL if it's a file
        if instance.image_file:
            ret['image'] = self.context['request'].build_absolute_uri(instance.image_file.url)
        return ret


class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    property_detail = PropertySerializer(source='property', read_only=True)
    trip_status = serializers.SerializerMethodField()
    unread_messages_count = serializers.SerializerMethodField()

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
            'trip_status',
            'unread_messages_count',
            'created_at',
        ]
        read_only_fields = ['user', 'total_price', 'status', 'trip_status']

    def get_trip_status(self, obj):
        if obj.status == 'cancelled':
            return 'Cancelled'
        
        today = timezone.now().date()
        if obj.check_out < today:
            return 'Completed'
        if obj.check_in <= today <= obj.check_out:
            return 'Staying'
        return 'Upcoming'

    def get_unread_messages_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()

    def validate(self, attrs):
        # Basic check-in/out validation if present
        check_in = attrs.get('check_in')
        check_out = attrs.get('check_out')
        if check_in and check_out:
            if check_in >= check_out:
                raise serializers.ValidationError("Check-out date must be after check-in date.")
        return attrs


class WishlistSerializer(serializers.ModelSerializer):
    property_detail = PropertySerializer(source='property', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'property', 'property_detail']


class SubscriptionTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionTransaction
        fields = '__all__'

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'booking', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['booking', 'sender']