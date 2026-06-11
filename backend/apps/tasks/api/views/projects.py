from datetime import datetime

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import ok, payload
from apps.tasks.api.serializers import display_name, project_payload, task_payload, task_priority_label, task_status_label
from apps.tasks.selectors import database_projects, database_tasks


@csrf_exempt
@require_http_methods(["GET", "POST"])
def projects_collection(request):
    if request.method == "GET":
        tasks = database_tasks()
        done_count = len([task for task in tasks if task.status == "done"])
        return ok([
            project_payload(project, index, len(tasks), done_count)
            for index, project in enumerate(database_projects())
        ])

    data = payload(request)
    title = data.get("title") or data.get("name") or "Untitled Project"
    project = {
        "id": title.lower().replace(" ", "-"),
        "initials": "".join(word[:1] for word in title.split()[:2]).upper() or "PR",
        "title": title,
        "description": data.get("description", "Created through API."),
        "status": data.get("status", "Active"),
        "progress": int(data.get("progress", 0)),
        "members": data.get("members", ["SN"]),
        "tasks": 0,
        "done": 0,
        "gradientClass": "bg-gradient-to-br from-cyan-500 to-violet-500",
        "due": data.get("due", "No date"),
    }
    return ok(project, status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def project_detail(request, project_id):
    project = next((item for item in mock_data.DASHBOARD_PROJECTS if item["id"] == project_id), None)
    if request.method == "DELETE":
        return ok(message="Project deleted")
    if request.method == "PATCH":
        return ok({**(project or {}), **payload(request), "id": project_id})
    return ok(project or {"id": project_id, "title": "Project not found"})


@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def project_favorite(request, project_id):
    return ok({"projectId": project_id, "favorite": request.method == "POST"})


@csrf_exempt
@require_http_methods(["GET", "POST", "PATCH", "DELETE"])
def project_members(request, project_id, member_id=None):
    if request.method == "GET":
        return ok([
            {"id": "sn", "name": "Sarah Nguyen", "role": "manager"},
            {"id": "ms", "name": "Mostafa Ahmed", "role": "member"},
        ])
    if request.method == "DELETE":
        return ok(message="Project member removed")
    return ok(
        {"projectId": project_id, "memberId": member_id or "new-member", **payload(request)},
        status=201 if request.method == "POST" else 200,
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def project_tasks(request, project_id):
    tasks = database_tasks()
    if request.method == "GET":
        query = request.GET.get("q", "").lower()
        status = request.GET.get("status")
        priority = request.GET.get("priority")
        if query:
            tasks = [
                task for task in tasks
                if query in f"{task.title} {task.description or ''} {display_name(task.user)}".lower()
            ]
        if status:
            tasks = [task for task in tasks if task_status_label(task) == status]
        if priority:
            tasks = [task for task in tasks if task_priority_label(task) == priority]
        return ok([task_payload(task, index) for index, task in enumerate(tasks)])

    data = payload(request)
    now_id = datetime.now().strftime("%Y%m%d%H%M%S")
    return ok(
        {
            "id": data.get("id", f"task-{now_id}"),
            "title": data.get("title", "New Task"),
            "subtitle": data.get("subtitle", data.get("description", "")),
            "status": data.get("status", "To Do"),
            "priority": data.get("priority", "Medium"),
            "progress": int(data.get("progress", 0)),
            "owner": data.get("owner", "Unassigned"),
            "due": data.get("due", "No date"),
            "members": data.get("members", []),
            "comments": 0,
            "attachments": 0,
            "kanbanOnly": True,
        },
        status=201,
    )


def project_timeline(request, project_id):
    return ok([task_payload(task, index) for index, task in enumerate(database_tasks())])


def project_calendar(request, project_id):
    return ok(
        {
            "projectId": project_id,
            "from": request.GET.get("from"),
            "to": request.GET.get("to"),
            "tasks": [task_payload(task, index) for index, task in enumerate(database_tasks())],
        }
    )


def project_frontend_data(request):
    tasks = database_tasks()
    return ok(
        {
            "tasks": [task_payload(task, index) for index, task in enumerate(tasks)],
            "notifications": mock_data.clone(mock_data.PROJECT_NOTIFICATIONS),
        }
    )
