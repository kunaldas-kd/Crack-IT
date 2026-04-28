from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SubjectViewSet, ExamViewSet,
    StudentViewSet, StudentAcademicViewSet, ResultViewSet,
    AttendanceViewSet, FeeViewSet, PaymentViewSet,
)

router = DefaultRouter()
router.register(r'subjects',          SubjectViewSet,         basename='subject')
router.register(r'exams',             ExamViewSet,            basename='exam')
router.register(r'', StudentViewSet, basename='student')
router.register(r'student-academics', StudentAcademicViewSet, basename='studentacademic')
router.register(r'results',           ResultViewSet,          basename='result')
router.register(r'attendance',        AttendanceViewSet,      basename='attendance')
router.register(r'fees',              FeeViewSet,             basename='fee')
router.register(r'payments',          PaymentViewSet,         basename='payment')

urlpatterns = [
    path('', include(router.urls)),
]
