from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from .models import User, UserProfile, OTPRecord
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    CustomTokenObtainPairSerializer
)
from generators.id_generator import generate_admin_id
from generators.otp_service import generate_otp as otp_generator
from generators.email_service import send_otp_email, send_credentials_email

# ─── Helpers ──────────────────────────────────────────────────────────────────



# ─── Auth Views ───────────────────────────────────────────────────────────────
class CustomTokenObtainPairView(TokenObtainPairView):
    """Standard JWT Login View using custom serializer."""
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Registers a new user (inactive), generates OTP, and sends verification email.
    POST /api/v1/accounts/register/
    Body: { first_name, last_name, email, password, confirm_password }
    """
    # Overwrite any incoming username with a securely generated User ID (uid)
    data = request.data.copy()
    data['username'] = generate_admin_id()

    serializer = UserSerializer(data=data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Create user as inactive until OTP is verified
    user = serializer.save()
    user.is_active = False
    user.save()

    # Create user profile with optional institute name
    institute_name = request.data.get('institute_name', '').strip()
    UserProfile.objects.create(user=user, institute_name=institute_name)

    # Generate & persist OTP
    otp_code, _ = otp_generator()
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    OTPRecord.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)

    # Send email (if EMAIL_HOST_USER is configured)
    try:
        send_otp_email(user.email, otp_code, user.first_name or user.username)
        email_sent = True
        if email_sent == True:
            send_credentials_email(
                to_email=user.email, 
                user_name=user.first_name or user.username, 
                uid=user.username, 
                password=request.data.get('password')
        )
            email_sent = True
        else:
            email_sent = False
    except Exception:
        email_sent = False  # Don't block registration if email fails in dev
    
    # try:
    #     # Pass the raw password from request.data, because user.password is already hashed
    #     send_credentials_email(
    #         to_email=user.email, 
    #         user_name=user.first_name or user.username, 
    #         uid=user.username, 
    #         password=request.data.get('password')
    #     )
    #     email_sent = True
    # except Exception:
    #     email_sent = False
    return Response({
        'message':    'Registration successful. Please check your email for the OTP.',
        'email':      user.email,
        'email_sent': email_sent,
        # ← Only expose OTP in DEBUG mode (dev convenience)
        **({"otp": otp_code} if settings.DEBUG else {}),
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verifies the OTP and activates the user account.
    POST /api/v1/accounts/verify-otp/
    Body: { email, otp_code }
    """
    email    = request.data.get('email', '').strip()
    otp_code = request.data.get('otp_code', '').strip()

    if not email or not otp_code:
        return Response({'error': 'Email and OTP code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'No account found with this email.'}, status=status.HTTP_404_NOT_FOUND)

    # Fetch the latest unused OTP for this user
    record = OTPRecord.objects.filter(user=user, is_verified=False).order_by('-created_at').first()

    if not record:
        return Response({'error': 'No pending OTP found. Please register again.'}, status=status.HTTP_400_BAD_REQUEST)

    if record.is_expired():
        return Response({'error': 'OTP has expired. Please request a new one.'}, status=status.HTTP_400_BAD_REQUEST)

    if record.otp_code != otp_code:
        return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Mark as verified and activate user
    record.is_verified = True
    record.save()

    user.is_active = True
    user.save()

    return Response({'message': 'Email verified successfully! You can now log in.'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resends a new OTP to the user's email.
    POST /api/v1/accounts/resend-otp/
    Body: { email }
    """
    email = request.data.get('email', '').strip()
    try:
        user = User.objects.get(email=email, is_active=False)
    except User.DoesNotExist:
        return Response({'error': 'No pending account found with this email.'}, status=status.HTTP_404_NOT_FOUND)

    # Invalidate old OTPs
    OTPRecord.objects.filter(user=user, is_verified=False).update(is_verified=True)

    # Generate new one
    otp_code, _ = otp_generator()
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    OTPRecord.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)

    try:
        send_otp_email(user.email, otp_code, user.first_name or user.username)
    except Exception:
        pass

    return Response({
        'message': 'A new OTP has been sent to your email.',
        **({"otp": otp_code} if settings.DEBUG else {}),
    }, status=status.HTTP_200_OK)
@api_view(['POST'])
@permission_classes([AllowAny])
def otp_login_request(request):
    """
    Init line for OTP-based login. Validates email/UID, generates OTP and emails it.
    POST /api/v1/accounts/login/otp/request/
    Body: { identifier }
    """
    identifier = request.data.get('identifier', '').strip()
    if not identifier:
        return Response({'error': 'Please provide an email or User ID.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if '@' in identifier:
            user = User.objects.get(email=identifier)
        else:
            user = User.objects.get(username=identifier)
    except User.DoesNotExist:
        return Response({'error': 'No account found with this identifier.'}, status=status.HTTP_404_NOT_FOUND)

    if not user.is_active:
        return Response({'error': 'This account is inactive. Please verify it first.'}, status=status.HTTP_403_FORBIDDEN)

    # Invalidate old OTPs for login
    OTPRecord.objects.filter(user=user, is_verified=False).update(is_verified=True)

    # Generate new one
    otp_code, _ = otp_generator()
    expires_at = timezone.now() + timedelta(minutes=settings.OTP_EXPIRY_MINUTES)
    OTPRecord.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)

    try:
        send_otp_email(user.email, otp_code, user.first_name or user.username)
    except Exception:
        pass

    return Response({
        'message': f'A secure OTP has been sent to your registered email.',
        **({"otp": otp_code} if settings.DEBUG else {}),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def otp_login_verify(request):
    """
    Verifies the OTP explicitly for login and returns JWT Tokens.
    POST /api/v1/accounts/login/otp/verify/
    Body: { identifier, otp_code }
    """
    identifier = request.data.get('identifier', '').strip()
    otp_code   = request.data.get('otp_code', '').strip()

    if not identifier or not otp_code:
        return Response({'error': 'Identifier and OTP code are required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if '@' in identifier:
            user = User.objects.get(email=identifier)
        else:
            user = User.objects.get(username=identifier)
    except User.DoesNotExist:
        return Response({'error': 'No account found.'}, status=status.HTTP_404_NOT_FOUND)

    # Find the latest unused OTP
    record = OTPRecord.objects.filter(user=user, is_verified=False).order_by('-created_at').first()

    if not record:
        return Response({'error': 'No pending OTP request found.'}, status=status.HTTP_400_BAD_REQUEST)

    if record.is_expired():
        return Response({'error': 'OTP has expired.'}, status=status.HTTP_400_BAD_REQUEST)

    if record.otp_code != otp_code:
        return Response({'error': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

    # Success: Mark verified
    record.is_verified = True
    record.save()

    # Generate JWT Tokens
    refresh = RefreshToken.for_user(user)
    
    remember = request.data.get('remember', False)
    if remember:
        refresh.set_exp(lifetime=timedelta(days=30))
    else:
        refresh.set_exp(lifetime=timedelta(days=1))
    
    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """Logout by blacklisting the refresh token."""
    refresh_token = request.data.get('refresh_token')
    if not refresh_token:
        return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'User logged out successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Retrieve or update the authenticated user's profile."""
    try:
        profile_obj = request.user.userprofile
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response(UserProfileSerializer(profile_obj).data, status=status.HTTP_200_OK)

    serializer = UserProfileSerializer(profile_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserList(generics.ListCreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAdminUser]


class UserDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset           = User.objects.all()
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAdminUser]
