from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Old models for institutes and teachers
from institutes.models import Institute
# New models for students, batches, and attendance
from students.models import Student, Batch, Attendance

class DashboardSummaryView(APIView):
    authentication_classes = []  # For demo purposes
    permission_classes = []

    def get(self, request):
        # We fetch aggregated metrics spanning the real models.
        data = {
            "total_institutes": Institute.objects.count(),
            "total_students": Student.objects.count(),
            "total_batches": Batch.objects.count(),
            "total_teachers": 0, # Placeholder or from Teacher model if added
            "total_attendances_recorded": Attendance.objects.count(),
            "recent_activity": [
                {
                    "id": a.id,
                    "student_name": f"{a.student.first_name} {a.student.last_name}",
                    "student_id": a.student.student_id,
                    "time": a.date.strftime("%Y-%m-%d"), # Adjust if you added time field, otherwise using date
                    "status": a.status
                } for a in Attendance.objects.select_related('student').order_by('-id')[:5]
            ]
        }
            
        return Response(data, status=status.HTTP_200_OK)


