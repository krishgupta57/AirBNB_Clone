from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError


class User(AbstractUser):
    ROLE_CHOICES = (
        ('guest', 'Guest'),
        ('host', 'Host'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='guest')
    phone = models.CharField(max_length=15, blank=True, null=True)
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class Property(models.Model):
    PROPERTY_TYPES = (
        ('apartment', 'Apartment'),
        ('villa', 'Villa'),
        ('house', 'House'),
        ('room', 'Room'),
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
    image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

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
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    created_at = models.DateTimeField(auto_now_add=True)

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