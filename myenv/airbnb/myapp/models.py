from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils import timezone


class User(AbstractUser):
    ROLE_CHOICES = (
        ('guest', 'Guest'),
        ('host', 'Host'),
        ('admin', 'Admin'),
    )
    TIER_CHOICES = (
        ('trial', 'Trial (2 Listings)'),
        ('standard', 'Standard (10 Listings)'),
        ('premium', 'Premium (50 Listings)'),
        ('ultimate', 'Ultimate (Unlimited)'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='guest')
    phone = models.CharField(max_length=15, blank=True, null=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(auto_now=True)
    subscription_tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='trial')
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    subscription_started_at = models.DateTimeField(default=timezone.now)
    last_billed_at = models.DateTimeField(default=timezone.now)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    def get_listing_limit(self):
        limits = {'trial': 2, 'standard': 10, 'premium': 50, 'ultimate': 99999}
        return limits.get(self.subscription_tier, 2)
    
    def get_plan_price(self, tier=None):
        prices = {'trial': 0, 'standard': 1999, 'premium': 4999, 'ultimate': 9999}
        t = tier or self.subscription_tier
        return prices.get(t, 0)

    def sync_listing_limits(self):
        """Hides recent listings if they exceed the plan limit"""
        limit = self.get_listing_limit()
        # Order by created_at so we keep oldest ones and hide most recent ones
        all_props = self.properties.order_by('created_at')
        for i, prop in enumerate(all_props):
            if i >= limit:
                prop.is_active = False
            else:
                prop.is_active = True
            prop.save()

    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_staff = True
            self.is_superuser = True
        elif self.is_staff:
            self.role = 'admin'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username


class Property(models.Model):
    PROPERTY_TYPES = (
        ('apartment', 'Apartment'),
        ('villa', 'Villa'),
        ('house', 'House'),
        ('room', 'Room'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('maintenance', 'Maintenance'),
    )

    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    guests = models.PositiveIntegerField(default=1)
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES, default='apartment')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    image = models.URLField(blank=True, null=True)
    image_file = models.ImageField(upload_to='property_images/', blank=True, null=True)
    amenities = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def average_rating(self):
        reviews = self.reviews.all()
        if reviews.exists():
            return round(sum(review.rating for review in reviews) / reviews.count(), 1)
        return 0

    def __str__(self):
        return self.title


class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bookings')
    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def clean(self):
        if self.check_in >= self.check_out:
            raise ValidationError("Check-out date must be after check-in date.")

        overlapping_bookings = Booking.objects.filter(
            property=self.property,
            status='confirmed',
            check_in__lt=self.check_out,
            check_out__gt=self.check_in
        ).exclude(id=self.id)
        
        if overlapping_bookings.exists():
            raise ValidationError("This property is already booked for the selected dates.")

    def save(self, *args, **kwargs):
        nights = (self.check_out - self.check_in).days
        self.total_price = nights * self.property.price_per_night
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} booked {self.property.title}"


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'property']

    def __str__(self):
        return f"{self.user.username} - {self.property.title}"


class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist_items')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='wishlisted_by')

    class Meta:
        unique_together = ['user', 'property']

    def __str__(self):
        return f"{self.user.username} -> {self.property.title}"


class WalletTransaction(models.Model):
    TYPE_CHOICES = (
        ('refund', 'Refund'),
        ('payment', 'Payment'),
        ('subscription', 'Subscription'),
        ('adjustment', 'Adjustment'),
        ('topup', 'Wallet Top-up'),
        ('withdrawal', 'Withdrawal'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallet_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='completed')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} ({self.status}) - ₹{self.amount}"

class SubscriptionTransaction(models.Model):
    TYPE_CHOICES = (
        ('purchase', 'Plan Purchase'),
        ('refund', 'Refund'),
        ('credit', 'Credit to Wallet'),
        ('adjustment', 'Prorated Adjustment'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscription_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    tier_from = models.CharField(max_length=20, blank=True, null=True)
    tier_to = models.CharField(max_length=20, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    def __str__(self):
        return f"{self.user.username} - {self.transaction_type} - ₹{self.amount}"

class Message(models.Model):
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Message from {self.sender.username} on Booking {self.booking.id}"

class SupportTicket(models.Model):
    STATUS_CHOICES = (
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    )
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='General')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket {self.id}: {self.subject} ({self.user.username})"

class SupportMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    attachment = models.FileField(upload_to='support_attachments/', null=True, blank=True)
    is_internal = models.BooleanField(default=False, db_index=True)
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Support Message from {self.sender.username} on Ticket {self.ticket.id}"

class Inquiry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiries')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='inquiries')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry by {self.user.username} for {self.property.title}"

class InquiryMessage(models.Model):
    inquiry = models.ForeignKey(Inquiry, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"Inquiry Message from {self.sender.username}"