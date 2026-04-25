from rest_framework import serializers
from .models import (
    Subject, Exam, Student, StudentAcademic,
    Result, Attendance, Fee, Payment,
)
from institutes.models import Institute
from batch.models import Batch

from institutes.serializers import InstituteSerializer


# ── Batch ─────────────────────────────────────────────────────────────────────

class BatchSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Batch
        fields = '__all__'


# ── Subject ───────────────────────────────────────────────────────────────────

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subject
        fields = '__all__'


# ── Exam ──────────────────────────────────────────────────────────────────────

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Exam
        fields = '__all__'


# ── Student (Create) ──────────────────────────────────────────────────────────
# Used for listing and creating students.
# Auto-generates student_id and a Django auth User on create,
# then sends login credentials via email.

class StudentSerializer(serializers.ModelSerializer):
    # Read-only display fields derived from related models
    batch_name       = serializers.CharField(source='batch.name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model            = Student
        fields           = '__all__'
        read_only_fields = ['student_id']   # Auto-generated; never set by client

    def validate_email(self, value):
        """Ensure no existing auth user already has this email."""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        """
        On student creation:
        1. Generate a unique student_id.
        2. Create a linked Django auth User with a random temp password.
        3. Send credentials to the student's email.
        """
        from generators.id_generator import generate_student_id
        from generators.email_service import send_credentials_email
        from django.db import transaction
        from django.contrib.auth import get_user_model
        import random, string

        User = get_user_model()

        with transaction.atomic():
            # Generate student ID if not provided
            if 'student_id' not in validated_data:
                uid = generate_student_id()
                validated_data['student_id'] = uid
            else:
                uid = validated_data['student_id']

            # Generate a random 8-character temporary password
            chars         = string.ascii_letters + string.digits
            temp_password = ''.join(random.choice(chars) for _ in range(8))

            # Create the auth user linked to this student
            user = User.objects.create_user(
                username=uid,
                email=validated_data.get('email', ''),
                password=temp_password,
            )
            validated_data['user'] = user

            student   = super().create(validated_data)
            full_name = f"{validated_data.get('first_name','')} {validated_data.get('last_name','')}".strip()

            # Email the student their login credentials
            send_credentials_email(
                to_email=validated_data.get('email', ''),
                user_name=full_name,
                uid=uid,
                password=temp_password,
                role="Student",
            )
            return student


# ── StudentAcademic ───────────────────────────────────────────────────────────

class StudentAcademicSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)  # Display-only

    class Meta:
        model  = StudentAcademic
        fields = '__all__'


# ── Result ────────────────────────────────────────────────────────────────────

class ResultSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.exam_name', read_only=True)  # Display-only

    class Meta:
        model  = Result
        fields = '__all__'


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Attendance
        fields = '__all__'


# ── Fee ───────────────────────────────────────────────────────────────────────

class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Fee
        fields = '__all__'


# ── Payment ───────────────────────────────────────────────────────────────────

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = '__all__'


# ── Student Detail ────────────────────────────────────────────────────────────
# Used for the retrieve (GET single) action.
# Returns fully nested related data for a complete student profile view.

class StudentDetailSerializer(serializers.ModelSerializer):
    batch_name         = serializers.CharField(source='batch.name', read_only=True)
    institution_name   = serializers.CharField(source='institution.name', read_only=True)
    academics          = StudentAcademicSerializer(many=True, read_only=True)       # All subject marks
    results            = ResultSerializer(many=True, read_only=True)                # All exam results
    attendance_records = AttendanceSerializer(many=True, read_only=True)            # Full attendance history
    fees               = FeeSerializer(read_only=True)                              # Fee summary (one-to-one)
    payments           = PaymentSerializer(many=True, read_only=True)               # All payment transactions

    class Meta:
        model  = Student
        fields = '__all__'


# ── Student Update ────────────────────────────────────────────────────────────
# Used for PUT/PATCH actions.
# Skips email uniqueness check against the student's own auth user account.

class StudentUpdateSerializer(serializers.ModelSerializer):
    batch_name       = serializers.CharField(source='batch.name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model            = Student
        fields           = '__all__'
        read_only_fields = ['student_id', 'user']   # Cannot change ID or auth user after creation

    def validate_email(self, value):
        """Allow the student to keep their own email; only reject if another user has it."""
        from django.contrib.auth import get_user_model
        User     = get_user_model()
        instance = self.instance
        qs       = User.objects.filter(email=value)
        if instance and instance.user:
            qs = qs.exclude(pk=instance.user.pk)   # Exclude self from uniqueness check
        if qs.exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value