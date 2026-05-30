from django.urls import path

from django.views.generic import RedirectView
from . import views

urlpatterns = [
    path("", views.DashboardView.as_view(), name="dashboard"),
    path("dashboard/", RedirectView.as_view(pattern_name="dashboard", permanent=True)),
    path("project/", views.ProjectView.as_view(), name="project"),
    path("timeline/", views.ProjectView.as_view(), name="timeline"),
    path("team/", views.TeamView.as_view(), name="team"),
    path("team/invite/", views.invite_team_member, name="team_invite"),
    path("task/<int:pk>/", views.TaskDetailView.as_view(), name="task_detail"),
    path("task/new/", views.TaskCreateView.as_view(), name="task_create"),
    path("task/<int:pk>/edit/", views.TaskUpdateView.as_view(), name="task_update"),
    path("task/<int:pk>/delete/", views.TaskDeleteView.as_view(), name="task_delete"),
]
