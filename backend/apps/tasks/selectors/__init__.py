from apps.tasks.models import Project, Task


def database_tasks():
    return list(Task.objects.select_related("user").order_by("due_date", "-priority", "-created_at"))


def database_projects():
    return list(Project.objects.select_related("user").order_by("-created_at", "name"))
