from django.urls import path

from apps.tasks.api.views import team_frontend_data

urlpatterns = [
    path("data/", team_frontend_data, name="api_team_data"),
]
