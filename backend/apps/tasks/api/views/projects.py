from datetime import datetime

from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import api_login_required, error, ok, payload
from apps.tasks.api.serializers import (
    display_name,
    project_payload,
    task_payload,
    task_priority_label,
    task_status_label,
)
from apps.tasks.models import Project, ProjectMember, Task
from apps.tasks.selectors import database_projects, database_tasks


def timeline_workspace_payload(project, index):
    data = project_payload(project, index)
    return {
        "id": data["id"],
        "databaseId": project.id,
        "name": data["title"],
        "breadcrumb": "/ Projects",
        "category": data["status"],
        "company": display_name(project.user),
        "date": data["due"],
        "members": data["members"],
        "projects": [data["title"]],
        "progress": data["progress"],
        "tasks": data["tasks"],
        "done": data["done"],
    }


def parse_day_filter(day_filter):
    if not day_filter:
        return None
    value = str(day_filter).strip()
    for fmt in ("%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def filter_tasks_by_day(tasks, day_filter):
    if not day_filter:
        return list(tasks)

    value = str(day_filter).strip()
    if value.lower() == "no date":
        return [task for task in tasks if not task.due_date]

    parsed_date = parse_day_filter(value)
    if parsed_date:
        return [task for task in tasks if task.due_date == parsed_date]

    return [
        task for task in tasks
        if task.due_date and task.due_date.strftime("%b %d").lower() == value.lower()
    ]


def get_accessible_project(request, project_id):
    try:
        if str(project_id).isdigit():
            project = Project.objects.get(id=project_id)
        else:
            project = next(
                (
                    item for item in database_projects(user=request.user)
                    if project_payload(item, 0)["id"] == project_id
                ),
                None,
            )
            if not project:
                return None, None
    except Project.DoesNotExist:
        return None, None

    member = ProjectMember.objects.filter(project=project, user=request.user).first()
    role = ProjectMember.ROLE_MANAGER if project.user == request.user else (member.role if member else None)
    return project, role


@api_login_required
@csrf_exempt
@require_http_methods(["GET", "POST"])
def projects_collection(request):
    if request.method == "GET":
        return ok([
            project_payload(project, index)
            for index, project in enumerate(database_projects(user=request.user))
        ])

    data = payload(request)
    title = (data.get("title") or data.get("name") or "Untitled Project").strip()
    description = data.get("description", "Created through API.")
    if Project.objects.filter(user=request.user, name__iexact=title).exists():
        return error("Project name already exists.", status=400)

    project = Project.objects.create(name=title, description=description, user=request.user)
    ProjectMember.objects.create(project=project, user=request.user, role=ProjectMember.ROLE_MANAGER)
    return ok(project_payload(project, 0), status=201)


@api_login_required
@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def project_detail(request, project_id):
    project, role = get_accessible_project(request, project_id)
    if not project:
        return error("Project not found.", status=404)
    if not role:
        return error("You do not have access to this project.", status=403)

    if request.method == "DELETE":
        if role != ProjectMember.ROLE_MANAGER:
            return error("Only managers can delete projects.", status=403)
        project.delete()
        return ok(message="Project deleted.")

    if request.method == "PATCH":
        if role != ProjectMember.ROLE_MANAGER:
            return error("Only managers can edit projects.", status=403)
        data = payload(request)
        project.name = data.get("title") or data.get("name") or project.name
        project.description = data.get("description", project.description)
        project.save()

    return ok(project_payload(project, 0))


@api_login_required
@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def project_favorite(request, project_id):
    return ok({"projectId": project_id, "favorite": request.method == "POST"})


@api_login_required
@csrf_exempt
@require_http_methods(["GET", "POST", "PATCH", "DELETE"])
def project_members(request, project_id, member_id=None):
    project, role = get_accessible_project(request, project_id)
    if not project:
        return error("Project not found.", status=404)
    if not role:
        return error("You do not have access to this project.", status=403)

    if request.method == "GET":
        members = ProjectMember.objects.filter(project=project).select_related("user")
        return ok([
            {
                "id": member.id,
                "name": display_name(member.user),
                "email": member.user.email,
                "role": member.role,
            }
            for member in members
        ])

    if role != ProjectMember.ROLE_MANAGER:
        return error("Only managers can manage project members.", status=403)

    if request.method == "DELETE":
        ProjectMember.objects.filter(project=project, id=member_id).delete()
        return ok(message="Project member removed.")

    data = payload(request)
    email = data.get("email")
    role_name = data.get("role", "member").lower()
    if role_name not in ["manager", "member", "viewer"]:
        return error("Invalid role.", status=400)

    target_user = User.objects.filter(email__iexact=email).first()
    if not target_user:
        return error("User with this email was not found.", status=404)

    member, created = ProjectMember.objects.update_or_create(
        project=project,
        user=target_user,
        defaults={"role": role_name},
    )
    return ok(
        {
            "projectId": project.id,
            "memberId": member.id,
            "role": member.role,
            "name": display_name(target_user),
        },
        status=201 if created else 200,
    )


@api_login_required
@csrf_exempt
@require_http_methods(["GET", "POST"])
def project_tasks(request, project_id):
    project, role = get_accessible_project(request, project_id)
    if not project:
        return error("Project not found.", status=404)
    if not role:
        return error("You do not have access to this project.", status=403)

    if request.method == "GET":
        tasks = database_tasks(user=request.user, project=project)
        query = request.GET.get("q", "").lower()
        status = request.GET.get("status")
        priority = request.GET.get("priority")
        day_filter = request.GET.get("day") or request.GET.get("date")

        if query:
            tasks = [
                task for task in tasks
                if query in f"{task.title} {task.description or ''} {display_name(task.user)}".lower()
            ]
        if status:
            tasks = [task for task in tasks if task_status_label(task) == status]
        if priority:
            tasks = [task for task in tasks if task_priority_label(task) == priority]
        tasks = filter_tasks_by_day(tasks, day_filter)
        return ok([task_payload(task, index) for index, task in enumerate(tasks)])

    if role == ProjectMember.ROLE_VIEWER:
        return error("Viewers cannot create tasks.", status=403)

    data = payload(request)
    due_date = None
    due_label = data.get("due") or "No date"
    if due_label and due_label != "No date":
        for fmt in ("%Y-%m-%d", "%b %d", "%B %d"):
            try:
                parsed = datetime.strptime(due_label, fmt)
                due_date = parsed.date() if fmt == "%Y-%m-%d" else parsed.replace(year=datetime.now().year).date()
                break
            except ValueError:
                continue

    task_kwargs = {
        "user": request.user,
        "project": project,
        "title": data.get("title") or "New Task",
        "description": data.get("subtitle") or data.get("description") or "",
        "status": {"To Do": "todo", "In Progress": "in_progress", "Review": "in_progress", "Done": "done"}.get(data.get("status"), "todo"),
        "priority": {"Low": "low", "Medium": "medium", "High": "high"}.get(str(data.get("priority") or "Medium").capitalize(), "medium"),
        "due_date": due_date,
    }
    for field, caster in {"start": float, "duration": float, "row": int}.items():
        if field in data:
            try:
                task_kwargs[field] = caster(data[field])
            except (TypeError, ValueError):
                pass

    task = Task.objects.create(**task_kwargs)
    return ok(task_payload(task, 0), status=201)


@api_login_required
def project_timeline(request, project_id):
    project, role = get_accessible_project(request, project_id)
    if not project:
        return error("Project not found.", status=404)
    if not role:
        return error("You do not have access to this project.", status=403)
    tasks = database_tasks(user=request.user, project=project)
    return ok([task_payload(task, index) for index, task in enumerate(tasks)])


@api_login_required
def project_calendar(request, project_id):
    tasks = database_tasks(user=request.user)
    day_filter = request.GET.get("day") or request.GET.get("date")
    return ok(
        {
            "projectId": project_id,
            "from": request.GET.get("from"),
            "to": request.GET.get("to"),
            "tasks": [
                task_payload(task, index)
                for index, task in enumerate(filter_tasks_by_day(tasks, day_filter))
            ],
        }
    )


@api_login_required
def project_frontend_data(request):
    day_filter = request.GET.get("day") or request.GET.get("date")
    tasks = filter_tasks_by_day(database_tasks(user=request.user), day_filter)
    projects = database_projects(user=request.user)
    return ok(
        {
            "projects": [
                timeline_workspace_payload(project, index)
                for index, project in enumerate(projects)
            ],
            "tasks": [task_payload(task, index) for index, task in enumerate(tasks)],
            "selectedDay": day_filter or None,
            "notifications": mock_data.clone(mock_data.PROJECT_NOTIFICATIONS),
        }
    )
