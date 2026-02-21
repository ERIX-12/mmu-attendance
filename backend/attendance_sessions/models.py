from django.db import models
from django.contrib.auth.models import User
from courses.models import Course
import uuid
import qrcode
from io import BytesIO
import base64
from django.utils import timezone


class AttendanceSession(models.Model):
    STATUS_CHOICES = [
        ('inactive', 'Inactive'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='sessions')
    lecturer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    topic = models.CharField(max_length=200, blank=True)
    date = models.DateField(default=timezone.now)
    start_time = models.TimeField(default="08:00")
    end_time = models.TimeField(default="10:00")
    venue = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='inactive')
    qr_code_data = models.TextField(blank=True)  # Store the QR code data
    qr_code_image = models.TextField(blank=True)  # Store base64 encoded QR image
    qr_code_secret = models.CharField(max_length=100, blank=True)  # Secret for QR validation
    qr_generated_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=60)  # Session duration in minutes
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.course.code} - {self.title}"
    
    def generate_qr_code(self):
        """Generate QR code for the session"""
        import secrets
        self.qr_code_secret = secrets.token_urlsafe(32)
        self.qr_generated_at = timezone.now()
        
        qr_data = f"session:{self.id}:{self.qr_code_secret}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Generate QR code image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 string
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        self.qr_code_data = qr_data
        self.qr_code_image = f"data:image/png;base64,{img_str}"
        self.save()
        
        return self.qr_code_image
    
    def activate_session(self):
        """Activate the session and generate QR code"""
        self.status = 'active'
        self.started_at = timezone.now()
        self.generate_qr_code()
        # save() is called inside generate_qr_code
    
    def deactivate_session(self):
        """Deactivate the session and mark missing students as absent"""
        self.status = 'completed'
        self.ended_at = timezone.now()
        self.save()
        
        # Identify students enrolled in the course who haven't marked attendance
        enrolled_students = self.course.students.all()
        present_student_ids = self.attendance_records.filter(status='present').values_list('student_id', flat=True)
        
        absent_students = enrolled_students.exclude(id__in=present_student_ids)
        
        # Bulk create absent records
        absent_records = [
            AttendanceRecord(
                session=self,
                student=student,
                status='absent'
            ) for student in absent_students
        ]
        AttendanceRecord.objects.bulk_create(absent_records, ignore_conflicts=True)


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
    ]
    
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendance_records')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    marked_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['session', 'student']
        ordering = ['-marked_at']
    
    def __str__(self):
        return f"{self.student.username} - {self.session.title}"
