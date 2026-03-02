import csv
from io import BytesIO
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from courses.models import Course
from attendance_sessions.models import AttendanceSession, AttendanceRecord
from django.shortcuts import get_object_or_404

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False

def get_course_attendance_stats(course_id):
    course = get_object_or_404(Course, id=course_id)
    students = course.students.all()
    sessions = AttendanceSession.objects.filter(course=course, status__in=['active', 'completed'])
    total_sessions = sessions.count()

    stats = []
    for student in students:
        attended = AttendanceRecord.objects.filter(
            session__in=sessions,
            student=student,
            status='present'
        ).count()
        
        percentage = 0
        if total_sessions > 0:
            percentage = round((attended / total_sessions) * 100)
            
        student_number = ''
        if hasattr(student, 'profile') and student.profile.student_number:
            student_number = student.profile.student_number
        elif hasattr(student, 'student_number'):
            student_number = student.student_number
        else:
            student_number = student.username
            
        stats.append({
            'student_number': student_number,
            'full_name': f"{student.first_name} {student.last_name}".strip() or student.username,
            'attended': attended,
            'total_sessions': total_sessions,
            'percentage': percentage
        })
        
    stats.sort(key=lambda x: x['full_name'])
    return course, total_sessions, stats

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def below_threshold_view(request, course_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return JsonResponse({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
    try:
        threshold = int(request.GET.get('threshold', 80))
    except ValueError:
        threshold = 80
        
    course, total_sessions, stats = get_course_attendance_stats(course_id)
    
    at_risk = [s for s in stats if s['percentage'] < threshold]
    
    return JsonResponse({
        'course': course.code or course.name,
        'threshold': threshold,
        'total_students': len(stats),
        'total_sessions': total_sessions,
        'below_threshold': len(at_risk),
        'students': at_risk
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_csv(request, course_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return HttpResponse('Permission denied', status=403)
        
    course, total_sessions, stats = get_course_attendance_stats(course_id)
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{course.code or course.name}_attendance.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Student Number', 'Name', 'Attended', 'Total Sessions', 'Percentage'])
    
    for s in stats:
        writer.writerow([s['student_number'], s['full_name'], s['attended'], s['total_sessions'], f"{s['percentage']}%"])
        
    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_pdf(request, course_id):
    if not (request.user.is_superuser or request.user.is_staff):
        return HttpResponse('Permission denied', status=403)
        
    if not HAS_REPORTLAB:
        return HttpResponse('PDF generation not available', status=501)
        
    course, total_sessions, stats = get_course_attendance_stats(course_id)
    
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{course.code or course.name}_attendance.pdf"'
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    elements.append(Paragraph(f"Attendance Report: {course.code or course.name} - {course.name}", styles['Title']))
    elements.append(Paragraph(f"Total Sessions: {total_sessions}", styles['Normal']))
    elements.append(Spacer(1, 12))
    
    data = [['Student Number', 'Name', 'Attended', 'Total', 'Percentage']]
    for s in stats:
        data.append([str(s['student_number']), s['full_name'], str(s['attended']), str(s['total_sessions']), f"{s['percentage']}%"])
        
    table = Table(data)
    # Add table style
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    doc.build(elements)
    
    response.write(buffer.getvalue())
    buffer.close()
    
    return response
