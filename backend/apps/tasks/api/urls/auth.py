from django.urls import path

from apps.tasks.api.views import auth_login, auth_logout

urlpatterns = [
    path("login/", auth_login, name="api_auth_login"),
    path("logout/", auth_logout, name="api_auth_logout"),
]
