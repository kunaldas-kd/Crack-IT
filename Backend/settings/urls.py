from django.urls import path
from .views import (
    ListEnableFeaturesView, 
    SettingsView, 
    SettingsUpdateView, 
    EnableFeaturesView, 
    EnableFeaturesUpdateView,
)

urlpatterns = [
    path('settings/', SettingsView.as_view(), name='settings'),
    path('settings/<int:pk>/', SettingsUpdateView.as_view(), name='settings-update'),
    path('enable-features/', EnableFeaturesView.as_view(), name='enable-features'),
    path('enable-features/<int:pk>/', EnableFeaturesUpdateView.as_view(), name='enable-features-update'),
    path('list-enable-features/', ListEnableFeaturesView.as_view(), name='list-enable-features'),
]