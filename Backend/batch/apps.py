from django.apps import AppConfig
import sys

class BatchConfig(AppConfig):
    name = 'batch'

    def ready(self):
        # Only run this once, not in management commands like migrate/makemigrations
        if 'runserver' not in sys.argv:
            return
            
        try:
            from institutes.models import Institute
            from batch.models import Batch
            from students.models import Student
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            owner = User.objects.filter(is_active=True).first()
            
            if owner:
                Institute.objects.filter(admin__isnull=True).update(admin=owner)
                inst = owner.institutes.first()
                if inst:
                    Batch.objects.filter(admin__isnull=True).update(admin=owner, institution=inst)
                    Student.objects.filter(admin__isnull=True).update(admin=owner, institution=inst)
        except Exception:
            pass
