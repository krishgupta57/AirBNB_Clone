from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    ProfileView,
    VerifyOTPView,
    WishlistView,
    PropertyViewSet,
    BookingViewSet,
    ReviewViewSet,
    SubscriptionView,
    SubscriptionQuoteView,
    TransactionView,
    WalletTopupView,
    WalletWithdrawView,
    CreatePaymentOrderView,
    VerifyPaymentView,
    AdminStatsView,
    AdminUserListView,
    SupportTicketViewSet,
    InquiryViewSet,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'support-tickets', SupportTicketViewSet, basename='support-ticket')
router.register(r'inquiries', InquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('subscription/', SubscriptionView.as_view(), name='subscription'),
    path('subscription/quote/', SubscriptionQuoteView.as_view(), name='subscription-quote'),
    path('transactions/', TransactionView.as_view(), name='transactions'),
    path('wallet/topup/', WalletTopupView.as_view(), name='wallet-topup'),
    path('wallet/withdraw/', WalletWithdrawView.as_view(), name='wallet-withdraw'),
    path('payments/create-order/', CreatePaymentOrderView.as_view(), name='create-payment-order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
]