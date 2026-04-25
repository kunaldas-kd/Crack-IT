from .models import (
    User, UserProfile, UserToken, UserTokenBlacklist, UserTokenRefresh, 
    UserTokenHistory, UserTokenDevice, UserTokenIP, UserTokenSession
)
from rest_framework import serializers, exceptions, status, permissions
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from rest_framework.response import Response

# Serializer for the Custom User model
class UserSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'confirm_password',
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 'last_login'
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login',
            'is_active', 'is_staff', 'is_superuser',  # never writable via API
        ]

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        """
        Overrides the create method to use create_user,
        ensuring the password is hashed correctly.
        """
        validated_data.pop('confirm_password', None)
        # Only pass safe fields to create_user
        user = User.objects.create_user(
            username   = validated_data['username'],
            email      = validated_data['email'],
            password   = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
            last_name  = validated_data.get('last_name', ''),
        )
        return user

# Serializer for the UserProfile model
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'location', 'birth_date', 'institute_name']
        read_only_fields = ['id']

    def create(self, validated_data):
        """Standard create method for UserProfile"""
        profile = UserProfile.objects.create(**validated_data)
        return profile

# Serializer for the UserToken model (Custom Token)
class UserTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserToken
        fields = ['id', 'user', 'Token', 'created']
        read_only_fields = ['id', 'created']

    def create(self, validated_data):
        """Standard create method for UserToken"""
        token = UserToken.objects.create(**validated_data)
        return token
        
# Serializer to track blacklisted tokens
class UserTokenBlacklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTokenBlacklist
        fields = ['id', 'token', 'blacklisted_at']
        read_only_fields = ['id', 'blacklisted_at']

    def create(self, validated_data):
        """Standard create method for UserTokenBlacklist"""
        blacklist = UserTokenBlacklist.objects.create(**validated_data)
        return blacklist
        
# Serializer for Refresh Tokens
class UserTokenRefreshSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTokenRefresh
        fields = ['id', 'user', 'refresh_token', 'created_at', 'expires_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Standard create method for UserTokenRefresh"""
        refresh = UserTokenRefresh.objects.create(**validated_data)
        return refresh  
        
# Serializer for Token History (Audit logs)
class UserTokenHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTokenHistory
        fields = ['id', 'user', 'token', 'created_at', 'expired_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Standard create method for UserTokenHistory"""
        history = UserTokenHistory.objects.create(**validated_data)
        return history
        
# Serializer for Token Device information
class UserTokenDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTokenDevice
        fields = ['id', 'user', 'token', 'device_info', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Standard create method for UserTokenDevice"""
        device = UserTokenDevice.objects.create(**validated_data)
        return device
        
# Serializer for Token IP tracking
class UserTokenIPSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTokenIP
        fields = ['id', 'user', 'token']
        read_only_fields = ['id']

    def create(self, validated_data):
        """Standard create method for UserTokenIP"""
        ip = UserTokenIP.objects.create(**validated_data)
        return ip   

# Serializer for Token Sessions
class UserTokenSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTokenSession
        fields = ['id', 'user', 'token', 'session_id', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Standard create method for UserTokenSession"""
        session = UserTokenSession.objects.create(**validated_data)
        return session
        
# Custom Serializer for JWT Login (Token Obtain Pair)
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        """
        Overrides the validate method to support login via Email or User ID.
        """
        username_or_email = attrs.get(self.username_field)
        if username_or_email and '@' in username_or_email:
            try:
                user_obj = User.objects.get(email=username_or_email)
                attrs[self.username_field] = user_obj.username
            except User.DoesNotExist:
                pass

        data = super().validate(attrs)
        refresh = self.get_token(self.user)
        
        remember = self.initial_data.get('remember', False)
        if remember:
            refresh.set_exp(lifetime=timedelta(days=30))
        else:
            refresh.set_exp(lifetime=timedelta(days=1))
            
        # Include both tokens in the response
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        return data