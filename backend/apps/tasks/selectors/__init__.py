from apps.tasks.models import Project, Task


def database_tasks(user=None, project=None):
    queryset = Task.objects.select_related("user", "project").order_by("due_date", "-priority", "-created_at")
    if user and user.is_authenticated:
        queryset = queryset.filter(project__members__user=user).distinct()
    if project is not None:
        queryset = queryset.filter(project=project)
    return list(queryset)


def database_projects(user=None):
    queryset = Project.objects.select_related("user").prefetch_related("members__user").order_by("-created_at", "name")
    if user and user.is_authenticated:
        queryset = queryset.filter(members__user=user).distinct()
    return list(queryset)
