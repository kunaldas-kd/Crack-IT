from django.db import models
from datetime import date, timedelta
from institutes.models import TenantAwareModel

class Batch(TenantAwareModel):
    name = models.CharField(max_length=100)
    start_date = models.DateField(default=date.today)
    duration_weeks = models.PositiveIntegerField(
        null=True, blank=True,
        help_text="Optional batch duration in weeks. Leave blank for open-ended batches."
    )
    end_date = models.DateField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.duration_weeks:
            self.end_date = self.start_date + timedelta(weeks=self.duration_weeks)
        super().save(*args, **kwargs)
    max_students = models.IntegerField()
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('inactive', 'Inactive')]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def active_features(self):
        return self.institution.features if self.institution else None

    @property
    def active_settings(self):
        return self.institution.settings_profile if self.institution else None