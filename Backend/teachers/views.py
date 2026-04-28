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

class SalaryViewSet(viewsets.ModelViewSet):
    """
    Salary records are scoped through their parent Teacher's tenant fields.
    We filter by the tenant-owned teachers instead of a direct admin_id field.
    """
    serializer_class = SalarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from institutes.views import get_tenant_context
        user = self.request.user
        if getattr(user, 'is_superuser', False):
            return Salary.objects.select_related('teacher').all()
        admin_id, inst_id = get_tenant_context(user)
        if admin_id and inst_id:
            return Salary.objects.select_related('teacher').filter(
                teacher__admin_id=admin_id, teacher__institution_id=inst_id
            )
        return Salary.objects.none()

class TeacherAttendanceViewSet(viewsets.ModelViewSet):
    """
    Attendance records are scoped through their parent Teacher's tenant fields.
    """
    serializer_class = TeacherAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from institutes.views import get_tenant_context
        user = self.request.user
        if getattr(user, 'is_superuser', False):
            return TeacherAttendance.objects.select_related('teacher').all()
        admin_id, inst_id = get_tenant_context(user)
        if admin_id and inst_id:
            return TeacherAttendance.objects.select_related('teacher').filter(
                teacher__admin_id=admin_id, teacher__institution_id=inst_id
            )
        return TeacherAttendance.objects.none()
