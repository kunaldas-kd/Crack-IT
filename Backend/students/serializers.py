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
        read_only_fields = ['admin', 'institution']


# ── Subject ───────────────────────────────────────────────────────────────────

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subject
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


# ── Exam ──────────────────────────────────────────────────────────────────────

class ExamSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Exam
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


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
        read_only_fields = ['student_id', 'admin', 'institution', 'user']   # Auto-managed

    def create(self, validated_data):
        """
        On student creation:
        1. Generate a unique student_id.
        2. Create the student record.
        """
        from generators.id_generator import generate_student_id
        from django.db import transaction

        with transaction.atomic():
            # Generate student ID if not provided
            if 'student_id' not in validated_data:
                uid = generate_student_id()
                validated_data['student_id'] = uid

            student = super().create(validated_data)
            return student


# ── StudentAcademic ───────────────────────────────────────────────────────────

class StudentAcademicSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.subject_name', read_only=True)  # Display-only

    class Meta:
        model  = StudentAcademic
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


# ── Result ────────────────────────────────────────────────────────────────────

class ResultSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.exam_name', read_only=True)  # Display-only

    class Meta:
        model  = Result
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


# ── Attendance ────────────────────────────────────────────────────────────────

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Attendance
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


# ── Fee ───────────────────────────────────────────────────────────────────────

class FeeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Fee
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


# ── Payment ───────────────────────────────────────────────────────────────────

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = '__all__'
        read_only_fields = ['admin', 'institution']


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
        read_only_fields = ['admin', 'institution']


# ── Student Update ────────────────────────────────────────────────────────────
# Used for PUT/PATCH actions.
# Skips email uniqueness check against the student's own auth user account.

class StudentUpdateSerializer(serializers.ModelSerializer):
    batch_name       = serializers.CharField(source='batch.name', read_only=True)
    institution_name = serializers.CharField(source='institution.name', read_only=True)

    class Meta:
        model            = Student
        fields           = '__all__'
        read_only_fields = ['student_id', 'user', 'admin', 'institution']   # Cannot change ID or auth user after creation