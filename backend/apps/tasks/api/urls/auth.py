from django.urls import path

from apps.tasks.api.views import auth_login, auth_logout, auth_signup

urlpatterns = [
    path("login/", auth_login, name="api_auth_login"),
    path("signup/", auth_signup, name="api_auth_signup"),
    path("logout/", auth_logout, name="api_auth_logout"),
]
