from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from datetime import date
from .models import (
    Subject, Exam, Student, StudentAcademic,
    Result, Attendance, Fee, Payment,
)
from .serializers import (
    SubjectSerializer, ExamSerializer,
    StudentSerializer, StudentDetailSerializer, StudentUpdateSerializer,
    StudentAcademicSerializer, ResultSerializer,
    AttendanceSerializer, FeeSerializer, PaymentSerializer,
)




# ── Subject ───────────────────────────────────────────────────────────────────
# Full CRUD for subjects. Requires authentication.

class SubjectViewSet(viewsets.ModelViewSet):
    queryset           = Subject.objects.all()
    serializer_class   = SubjectSerializer
    permission_classes = [IsAuthenticated]


# ── Exam ──────────────────────────────────────────────────────────────────────
# Full CRUD for exams. Requires authentication.

class ExamViewSet(viewsets.ModelViewSet):
    queryset           = Exam.objects.all()
    serializer_class   = ExamSerializer
    permission_classes = [IsAuthenticated]


# ── Student ───────────────────────────────────────────────────────────────────
# Full CRUD for students with dynamic serializer selection:
#   - list/create  → StudentSerializer
#   - retrieve     → StudentDetailSerializer (nested full profile)
#   - update/patch → StudentUpdateSerializer (skips own-email uniqueness check)

class StudentViewSet(viewsets.ModelViewSet):
    queryset           = Student.objects.select_related('batch', 'institution', 'user').all()
    serializer_class   = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Base queryset with related models pre-fetched to avoid N+1 queries
        qs = Student.objects.select_related('batch', 'institution', 'user')

        # For detail view, prefetch all nested relations for the full profile
        if self.action == 'retrieve':
            qs = qs.prefetch_related(
                'academics__subject',   # Subject marks
                'results__exam',        # Exam results
                'attendance_records',   # Attendance history
                'payments',             # Payment transactions
            )
        return qs

    def get_serializer_class(self):
        """Return the appropriate serializer based on the current action."""
        if self.action == 'retrieve':
            return StudentDetailSerializer       # Full nested profile
        if self.action in ('update', 'partial_update'):
            return StudentUpdateSerializer       # Update-safe serializer
        return StudentSerializer                 # Default for list/create


# ── StudentAcademic ───────────────────────────────────────────────────────────
# Full CRUD for individual subject marks per student. Requires authentication.

class StudentAcademicViewSet(viewsets.ModelViewSet):
    queryset           = StudentAcademic.objects.all()
    serializer_class   = StudentAcademicSerializer
    permission_classes = [IsAuthenticated]


# ── Result ────────────────────────────────────────────────────────────────────
# Full CRUD for exam results per student. Requires authentication.

class ResultViewSet(viewsets.ModelViewSet):
    queryset           = Result.objects.all()
    serializer_class   = ResultSerializer
    permission_classes = [IsAuthenticated]


# ── Attendance ────────────────────────────────────────────────────────────────
# Full CRUD for daily attendance records. Requires authentication.

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset           = Attendance.objects.all()
    serializer_class   = AttendanceSerializer
    permission_classes = [IsAuthenticated]


# ── Fee ───────────────────────────────────────────────────────────────────────
# Full CRUD for student fee records (one per student). Requires authentication.

class FeeViewSet(viewsets.ModelViewSet):
    queryset           = Fee.objects.all()
    serializer_class   = FeeSerializer
    permission_classes = [IsAuthenticated]


# ── Payment ───────────────────────────────────────────────────────────────────
# Full CRUD for individual payment transactions. Requires authentication.

class PaymentViewSet(viewsets.ModelViewSet):
    queryset           = Payment.objects.all()
    serializer_class   = PaymentSerializer
    permission_classes = [IsAuthenticated]