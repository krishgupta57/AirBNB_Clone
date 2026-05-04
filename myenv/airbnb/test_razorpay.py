import os
import django
import sys
from decimal import Decimal

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'airbnb.settings')
django.setup()

from django.conf import settings
from myapp.payment_gateway import RazorpayClient

print(f"Testing with Key: {settings.RAZORPAY_KEY_ID}")
print(f"Secret Length: {len(settings.RAZORPAY_KEY_SECRET)}")

try:
    client = RazorpayClient()
    order = client.create_order(Decimal("100.00"))
    print("SUCCESS! Order Created:", order['id'])
except Exception as e:
    print("FAILED!")
    print("Error Type:", type(e).__name__)
    print("Error Message:", str(e))
