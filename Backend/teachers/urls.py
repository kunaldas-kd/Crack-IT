from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeacherViewSet, SalaryViewSet, TeacherAttendanceViewSet

router = DefaultRouter()
router.register(r'teachers', TeacherViewSet, basename='teacher')
router.register(r'salaries', SalaryViewSet, basename='salary')
router.register(r'attendance', TeacherAttendanceViewSet, basename='teacherattendance')

urlpatterns = [
    path('', include(router.urls)),
]