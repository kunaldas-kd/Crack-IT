from rest_framework import serializers
from .models import Settings, EnableFeatures

class ListEnableFeaturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnableFeatures
        fields = '__all__'

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = '__all__'

class EnableFeaturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnableFeatures
        fields = '__all__'

