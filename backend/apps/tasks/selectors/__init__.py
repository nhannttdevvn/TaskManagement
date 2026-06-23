from django.db.models import Q
from django.utils.text import slugify

from apps.tasks.models import Project, Task


def visible_project_filter(user):
    if not user or not user.is_authenticated:
        return Q(pk__isnull=True)
    return (
        Q(user=user)
        | Q(team__owner=user)
        | Q(team__members__user=user)
    )


def visible_task_filter(user):
    if not user or not user.is_authenticated:
        return Q(pk__isnull=True)
    return (
        Q(user=user)
        | Q(project__user=user)
        | Q(project__team__owner=user)
        | Q(project__team__members__user=user)
    )


def database_tasks(user=None, workspace_id=None, project_id=None):
    query = (
        Task.objects.select_related("user", "project", "project__team")
        .prefetch_related("comments", "attachments", "activities")
        .filter(visible_task_filter(user))
        .distinct()
    )
    if workspace_id and str(workspace_id).isdigit():
        query = query.filter(project__team_id=workspace_id)
    if project_id:
        if str(project_id).isdigit():
            query = query.filter(project_id=project_id)
        else:
            query = query.filter(project__name__isnull=False)
            query = [task for task in query if slugify(task.project.name) == str(project_id)]
            return sorted(query, key=lambda task: (task.due_date is None, task.due_date, -task.created_at.timestamp()))
    return list(query.order_by("due_date", "-priority", "-created_at"))


def database_projects(user=None, workspace_id=None):
    query = (
        Project.objects.select_related("user", "team")
        .filter(visible_project_filter(user))
        .distinct()
    )
    if workspace_id and str(workspace_id).isdigit():
        query = query.filter(team_id=workspace_id)
    return list(query.order_by("-created_at", "name"))
