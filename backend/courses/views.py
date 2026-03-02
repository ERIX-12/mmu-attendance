from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Course, Enrollment
from .serializers import CourseSerializer, EnrollmentSerializer, UserSerializer


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['lecturer', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'created_at']

    def get_queryset(self):
        queryset = Course.objects.select_related('lecturer').prefetch_related('students')
        
        # Filter by user role
        user = self.request.user
        if user.is_superuser:
            # Admin can see all courses
            if self.request.query_params.get('all') == 'true':
                return queryset
            return queryset.filter(is_active=True)
        elif user.is_staff:
            # Lecturers can see their own courses
            if self.request.query_params.get('all') == 'true':
                return queryset.filter(lecturer=user)
            return queryset.filter(lecturer=user, is_active=True)
        else:
            # Students can see enrolled courses, or all available if requested
            if self.request.query_params.get('available') == 'true':
                return queryset.filter(is_active=True)
            return queryset.filter(students=user, is_active=True)

    def perform_create(self, serializer):
        # Only lecturers and admins can create courses
        if self.request.user.is_staff or self.request.user.is_superuser:
            serializer.save(lecturer=self.request.user)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only lecturers can create courses")


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Course.objects.all()
        elif user.is_staff:
            return Course.objects.filter(lecturer=user)
        else:
            return Course.objects.filter(students=user, is_active=True)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enroll_in_course(request, course_id):
    """Enroll a student in a course"""
    course = get_object_or_404(Course, id=course_id)
    
    if request.user.is_staff:
        return Response({'error': 'Lecturers cannot enroll in courses'}, status=status.HTTP_400_BAD_REQUEST)
    
    enrollment, created = Enrollment.objects.get_or_create(
        student=request.user,
        course=course
    )
    
    course.students.add(request.user)
    
    if created:
        return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_201_CREATED)
    else:
        # Also return success here because we just ensured they are added to `students`
        return Response({'message': 'Successfully enrolled in course'}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unenroll_from_course(request, course_id):
    """Unenroll a student from a course"""
    course = get_object_or_404(Course, id=course_id)
    
    # Ensure the user is removed from M2M regardless of Enrollment object status
    course.students.remove(request.user)
    
    try:
        enrollment = Enrollment.objects.get(student=request.user, course=course)
        enrollment.delete()
        return Response({'message': 'Successfully unenrolled from course'}, status=status.HTTP_200_OK)
    except Enrollment.DoesNotExist:
        # Still return 200 OK because the student was successfully removed from the course.students table above
        return Response({'message': 'Successfully unenrolled from course'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_course_students(request, course_id):
    """Get all students enrolled in a course (for lecturers)"""
    course = get_object_or_404(Course, id=course_id)
    
    # Check if user is the lecturer of this course or admin
    if not (request.user.is_superuser or course.lecturer == request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    students = course.students.all()
    serializer = UserSerializer(students, many=True)
    return Response(serializer.data)
