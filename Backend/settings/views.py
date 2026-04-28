from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Settings, EnableFeatures
from .serializers import SettingsSerializer, EnableFeaturesSerializer, ListEnableFeaturesSerializer
from institutes.views import TenantAwareMixin



class SettingsView(TenantAwareMixin, ListCreateAPIView):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if response.data:
            return response
        return Response({
            'message': 'No settings found'
        })

class SettingsUpdateView(TenantAwareMixin, RetrieveUpdateAPIView):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer
    lookup_field = 'pk'

class EnableFeaturesView(TenantAwareMixin, ListCreateAPIView):
    queryset = EnableFeatures.objects.all()
    serializer_class = EnableFeaturesSerializer
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if response.data:
            return response
        return Response({
            'message': 'No feature flags found'
        })
    
class EnableFeaturesUpdateView(TenantAwareMixin, RetrieveUpdateAPIView):
    queryset = EnableFeatures.objects.all()
    serializer_class = EnableFeaturesSerializer
    lookup_field = 'pk'

class ListEnableFeaturesView(ListAPIView):
    """
    Public endpoint — used by the frontend FeatureContext before authentication
    to determine which navigation items and features should be displayed.
    No tenant filtering needed here; all enabled features are visible.
    """
    queryset = EnableFeatures.objects.all().order_by('id')
    serializer_class = ListEnableFeaturesSerializer
    permission_classes = [AllowAny]
