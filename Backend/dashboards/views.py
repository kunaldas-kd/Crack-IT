from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

# Old models for institutes and teachers
from institutes.models import Institute
# New models for students, batches, and attendance
from students.models import Student, Batch, Attendance

class DashboardSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        institutes_qs = Institute.objects.all()
        students_qs = Student.objects.all()
        batches_qs = Batch.objects.all()
        attendances_qs = Attendance.objects.all()
        
        # Apply tenant filtering
        if not getattr(user, 'is_superuser', False):
            if user.institutes.exists():
                admin_id = user.id
                institutes_qs = institutes_qs.filter(admin=user)
                students_qs = students_qs.filter(admin_id=admin_id)
                batches_qs = batches_qs.filter(admin_id=admin_id)
                attendances_qs = attendances_qs.filter(admin_id=admin_id)
            elif hasattr(user, 'userprofile') and user.userprofile.institute:
                inst = user.userprofile.institute
                institutes_qs = institutes_qs.filter(id=inst.id)
                students_qs = students_qs.filter(admin_id=inst.admin_id, institution_id=inst.id)
                batches_qs = batches_qs.filter(admin_id=inst.admin_id, institution_id=inst.id)
                attendances_qs = attendances_qs.filter(admin_id=inst.admin_id, institution_id=inst.id)
            else:
                institutes_qs = Institute.objects.none()
                students_qs = Student.objects.none()
                batches_qs = Batch.objects.none()
                attendances_qs = Attendance.objects.none()

        data = {
            "total_institutes": institutes_qs.count(),
            "total_students": students_qs.count(),
            "total_batches": batches_qs.count(),
            "total_teachers": 0, # Placeholder or from Teacher model if added
            "total_attendances_recorded": attendances_qs.count(),
            "recent_activity": [
                {
                    "id": a.id,
                    "student_name": f"{a.student.first_name} {a.student.last_name}",
                    "student_id": a.student.student_id,
                    "time": a.date.strftime("%Y-%m-%d"),
                    "status": a.status
                } for a in attendances_qs.select_related('student').order_by('-id')[:5]
            ]
        }
            
        return Response(data, status=status.HTTP_200_OK)


