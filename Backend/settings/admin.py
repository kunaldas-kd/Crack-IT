from django.contrib import admin
from .models import Settings, EnableFeatures

@admin.register(Settings)
class SettingsAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'company_email', 'company_phone')

@admin.register(EnableFeatures)
class EnableFeaturesAdmin(admin.ModelAdmin):
    list_display = ('id',)
