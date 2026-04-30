import os
import django
import sys

# Set up Django environment
sys.path.append(r'c:\Users\krish\OneDrive\Documents\Cybrom Internship\AirBNB\myenv\airbnb')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'airbnb.settings')
django.setup()

from myapp.models import User, SupportTicket, SupportMessage
from django.db import models

try:
    # Find a non-staff user (guest)
    user = User.objects.filter(is_staff=False).first()
    if not user:
        print("No guest user found.")
        sys.exit(0)
        
    print(f"Testing for guest: {user.username}")
    
    # Check queryset
    tickets = SupportTicket.objects.filter(user=user)
    print(f"Tickets found for user: {tickets.count()}")
    
    if tickets.exists():
        ticket = tickets.first()
        print(f"Testing Ticket ID: {ticket.id}")
        
        # Check messages
        messages = ticket.messages.all()
        print(f"Messages count: {messages.count()}")
        
        # Check permission logic
        if user != ticket.user and not user.is_staff:
            print("PERMISSION FAILED (User != Ticket User)")
        else:
            print("PERMISSION SUCCESS")
            
    print("SUCCESS: Check completed.")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
