from django.db import models
from django.conf import settings
from batch.models import Batch
from institutes.models import Institute
User = settings.AUTH_USER_MODEL




# ── Batch ─────────────────────────────────────────────────────────────────────
# A batch groups students under a common program/duration (e.g. "BCA 2023").

# class Batch(models.Model):
#     batch_name = models.CharField(max_length=255)   # e.g. "BCA 2023-26"
#     duration   = models.CharField(max_length=100)   # e.g. "3 Years"

#     def __str__(self):
#         return self.batch_name


# ── Subject ───────────────────────────────────────────────────────────────────
# A subject belongs to a specific batch and semester.

class Subject(models.Model):
    subject_name = models.CharField(max_length=255)
    batch        = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='subjects')  # Parent batch
    semester     = models.IntegerField()                                                         # Semester number

    def __str__(self):
        return f"{self.subject_name} ({self.batch.name})"


# ── Exam ──────────────────────────────────────────────────────────────────────
# An exam is tied to a batch and semester with a scheduled date.

class Exam(models.Model):
    exam_name = models.CharField(max_length=255)
    batch     = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name='exams')  # Parent batch
    semester  = models.IntegerField()
    exam_date = models.DateField()

    def __str__(self):
        return f"{self.exam_name} ({self.batch.name})"


# ── Student ───────────────────────────────────────────────────────────────────
# Core model representing a student. Optionally linked to a Django auth User
# for login access, and to a Batch and Institution.

class Student(models.Model):
    GENDER_CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Other', 'Other'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Graduated', 'Graduated'),
    )

    # Optional link to Django's auth user (for login)
    user = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='student_profile',
    )

    student_id     = models.CharField(max_length=50, unique=True)          # Auto-generated unique student ID
    first_name     = models.CharField(max_length=100)
    last_name      = models.CharField(max_length=100)
    gender         = models.CharField(max_length=20, choices=GENDER_CHOICES)
    date_of_birth  = models.DateField()
    email          = models.EmailField(unique=True)
    phone          = models.CharField(max_length=20)
    address        = models.TextField()
    admission_date = models.DateField()
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')

    # Academic grouping
    batch       = models.ForeignKey(
        Batch, on_delete=models.SET_NULL, null=True, blank=True, related_name='students',
    )
    # Institutional affiliation
    institution = models.ForeignKey(
        Institute, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='students',
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.student_id})"

    @property
    def active_features(self):
        return self.institution.features if self.institution else None

    @property
    def active_settings(self):
        return self.institution.settings_profile if self.institution else None


# ── StudentAcademic ───────────────────────────────────────────────────────────
# Stores marks and grade for a student in a specific subject and semester.

class StudentAcademic(models.Model):
    student  = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='academics')
    subject  = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='student_academics')
    semester = models.IntegerField()
    marks    = models.IntegerField()
    grade    = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.student.student_id} - {self.subject.subject_name}"


# ── Result ────────────────────────────────────────────────────────────────────
# Stores the overall result of a student for a particular exam.

class Result(models.Model):
    student        = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    exam           = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    total_marks    = models.IntegerField()
    obtained_marks = models.IntegerField()
    percentage     = models.DecimalField(max_digits=5, decimal_places=2)
    grade          = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.student.student_id} - {self.exam.exam_name}"


# ── Attendance ────────────────────────────────────────────────────────────────
# Tracks daily attendance status for each student.

class Attendance(models.Model):
    STATUS_CHOICES = (
        ('Present',  'Present'),
        ('Absent',   'Absent'),
        ('Late',     'Late'),
        ('Half Day', 'Half Day'),
    )
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    date    = models.DateField()
    status  = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.student.student_id} - {self.date} - {self.status}"


# ── Fee ───────────────────────────────────────────────────────────────────────
# One-to-one fee record per student tracking total, paid, and due amounts.

class Fee(models.Model):
    STATUS_CHOICES = (
        ('Paid',    'Paid'),
        ('Partial', 'Partial'),
        ('Unpaid',  'Unpaid'),
    )
    student        = models.OneToOneField(Student, on_delete=models.CASCADE, related_name='fees')
    total_fee      = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount    = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    due_amount     = models.DecimalField(max_digits=10, decimal_places=2)
    payment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Unpaid')

    def __str__(self):
        return f"Fees for {self.student.student_id}"


# ── Payment ───────────────────────────────────────────────────────────────────
# Individual payment transactions made by a student.

class Payment(models.Model):
    student      = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount       = models.DecimalField(max_digits=10, decimal_places=2)
    payment_date = models.DateField()
    method       = models.CharField(max_length=50)   # e.g. "Cash", "UPI", "Bank Transfer"

    def __str__(self):
        return f"Payment {self.id} - {self.student.student_id}"