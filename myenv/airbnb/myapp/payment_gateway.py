import razorpay
from django.conf import settings
import hmac
import hashlib

class RazorpayClient:
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    def create_order(self, amount, currency='INR'):
        # Razorpay expects amount in paise (1 INR = 100 paise)
        data = {
            "amount": int(amount * 100),
            "currency": currency,
            "payment_capture": "1" # Automatically capture payment
        }
        return self.client.order.create(data=data)

    def verify_payment(self, razorpay_order_id, razorpay_payment_id, razorpay_signature):
        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            self.client.utility.verify_payment_signature(params_dict)
            return True
        except:
            return False
