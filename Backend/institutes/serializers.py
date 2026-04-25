from rest_framework import serializers
from .models import Institute

class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institute
        fields = '__all__'
        read_only_fields = ['registration_code']  # Auto-generated, not user-supplied
