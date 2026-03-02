from django.urls import path
from . import views
urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('reset-password/', views.reset_password_view, name='reset_password'),
    path('token/', views.login_view, name='login'),
    path('token/refresh/', views.refresh_token_view, name='token_refresh'),
    path('token/blacklist/', views.blacklist_token_view, name='token_blacklist'),
    path('logout/', views.logout_view, name='logout'),
    path('users/me/', views.user_profile_view, name='user_profile'),
    path('users/', views.users_list_view, name='users_list'),
    path('users/<int:user_id>/', views.user_detail_view, name='user_detail'),
]
