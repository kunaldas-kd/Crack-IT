from rest_framework import viewsets
from institutes.views import TenantAwareViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Teacher, Salary, TeacherAttendance
from .serializers import TeacherSerializer, SalarySerializer, TeacherAttendanceSerializer

class TeacherViewSet(TenantAwareViewSet):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    # permission_classes intentionally not overridden — inherits [IsAuthenticated, IsTenantOwnerOrStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'retrieve':
            qs = qs.prefetch_related('attendance_records', 'salary_set')
        return qs

class SalaryViewSet(TenantAwareViewSet):
    queryset = Salary.objects.all()
    serializer_class = SalarySerializer

class TeacherAttendanceViewSet(TenantAwareViewSet):
    queryset = TeacherAttendance.objects.all()
    serializer_class = TeacherAttendanceSerializer
