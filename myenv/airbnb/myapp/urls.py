from django.urls import path
from .views import (
    RegisterView,
    ProfileView,
    PropertyListCreateView,
    PropertyDetailView,
    MyPropertiesView,
    BookingListCreateView,
    ReviewCreateView,
    WishlistView,
    VerifyEmailView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),

    path('properties/', PropertyListCreateView.as_view(), name='property-list-create'),
    path('properties/<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('properties/my/', MyPropertiesView.as_view(), name='my-properties'),

    path('bookings/', BookingListCreateView.as_view(), name='bookings'),
    path('reviews/', ReviewCreateView.as_view(), name='reviews'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('verify-email/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
]