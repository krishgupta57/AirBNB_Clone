import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'airbnb.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

User = get_user_model()
username = 'test_tester'
email = 'tester@example.com'

# Cleanup
User.objects.filter(username=username).delete()

# Create user as RegisterSerializer does
user = User.objects.create_user(username=username, email=email, password='Password123!')
user.is_active = False
user.save()

# Generate token as RegisterView does
token = default_token_generator.make_token(user)
uid = urlsafe_base64_encode(force_bytes(user.pk))

print(f"UID: {uid}")
print(f"Token: {token}")

# Verify
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

decoded_uid = force_str(urlsafe_base64_decode(uid))
decoded_user = User.objects.get(pk=decoded_uid)
is_valid = default_token_generator.check_token(decoded_user, token)

print(f"Is Token Valid? {is_valid}")
