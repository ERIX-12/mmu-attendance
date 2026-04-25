import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mmu_attendance.settings')
django.setup()

from django.contrib.auth import get_user_model
from authentication.models import UserProfile

User = get_user_model()

users_to_create = [
    {'username': 'admin', 'password': 'Admin@123', 'email': 'admin@mmu.ac.ug', 'role': 'admin', 'is_superuser': True, 'is_staff': True, 'first_name': 'System', 'last_name': 'Admin'},
    {'username': 'lec_okello', 'password': 'Lecturer@123', 'email': 'lokello@mmu.ac.ug', 'role': 'lecturer', 'is_staff': True, 'first_name': 'Samuel', 'last_name': 'Okello'},
    {'username': 'stu_amanya', 'password': 'Student@123', 'email': 'amanya@students.mmu.ac.ug', 'role': 'student', 'first_name': 'Ian', 'last_name': 'Amanya'}
]

for ud in users_to_create:
    user, created = User.objects.get_or_create(username=ud['username'])
    user.email = ud['email']
    user.first_name = ud.get('first_name', '')
    user.last_name = ud.get('last_name', '')
    user.set_password(ud['password'])
    
    if ud.get('is_superuser'):
        user.is_superuser = True
    if ud.get('is_staff'):
        user.is_staff = True
        
    user.save()
    
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = ud['role']
    profile.save()
    
    print(f"Set up user: {user.username} with password {ud['password']} (Role: {profile.role})")

print("Demo users setup complete!")
