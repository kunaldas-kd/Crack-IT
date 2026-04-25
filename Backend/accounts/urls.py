from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import (
    register,
    verify_otp,
    resend_otp,
    otp_login_request,
    otp_login_verify,
    logout,
    profile,
    UserList,
    UserDetail,
    CustomTokenObtainPairView
)

urlpatterns = [
    # Authentication
    path('register/',          register,                            name='register'),
    path('verify-otp/',        verify_otp,                          name='verify_otp'),
    path('resend-otp/',        resend_otp,                          name='resend_otp'),
    path('login/',             CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/otp/request/', otp_login_request,                   name='otp_login_request'),
    path('login/otp/verify/',  otp_login_verify,                    name='otp_login_verify'),
    path('logout/',            logout,                              name='logout'),

    # JWT Token management
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/',  TokenVerifyView.as_view(),  name='token_verify'),

    # Profile
    path('profile/', profile, name='profile'),

    # Administrative
    path('users/',          UserList.as_view(),   name='user_list'),
    path('users/<int:pk>/', UserDetail.as_view(), name='user_detail'),
]
