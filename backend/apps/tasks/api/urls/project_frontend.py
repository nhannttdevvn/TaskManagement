from django.urls import path

from apps.tasks.api.views import project_frontend_data

urlpatterns = [
    path("data/", project_frontend_data, name="api_project_data"),
]
