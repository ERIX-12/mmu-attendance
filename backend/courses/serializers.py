from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Course, Enrollment


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser']
    
    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        elif obj.is_staff:
            return 'lecturer'
        else:
            return 'student'


class CourseSerializer(serializers.ModelSerializer):
    lecturer = UserSerializer(read_only=True)
    lecturer_id = serializers.IntegerField(write_only=True)
    lecturer_detail = serializers.SerializerMethodField()
    students = UserSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    course_code = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'course_code', 'description', 'credits', 'faculty', 'department', 
                  'lecturer', 'lecturer_id', 'lecturer_detail', 'students', 'student_count', 
                  'is_enrolled', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'lecturer', 'lecturer_detail', 'students', 'student_count', 'is_enrolled', 'created_at', 'updated_at']
    
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.students.filter(id=request.user.id).exists()
        return False
    
    def get_student_count(self, obj):
        return obj.students.count()

    def get_lecturer_detail(self, obj):
        if obj.lecturer:
            return {
                'id': obj.lecturer.id,
                'full_name': f"{obj.lecturer.first_name} {obj.lecturer.last_name}"
            }
        return None

    def get_course_code(self, obj):
        return obj.code

    def create(self, validated_data):
        lecturer_id = validated_data.pop('lecturer_id')
        try:
            lecturer = User.objects.get(id=lecturer_id)
            validated_data['lecturer'] = lecturer
        except User.DoesNotExist:
            raise serializers.ValidationError({'lecturer_id': 'Invalid lecturer ID'})
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'lecturer_id' in validated_data:
            lecturer_id = validated_data.pop('lecturer_id')
            try:
                lecturer = User.objects.get(id=lecturer_id)
                instance.lecturer = lecturer
            except User.DoesNotExist:
                raise serializers.ValidationError({'lecturer_id': 'Invalid lecturer ID'})
        
        return super().update(instance, validated_data)


class EnrollmentSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    course = CourseSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrolled_at', 'is_active']
