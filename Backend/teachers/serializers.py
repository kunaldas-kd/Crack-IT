from rest_framework import serializers
from .models import Teacher, Salary, TeacherAttendance

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'
        read_only_fields = ['admin', 'institution']

class SalarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Salary
        fields = '__all__'
        read_only_fields = ['admin', 'institution']

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherAttendance
        fields = '__all__'
        read_only_fields = ['admin', 'institution']