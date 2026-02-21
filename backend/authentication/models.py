from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('lecturer', 'Lecturer'),
        ('student', 'Student'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    student_number = models.CharField(max_length=50, blank=True)
    staff_id = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}"
