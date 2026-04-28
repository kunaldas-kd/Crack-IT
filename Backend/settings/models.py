from django.db import models
from institutes.models import TenantAwareModel

class Settings(TenantAwareModel):
    id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=100)
    company_logo = models.ImageField(upload_to='logo/')
    company_address = models.CharField(max_length=255)
    company_phone = models.CharField(max_length=15)
    company_email = models.EmailField()
    company_website = models.URLField()
    
    def __str__(self):
        return self.company_name
        
    class Meta:
        verbose_name = "Settings"
        verbose_name_plural = "Settings"


class EnableFeatures(TenantAwareModel):
    Student_Management = models.BooleanField(default=True)
    Staff_Management = models.BooleanField(default=True)
    Course_and_Batch_Management = models.BooleanField(default=True)
    Attendance = models.BooleanField(default=True)
    Fee_Management = models.BooleanField(default=True)
    Examination_and_Results = models.BooleanField(default=True)
    Homework_and_Assignments = models.BooleanField(default=True)
    Communication_SMS_Email = models.BooleanField(default=True)
    Reports_and_Analytics = models.BooleanField(default=True)

    Event_and_Calendar = models.BooleanField(default=True)
    Document_Management = models.BooleanField(default=True)
    Mobile_App_Access = models.BooleanField(default=True)
    Online_Fee_Payment = models.BooleanField(default=True)
    Auto_Late_Fee = models.BooleanField(default=True)
    Biometric_Attendance = models.BooleanField(default=True)
    
    QR_Attendance = models.BooleanField(default=True)
    Report_Card_PDF = models.BooleanField(default=True)
    Bulk_Data_Upload = models.BooleanField(default=True)
    ID_Card_Generation = models.BooleanField(default=True)
    Parent_Portal = models.BooleanField(default=True)
    
    SMS_Notifications = models.BooleanField(default=True)
    Email_Notifications = models.BooleanField(default=True)
    WhatsApp_Notifications = models.BooleanField(default=True)
    In_App_Messaging = models.BooleanField(default=True)
    Announcements = models.BooleanField(default=True)
    
    Multi_Institution_Support = models.BooleanField(default=True)
    Multi_Branch_Management = models.BooleanField(default=True)
    Custom_Branding = models.BooleanField(default=True)
    Custom_Domain = models.BooleanField(default=True)
    API_Access = models.BooleanField(default=True)
    Data_Export = models.BooleanField(default=True)
    
    Student_Limit = models.BooleanField(default=True)
    Staff_Limit = models.BooleanField(default=True)
    Storage_Limit = models.BooleanField(default=True)
    Branch_Limit = models.BooleanField(default=True)
    Admin_User_Limit = models.BooleanField(default=True)
    
    Advanced_Analytics = models.BooleanField(default=True)
    Automated_Reports = models.BooleanField(default=True)
    Payment_Gateway_Integration = models.BooleanField(default=True)
    CRM_and_Lead_Management = models.BooleanField(default=True)
    SMS_Gateway_Integration = models.BooleanField(default=True)
    
    Email_Service_Integration = models.BooleanField(default=True)
    WhatsApp_API_Integration = models.BooleanField(default=True)
    Biometric_Integration = models.BooleanField(default=True)
    
    Role_Based_Access = models.BooleanField(default=True)
    Activity_Logs = models.BooleanField(default=True)
    Backup_and_Restore = models.BooleanField(default=True)
    Two_Factor_Authentication_Security = models.BooleanField(default=True)
    Face_Recognition_Attendance = models.BooleanField(default=True)
    Online_Classes = models.BooleanField(default=True)
    E_learning = models.BooleanField(default=True)

    def __str__(self):
        return f"Feature Flags {self.id}"

    class Meta:
        verbose_name = "Feature Flag"
        verbose_name_plural = "Feature Flags"
