"""
Management command: fix_tenant_data
------------------------------------
Assigns admin and institution to any existing records that were created
before the TenantAwareModel migration and therefore have NULL tenant fields.

Usage:
    python manage.py fix_tenant_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


def fix_model(model_class, label, user, institute):
    """Bulk-update orphan rows in a TenantAwareModel table."""
    qs = model_class.objects.filter(admin__isnull=True)
    count = qs.count()
    if count:
        qs.update(admin=user, institution=institute)
        print(f"  ✓ Fixed {count} {label} record(s)")
    else:
        print(f"  — {label}: nothing to fix")


class Command(BaseCommand):
    help = "Assign admin/institution to orphan records that predate the TenantAwareModel migration"

    def handle(self, *args, **options):
        from institutes.models import Institute

        # ── Step 1: Fix orphan Institute records (admin = NULL) ────────────────
        # Find the first active superuser or staff user to be the institute owner.
        owner = None
        for user in User.objects.filter(is_active=True).order_by('date_joined'):
            if user.is_superuser or user.institutes.exists():
                owner = user
                break

        # If no superuser, just take the first active user
        if owner is None:
            owner = User.objects.filter(is_active=True).order_by('date_joined').first()

        if owner is None:
            self.stderr.write("No active user found. Create a user first.")
            return

        orphan_institutes = Institute.objects.filter(admin__isnull=True)
        if orphan_institutes.exists():
            orphan_institutes.update(admin=owner)
            self.stdout.write(
                f"  ✓ Fixed {orphan_institutes.count()} Institute(s) → admin='{owner.username}'"
            )
        else:
            self.stdout.write("  — Institutes: nothing to fix")

        # Re-resolve institute now that admin is set
        institute = owner.institutes.first()
        if institute is None:
            self.stderr.write(
                "Still no institute found for this user after fixing. "
                "Please create an institute through the UI and re-run."
            )
            return

        self.stdout.write(
            f"\nUsing admin='{owner.username}', institute='{institute.name}' "
            f"to fix orphan records...\n"
        )

        # ── Step 2: Fix all other TenantAwareModel tables ─────────────────────
        from batch.models import Batch
        from students.models import Student

        fix_model(Batch,   "Batch",   owner, institute)
        fix_model(Student, "Student", owner, institute)

        try:
            from teachers.models import Teacher
            fix_model(Teacher, "Teacher", owner, institute)
        except ImportError:
            pass

        self.stdout.write(self.style.SUCCESS("\n✅ All orphan records fixed. Refresh your browser."))
