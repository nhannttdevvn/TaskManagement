from django.urls import path

from apps.tasks.api.views import (
    dashboard_activity,
    dashboard_frontend_data,
    dashboard_summary,
    dashboard_task_done,
    dashboard_task_status,
)

urlpatterns = [
    path("data/", dashboard_frontend_data, name="api_dashboard_data"),
    path("summary/", dashboard_summary, name="api_dashboard_summary"),
    path("analytics/task-done/", dashboard_task_done, name="api_dashboard_task_done"),
    path("analytics/task-status/", dashboard_task_status, name="api_dashboard_task_status"),
    path("activity/", dashboard_activity, name="api_dashboard_activity"),
]
