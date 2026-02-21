from django.urls import path
from . import views

urlpatterns = [
    path('', views.CourseListCreateView.as_view(), name='course-list'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('<int:course_id>/enroll/', views.enroll_in_course, name='enroll-course'),
    path('<int:course_id>/unenroll/', views.unenroll_from_course, name='unenroll-course'),
    path('<int:course_id>/students/', views.get_course_students, name='course-students'),
]
