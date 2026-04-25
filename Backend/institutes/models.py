from django.db import models
from django.conf import settings
from generators.id_generator import generate_institution_id

User = settings.AUTH_USER_MODEL

class Institute(models.Model):
    name = models.CharField(max_length=255)
    registration_code = models.CharField(
        max_length=100,
        unique=True,
        default=generate_institution_id,  # Auto-generated on creation
        editable=False,
    )
    contact_email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Feature & Settings Linking
    settings_profile = models.OneToOneField('settings.Settings', on_delete=models.SET_NULL, null=True, blank=True, related_name='institute')
    features = models.OneToOneField('settings.EnableFeatures', on_delete=models.SET_NULL, null=True, blank=True, related_name='institute')
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
