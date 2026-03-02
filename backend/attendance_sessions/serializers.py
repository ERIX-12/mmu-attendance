from rest_framework import serializers
from django.contrib.auth.models import User
from .models import AttendanceSession, AttendanceRecord
from courses.models import Course
from courses.serializers import CourseSerializer, UserSerializer as CourseUserSerializer


class AttendanceSessionSerializer(serializers.ModelSerializer):
    course_id = serializers.IntegerField(write_only=True)
    course = CourseSerializer(read_only=True)
    lecturer = CourseUserSerializer(read_only=True)
    attendance_count = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()
    absent_count = serializers.SerializerMethodField()
    total_enrolled = serializers.SerializerMethodField()
    is_active = serializers.SerializerMethodField()
    course_code = serializers.ReadOnlyField(source='course.code')
    
    class Meta:
        model = AttendanceSession
        fields = ['id', 'course_id', 'course', 'lecturer', 'title', 'description', 
                  'topic', 'date', 'start_time', 'end_time', 'venue', 'status', 
                  'qr_code_image', 'qr_code_secret', 'qr_generated_at',
                  'created_at', 'started_at', 'ended_at', 'duration_minutes', 
                  'attendance_count', 'present_count', 'absent_count', 'total_enrolled', 'is_active', 'course_code']
        read_only_fields = ['id', 'qr_code_image', 'qr_code_secret', 'qr_generated_at', 
                           'created_at', 'started_at', 'ended_at', 'is_active', 'course_code']
    
    def get_attendance_count(self, obj):
        return obj.attendance_records.filter(status='present').count()

    def get_present_count(self, obj):
        return obj.attendance_records.filter(status='present').count()
        
    def get_absent_count(self, obj):
        if obj.status == 'completed':
            return obj.attendance_records.filter(status='absent').count()
        total = obj.course.students.count()
        present = self.get_present_count(obj)
        return total - present

    def get_total_enrolled(self, obj):
        return obj.course.students.count()

    def get_is_active(self, obj):
        return obj.status == 'active'
    
    def create(self, validated_data):
        # Map topic to title if title is not provided
        if not validated_data.get('title') and validated_data.get('topic'):
            validated_data['title'] = validated_data['topic']
            
        # Convert course_id to course object
        course_id = validated_data.pop('course_id')
        try:
            course = Course.objects.get(id=course_id)
            validated_data['course'] = course
        except Course.DoesNotExist:
            raise serializers.ValidationError({'course_id': 'Invalid course ID'})
        
        return super().create(validated_data)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student = CourseUserSerializer(read_only=True)
    session = AttendanceSessionSerializer(read_only=True)
    
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'session', 'student', 'status', 'marked_at', 'ip_address', 'user_agent']
