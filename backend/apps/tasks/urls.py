from django.urls import path

from . import views

urlpatterns = [
    path("", views.RootRedirectView.as_view(), name="home"),
    path("tasks/", views.TaskListView.as_view(), name="task_list"),
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("equipment/", views.EquipmentView.as_view(), name="equipment"),
    path("project/", views.ProjectView.as_view(), name="project"),
    path("timeline/", views.ProjectView.as_view(), name="timeline"),
    path("team/", views.TeamView.as_view(), name="team"),
    path("team/invite/", views.invite_team_member, name="team_invite"),
    path("task/<int:pk>/", views.TaskDetailView.as_view(), name="task_detail"),
    path("task/new/", views.TaskCreateView.as_view(), name="task_create"),
    path("task/<int:pk>/edit/", views.TaskUpdateView.as_view(), name="task_update"),
    path("task/<int:pk>/delete/", views.TaskDeleteView.as_view(), name="task_delete"),
]
