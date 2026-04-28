from django.db import models
from institutes.models import Institute, TenantAwareModel

class Teacher(TenantAwareModel):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def active_features(self):
        return self.institute.features if self.institute else None

    @property
    def active_settings(self):
        return self.institute.settings_profile if self.institute else None

class Salary(TenantAwareModel):
    Salary_id = models.CharField(max_length=50, unique=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    hra = models.DecimalField(max_digits=10, decimal_places=2)
    ta = models.DecimalField(max_digits=10, decimal_places=2)
    da = models.DecimalField(max_digits=10, decimal_places=2)
    pf = models.DecimalField(max_digits=10, decimal_places=2)
    pt = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.Salary_id

class TeacherAttendance(TenantAwareModel):
    STATUS_CHOICES = (
        ('Present',  'Present'),
        ('Absent',   'Absent'),
        ('Late',     'Late'),
        ('Half Day', 'Half Day'),
    )
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='attendance_records')
    date    = models.DateField()
    status  = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.teacher.name} - {self.date} - {self.status}"