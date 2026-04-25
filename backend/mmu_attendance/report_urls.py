from django.urls import path
from . import report_views

urlpatterns = [
    path('<int:course_id>/below-threshold/', report_views.below_threshold_view, name='below-threshold'),
    path('<int:course_id>/csv/', report_views.download_csv, name='download-csv'),
    path('<int:course_id>/pdf/', report_views.download_pdf, name='download-pdf'),
    path('faculties/', report_views.faculty_department_stats, name='faculty-stats'),
    path('lecturers/', report_views.lecturer_performance_stats, name='lecturer-stats'),
]
