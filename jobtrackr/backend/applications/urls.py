from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Authentication
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    # Job applications
    path("applications/", views.ApplicationListCreateView.as_view(), name="application-list"),
    path("applications/<int:pk>/", views.ApplicationDetailView.as_view(), name="application-detail"),
    # Dashboard, reminders, profile
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("reminders/", views.RemindersView.as_view(), name="reminders"),
    path("profile/", views.ProfileView.as_view(), name="profile"),
]
