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
    user = User.objects.get(username='suneel')
    print(f"Testing for guest: {user.username} (Staff: {user.is_staff})")
    
    tickets = SupportTicket.objects.filter(user=user)
    print(f"Tickets found: {tickets.count()}")
    
    for ticket in tickets:
        print(f"Ticket ID {ticket.id}: {ticket.subject}")
        messages = ticket.messages.all()
        print(f"  Messages: {messages.count()}")
        if user != ticket.user and not user.is_staff:
            print("  PERMISSION FAILED")
        else:
            print("  PERMISSION SUCCESS")

    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
