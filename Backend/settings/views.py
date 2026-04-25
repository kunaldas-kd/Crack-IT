from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateAPIView, CreateAPIView
from rest_framework.response import Response
from .models import Settings, EnableFeatures
from .serializers import SettingsSerializer, EnableFeaturesSerializer, ListEnableFeaturesSerializer



class SettingsView(ListCreateAPIView):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if response.data:
            return response
        return Response({
            'message': 'No settings found'
        })
class SettingsUpdateView(RetrieveUpdateAPIView):
    queryset = Settings.objects.all()
    serializer_class = SettingsSerializer
    lookup_field = 'pk'

class EnableFeaturesView(ListCreateAPIView):
    queryset = EnableFeatures.objects.all()
    serializer_class = EnableFeaturesSerializer
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        if response.data:
            return response
        return Response({
            'message': 'No feature flags found'
        })
    
class EnableFeaturesUpdateView(RetrieveUpdateAPIView):
    queryset = EnableFeatures.objects.all()
    serializer_class = EnableFeaturesSerializer
    lookup_field = 'pk'

class ListEnableFeaturesView(ListAPIView):
    queryset = EnableFeatures.objects.all()
    serializer_class = ListEnableFeaturesSerializer
