import os
import django
import sys
from unittest.mock import MagicMock

# Set up Django environment
sys.path.append(r'c:\Users\krish\OneDrive\Documents\Cybrom Internship\AirBNB\myenv\airbnb')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'airbnb.settings')
django.setup()

from myapp.views import BookingViewSet
from myapp.models import User, Booking
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
viewset = BookingViewSet()

# Test for user 'krish' (who should be staff)
try:
    user = User.objects.get(username='krish')
    print(f"Testing for user: {user.username} (Staff: {user.is_staff})")
    
    # Simulate the request
    request = factory.get('/api/bookings/11/messages/')
    request.user = user
    
    viewset.request = request
    viewset.kwargs = {'pk': '11'}
    viewset.format_kwarg = None
    
    qs = viewset.get_queryset()
    print(f"Queryset count: {qs.count()}")
    if qs.filter(id=11).exists():
        print("Booking 11 FOUND in queryset.")
    else:
        print("Booking 11 NOT FOUND in queryset.")
        
except Exception as e:
    print(f"Error: {e}")
