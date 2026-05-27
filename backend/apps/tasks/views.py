import json

from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.decorators.http import require_POST
from django.views.generic import CreateView, DeleteView, DetailView, ListView, UpdateView

from .forms import TaskForm
from .models import Project, Task, Team, TeamInvitation, TeamInvitationProject


class UserTaskQuerysetMixin(LoginRequiredMixin):
    model = Task

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)


class TaskListView(UserTaskQuerysetMixin, ListView):
    model = Task
    template_name = 'tasks/task_list.html'
    context_object_name = 'tasks'
    ordering = ['-created_at']


class TaskDetailView(UserTaskQuerysetMixin, DetailView):
    template_name = 'tasks/task_detail.html'
    context_object_name = 'task'


class TaskCreateView(LoginRequiredMixin, CreateView):
    model = Task
    form_class = TaskForm
    template_name = 'tasks/task_form.html'
    success_url = reverse_lazy('task_list')

    def form_valid(self, form):
        form.instance.user = self.request.user
        return super().form_valid(form)


class TaskUpdateView(UserTaskQuerysetMixin, UpdateView):
    form_class = TaskForm
    template_name = 'tasks/task_form.html'
    success_url = reverse_lazy('task_list')


class TaskDeleteView(UserTaskQuerysetMixin, DeleteView):
    template_name = 'tasks/task_confirm_delete.html'
    success_url = reverse_lazy('task_list')


def invitation_actor_for_request(request):
    if request.user.is_authenticated:
        return request.user

    User = get_user_model()
    system_user, _ = User.objects.get_or_create(
        username="system",
        defaults={
            "email": "system@example.com",
            "is_active": False,
        },
    )
    return system_user


@require_POST
@transaction.atomic
def invite_team_member(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON payload."}, status=400)

    email = str(payload.get("email", "")).strip().lower()
    role = str(payload.get("role", "member")).strip().lower()
    message = str(payload.get("message", "")).strip()
    project_names = payload.get("projects", [])

    if not isinstance(project_names, list):
        return JsonResponse({"ok": False, "error": "Projects must be a list."}, status=400)

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({"ok": False, "error": "Please enter a valid email address."}, status=400)

    allowed_roles = {choice[0] for choice in TeamInvitation.ROLE_CHOICES}
    if role not in allowed_roles:
        return JsonResponse({"ok": False, "error": "Invalid role selected."}, status=400)

    project_names = [str(name).strip() for name in project_names if str(name).strip()]
    project_names = list(dict.fromkeys(project_names))

    actor = invitation_actor_for_request(request)
    team, _ = Team.objects.get_or_create(
        owner=actor,
        name="TaskFlow Workspace",
        defaults={"description": "Default workspace for team collaboration."},
    )

    invitation = TeamInvitation.objects.create(
        team=team,
        email=email,
        role=role,
        message=message,
        invited_by=actor,
    )

    linked_projects = []
    for project_name in project_names:
        project, _ = Project.objects.get_or_create(
            user=actor,
            name=project_name,
            defaults={"description": "Created from a team invitation."},
        )
        TeamInvitationProject.objects.create(invitation=invitation, project=project)
        linked_projects.append(project.name)

    return JsonResponse(
        {
            "ok": True,
            "message": "Invitation sent",
            "invitation": {
                "id": invitation.id,
                "email": invitation.email,
                "role": invitation.role,
                "team": team.name,
                "projects": linked_projects,
            },
        },
        status=201,
    )
