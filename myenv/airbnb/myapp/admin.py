from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Property, Booking, Review, Wishlist

admin.site.register(User, UserAdmin)
admin.site.register(Property)
admin.site.register(Booking)
admin.site.register(Review)
admin.site.register(Wishlist)