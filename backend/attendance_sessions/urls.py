from django.urls import path
from . import views

urlpatterns = [
    path('', views.SessionListCreateView.as_view(), name='session-list'),
    path('<uuid:pk>/', views.SessionDetailView.as_view(), name='session-detail'),
    path('<uuid:session_id>/activate/', views.activate_session, name='activate-session'),
    path('<uuid:session_id>/deactivate/', views.deactivate_session, name='deactivate-session'),
    path('<uuid:session_id>/refresh-qr/', views.refresh_qr_code, name='refresh-qr'),
    path('<uuid:session_id>/qr_refresh/', views.refresh_qr_code, name='qr-refresh-alt'),
    path('<uuid:session_id>/mark-attendance/', views.mark_attendance, name='mark-attendance'),
    path('<uuid:session_id>/attendance/', views.get_session_attendance, name='session-attendance'),
    path('summary/', views.attendance_summary_view, name='attendance-summary'),
    path('attendance/summary/', views.attendance_summary_alt, name='attendance-summary-alt'),
    path('attendance/mark/', views.mark_attendance_alt, name='mark-attendance-alt'),
    path('attendance/records/', views.student_attendance_records, name='student-attendance-records'),
]
