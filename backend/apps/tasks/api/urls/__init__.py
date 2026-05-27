from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.tasks.api.urls.auth")),
    path("users/", include("apps.tasks.api.urls.users")),
    path("dashboard/", include("apps.tasks.api.urls.dashboard")),
    path("projects/", include("apps.tasks.api.urls.projects")),
    path("project/", include("apps.tasks.api.urls.project_frontend")),
    path("tasks/", include("apps.tasks.api.urls.tasks")),
    path("comments/", include("apps.tasks.api.urls.comments")),
    path("attachments/", include("apps.tasks.api.urls.attachments")),
    path("teams/", include("apps.tasks.api.urls.teams")),
    path("team/", include("apps.tasks.api.urls.team_frontend")),
    path("invitations/", include("apps.tasks.api.urls.invitations")),
    path("conversations/", include("apps.tasks.api.urls.conversations")),
    path("calls/", include("apps.tasks.api.urls.calls")),
    path("notifications/", include("apps.tasks.api.urls.notifications")),
]
