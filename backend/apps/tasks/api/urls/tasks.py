from django.urls import path

from apps.tasks.api.views import (
    task_activity,
    task_attachments,
    task_comments,
    task_detail,
    task_favorite,
    task_position,
    task_schedule,
    task_status,
)

urlpatterns = [
    path("<slug:task_id>/", task_detail, name="api_task_detail"),
    path("<slug:task_id>/status/", task_status, name="api_task_status"),
    path("<slug:task_id>/position/", task_position, name="api_task_position"),
    path("<slug:task_id>/favorite/", task_favorite, name="api_task_favorite"),
    path("<slug:task_id>/comments/", task_comments, name="api_task_comments"),
    path("<slug:task_id>/activity/", task_activity, name="api_task_activity"),
    path("<slug:task_id>/attachments/", task_attachments, name="api_task_attachments"),
    path("<slug:task_id>/schedule/", task_schedule, name="api_task_schedule"),
]
