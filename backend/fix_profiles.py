
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mmu_attendance.settings')
django.setup()

from django.contrib.auth.models import User
from authentication.models import UserProfile

print("--- Database Debug ---")
users = User.objects.all()
print(f"Total Users: {users.count()}")

for user in users:
    role = 'student'
    if user.is_superuser:
        role = 'admin'
    elif user.is_staff:
        role = 'lecturer'
    
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={'role': role}
    )
    if created:
        print(f"Created profile for {user.username} with role {role}")
    else:
        # Update role if it says student but user is staff/superuser
        if profile.role == 'student' and (user.is_staff or user.is_superuser):
            profile.role = role
            profile.save()
            print(f"Updated profile role for {user.username} to {role}")
        print(f"User: {user.username}, Role: {profile.role}")

print("--- End Debug ---")
