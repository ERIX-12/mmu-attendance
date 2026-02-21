from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AttendanceSession, AttendanceRecord
from .serializers import AttendanceSessionSerializer, AttendanceRecordSerializer
from courses.models import Course


class SessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['course', 'status', 'lecturer']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'started_at', 'title']

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceSession.objects.select_related('course', 'lecturer').prefetch_related('attendance_records')
        elif user.is_staff:
            # Lecturers can see their own sessions
            return AttendanceSession.objects.filter(lecturer=user).select_related('course', 'lecturer').prefetch_related('attendance_records')
        else:
            # Students can see sessions for their enrolled courses
            enrolled_courses = user.courses_enrolled.all()
            return AttendanceSession.objects.filter(course__in=enrolled_courses, status='active').select_related('course', 'lecturer').prefetch_related('attendance_records')

    def perform_create(self, serializer):
        # Only lecturers and admins can create sessions
        if self.request.user.is_staff or self.request.user.is_superuser:
            serializer.save(lecturer=self.request.user)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only lecturers can create sessions")


class SessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = AttendanceSession.objects.all()
    serializer_class = AttendanceSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return AttendanceSession.objects.all()
        elif user.is_staff:
            return AttendanceSession.objects.filter(lecturer=user)
        else:
            enrolled_courses = user.courses_enrolled.all()
            return AttendanceSession.objects.filter(course__in=enrolled_courses)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def activate_session(request, session_id):
    """Activate a session and generate QR code"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Check if user is the lecturer or admin
    if not (request.user.is_superuser or session.lecturer == request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    session.activate_session()
    serializer = AttendanceSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deactivate_session(request, session_id):
    """Deactivate a session"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Check if user is the lecturer or admin
    if not (request.user.is_superuser or session.lecturer == request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    session.deactivate_session()
    serializer = AttendanceSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_qr_code(request, session_id):
    """Refresh QR code for a session"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Check if user is the lecturer or admin
    if not (request.user.is_superuser or session.lecturer == request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    session.generate_qr_code()
    serializer = AttendanceSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance(request, session_id):
    """Mark attendance for a student"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Only students can mark attendance
    if request.user.is_staff:
        return Response({'error': 'Lecturers cannot mark attendance'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if session is active
    if session.status != 'active':
        return Response({'error': 'Session is not active'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if student is enrolled in the course
    if not session.course.students.filter(id=request.user.id).exists():
        return Response({'error': 'Not enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create or get attendance record
    record, created = AttendanceRecord.objects.get_or_create(
        session=session,
        student=request.user,
        defaults={
            'status': 'present',
            'ip_address': request.META.get('REMOTE_ADDR'),
            'user_agent': request.META.get('HTTP_USER_AGENT', '')
        }
    )
    
    if created:
        return Response({'message': 'Attendance marked successfully'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'error': 'Attendance already marked'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_attendance(request, session_id):
    """Get attendance records for a session"""
    session = get_object_or_404(AttendanceSession, id=session_id)
    
    # Check if user is the lecturer or admin
    if not (request.user.is_superuser or session.lecturer == request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    records = session.attendance_records.select_related('student').all()
    serializer = AttendanceRecordSerializer(records, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_summary_view(request):
    """Get attendance summary for the current user"""
    user = request.user
    
    if user.is_staff or user.is_superuser:
        # For lecturers/admins, get summary of their sessions
        sessions = AttendanceSession.objects.filter(lecturer=user).prefetch_related('attendance_records')
    else:
        # For students, get their attendance records
        sessions = AttendanceSession.objects.filter(
            attendance_records__student=user
        ).prefetch_related('attendance_records').distinct()
    
    # Calculate summary statistics
    total_sessions = sessions.count()
    attended_sessions = 0
    total_attendance_records = 0
    
    if not user.is_staff and not user.is_superuser:
        # For students, count their attendance
        attended_sessions = AttendanceRecord.objects.filter(student=user).count()
        total_attendance_records = attended_sessions
    else:
        # For lecturers, count total attendance in their sessions
        total_attendance_records = AttendanceRecord.objects.filter(session__lecturer=user).count()
    
    # Get recent attendance records
    recent_attendance = []
    if not user.is_staff and not user.is_superuser:
        recent_records = AttendanceRecord.objects.filter(
            student=user
        ).select_related('session', 'session__course').order_by('-marked_at')[:5]
        
        for record in recent_records:
            recent_attendance.append({
                'session_title': record.session.title,
                'course_name': record.session.course.name,
                'marked_at': record.marked_at,
                'status': record.status
            })
    
    summary_data = {
        'user': {
            'id': user.id,
            'username': user.username,
            'role': 'admin' if user.is_superuser else ('lecturer' if user.is_staff else 'student')
        },
        'statistics': {
            'total_sessions': total_sessions,
            'attended_sessions': attended_sessions if not user.is_staff and not user.is_superuser else None,
            'total_attendance_records': total_attendance_records,
            'attendance_rate': (attended_sessions / total_sessions * 100) if total_sessions > 0 and not user.is_staff and not user.is_superuser else None
        },
        'recent_attendance': recent_attendance
    }
    
    return Response(summary_data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_attendance_alt(request):
    """Alternative endpoint to mark attendance"""
    # Extract session_id from request data
    session_id = request.data.get('session_id')
    if not session_id:
        return Response({'error': 'Session ID required'}, status=status.HTTP_400_BAD_REQUEST)
    
    return mark_attendance(request, session_id)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_summary_alt(request):
    """Alternative endpoint for attendance summary"""
    return attendance_summary_view(request)
