from django.urls import path

from apps.tasks.api.views import (
    project_calendar,
    project_detail,
    project_favorite,
    project_members,
    project_tasks,
    project_timeline,
    projects_collection,
)

urlpatterns = [
    path("", projects_collection, name="api_projects"),
    path("<slug:project_id>/", project_detail, name="api_project_detail"),
    path("<slug:project_id>/favorite/", project_favorite, name="api_project_favorite"),
    path("<slug:project_id>/members/", project_members, name="api_project_members"),
    path("<slug:project_id>/members/<slug:member_id>/", project_members, name="api_project_member_detail"),
    path("<slug:project_id>/tasks/", project_tasks, name="api_project_tasks"),
    path("<slug:project_id>/timeline/", project_timeline, name="api_project_timeline"),
    path("<slug:project_id>/calendar/", project_calendar, name="api_project_calendar"),
]
