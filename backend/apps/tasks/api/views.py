import json
from datetime import datetime

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.utils import timezone
from django.utils.text import slugify
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.models import Project, Task, Team, TeamInvitation, TeamInvitationProject
from apps.tasks.views import invitation_actor_for_request

from . import mock_data


def payload(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return {}


def ok(data=None, status=200, **extra):
    body = {"ok": True}
    if data is not None:
        body["data"] = data
    body.update(extra)
    return JsonResponse(body, status=status)


def error(message, status=400):
    return JsonResponse({"ok": False, "error": message}, status=status)


def current_user_payload(user):
    if not user.is_authenticated:
        return {
            "id": None,
            "username": "guest",
            "email": "",
            "name": "Guest User",
            "avatar": "",
            "isAuthenticated": False,
        }
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.get_full_name() or user.username,
        "avatar": "",
        "isAuthenticated": True,
    }


STATUS_LABELS = {
    "todo": "To Do",
    "in_progress": "In Progress",
    "done": "Done",
}

PRIORITY_LABELS = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
}

STATUS_COLORS = {
    "To Do": {"color": "#5b8fdc", "dotClass": "bg-blue-400"},
    "In Progress": {"color": "#9b86e8", "dotClass": "bg-violet-400"},
    "Done": {"color": "#34d399", "dotClass": "bg-emerald-400"},
}

PROJECT_GRADIENTS = [
    "bg-gradient-to-br from-cyan-400 to-blue-600",
    "bg-gradient-to-br from-violet-500 to-fuchsia-500",
    "bg-gradient-to-br from-emerald-500 to-green-500",
    "bg-gradient-to-br from-amber-500 to-rose-500",
    "bg-gradient-to-br from-cyan-500 to-violet-500",
]

TASK_COLORS = [
    ("bg-sky-200 border-sky-300", "text-slate-950"),
    ("bg-violet-200 border-violet-300", "text-slate-950"),
    ("bg-rose-200 border-rose-300", "text-slate-950"),
    ("bg-emerald-200 border-emerald-300", "text-slate-950"),
]


def initials(value):
    words = [word for word in str(value or "").split() if word]
    return "".join(word[:1] for word in words[:2]).upper() or "PR"


def display_name(user):
    if not user:
        return "Unassigned"
    return user.get_full_name() or user.username or f"User {user.id}"


def task_status_label(task):
    return STATUS_LABELS.get(task.status, task.get_status_display())


def task_priority_label(task):
    return PRIORITY_LABELS.get(task.priority, task.get_priority_display())


def task_progress(task):
    return {
        "todo": 12,
        "in_progress": 58,
        "done": 100,
    }.get(task.status, 0)


def due_label(task):
    return task.due_date.strftime("%b %d") if task.due_date else "No date"


def dashboard_status_from_tasks(tasks):
    counts = {"To Do": 0, "In Progress": 0, "Done": 0}
    for task in tasks:
        label = task_status_label(task)
        counts[label] = counts.get(label, 0) + 1
    return [
        {"label": label, "value": counts.get(label, 0), **STATUS_COLORS[label]}
        for label in ["To Do", "In Progress", "Done"]
    ]


def dashboard_analytics_from_tasks(tasks):
    total = len(tasks)
    done = len([task for task in tasks if task.status == "done"])

    def distribute(value, slots):
        base = value // slots if slots else 0
        remainder = value % slots if slots else 0
        return [base + (1 if index < remainder else 0) for index in range(slots)]

    daily_completed = distribute(done, 7)
    weekly_completed = distribute(done, 5)
    monthly_completed = distribute(done, 6)

    return {
        "daily": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "planned": distribute(total, 7),
            "completed": daily_completed,
        },
        "weekly": {
            "labels": ["W1", "W2", "W3", "W4", "W5"],
            "planned": distribute(total, 5),
            "completed": weekly_completed,
        },
        "monthly": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "planned": distribute(total, 6),
            "completed": monthly_completed,
        },
    }


def project_payload(project, index, task_count, done_count):
    progress = round((done_count / task_count) * 100) if task_count else 0
    status = "Completed" if progress == 100 and task_count else "Active"
    return {
        "id": slugify(project.name) or f"project-{project.id}",
        "databaseId": project.id,
        "initials": initials(project.name),
        "title": project.name,
        "description": project.description or "Project created from MySQL database.",
        "status": status,
        "progress": progress,
        "members": [initials(display_name(project.user))],
        "tasks": task_count,
        "done": done_count,
        "gradientClass": PROJECT_GRADIENTS[index % len(PROJECT_GRADIENTS)],
        "due": project.created_at.strftime("%b %d") if project.created_at else "No date",
    }


def task_payload(task, index=0):
    color, text = TASK_COLORS[index % len(TASK_COLORS)]
    return {
        "id": str(task.id),
        "title": task.title,
        "subtitle": task.description or "No description yet",
        "start": 9 + ((index % 6) * 1.15),
        "duration": 1.1 + ((index % 3) * 0.45),
        "row": index % 4,
        "color": color,
        "text": text,
        "members": [initials(display_name(task.user))],
        "category": "Project Task",
        "priority": task_priority_label(task),
        "status": task_status_label(task),
        "owner": display_name(task.user),
        "due": due_label(task),
        "progress": task_progress(task),
        "comments": 0,
        "attachments": 0,
        "kanbanOnly": False,
    }


def database_tasks():
    return list(Task.objects.select_related("user").order_by("due_date", "-priority", "-created_at"))


def database_projects():
    return list(Project.objects.select_related("user").order_by("-created_at", "name"))


@csrf_exempt
@require_http_methods(["POST"])
def auth_login(request):
    data = payload(request)
    username = data.get("username")
    password = data.get("password")
    user = authenticate(request, username=username, password=password)
    if not user:
        return error("Invalid username or password.", status=401)
    login(request, user)
    return ok(current_user_payload(user))


@csrf_exempt
@require_http_methods(["POST"])
def auth_logout(request):
    logout(request)
    return ok(message="Logged out")


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def users_me(request):
    if request.method == "PATCH":
        if not request.user.is_authenticated:
            return error("Authentication required.", status=401)
        data = payload(request)
        request.user.first_name = data.get("firstName", request.user.first_name)
        request.user.last_name = data.get("lastName", request.user.last_name)
        request.user.email = data.get("email", request.user.email)
        request.user.save(update_fields=["first_name", "last_name", "email"])
    return ok(current_user_payload(request.user))


def dashboard_summary(request):
    tasks = database_tasks()
    projects = [
        project_payload(project, index, len(tasks), len([task for task in tasks if task.status == "done"]))
        for index, project in enumerate(database_projects())
    ]
    total_tasks = len(tasks)
    done_tasks = len([task for task in tasks if task.status == "done"])
    return ok(
        {
            "activeProjects": len([project for project in projects if project["status"] == "Active"]),
            "tasksDone": done_tasks,
            "totalTasks": total_tasks,
            "dueThisWeek": 12,
            "teamVelocity": 84,
            "projects": projects,
            "upcomingTasks": mock_data.clone(mock_data.DASHBOARD_UPCOMING_TASKS),
        }
    )


def dashboard_task_done(request):
    range_name = request.GET.get("range", "daily")
    analytics = dashboard_analytics_from_tasks(database_tasks())
    return ok(analytics.get(range_name, analytics["daily"]))


def dashboard_task_status(request):
    return ok(dashboard_status_from_tasks(database_tasks()))


def dashboard_activity(request):
    return ok(
        {
            "notifications": mock_data.clone(mock_data.DASHBOARD_NOTIFICATIONS),
            "activity": mock_data.clone(mock_data.DASHBOARD_ACTIVITY),
        }
    )


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
        updated = {**(project or {}), **payload(request), "id": project_id}
        return ok(updated)
    return ok(project or {"id": project_id, "title": "Project not found"})


@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def project_favorite(request, project_id):
    return ok({"projectId": project_id, "favorite": request.method == "POST"})


@csrf_exempt
@require_http_methods(["GET", "POST", "PATCH", "DELETE"])
def project_members(request, project_id, member_id=None):
    if request.method == "GET":
        return ok([{"id": "sn", "name": "Sarah Nguyen", "role": "manager"}, {"id": "ms", "name": "Mostafa Ahmed", "role": "member"}])
    if request.method == "DELETE":
        return ok(message="Project member removed")
    return ok({"projectId": project_id, "memberId": member_id or "new-member", **payload(request)}, status=201 if request.method == "POST" else 200)


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
    task = {
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
    }
    return ok(task, status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def task_detail(request, task_id):
    task = next((item for item in mock_data.PROJECT_TASKS if item["id"] == task_id), None)
    if request.method == "DELETE":
        return ok(message="Task deleted")
    if request.method == "PATCH":
        return ok({**(task or {"id": task_id}), **payload(request)})
    return ok(task or {"id": task_id, "title": "Task not found"})


@csrf_exempt
@require_http_methods(["PATCH"])
def task_status(request, task_id):
    return ok({"id": task_id, "status": payload(request).get("status", "To Do")})


@csrf_exempt
@require_http_methods(["PATCH"])
def task_position(request, task_id):
    return ok({"id": task_id, "position": payload(request).get("position", 0)})


@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def task_favorite(request, task_id):
    return ok({"taskId": task_id, "favorite": request.method == "POST"})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def task_comments(request, task_id):
    if request.method == "POST":
        return ok({"id": "comment-new", "taskId": task_id, **payload(request)}, status=201)
    return ok([
        {"id": "c1", "taskId": task_id, "body": "Progress updated.", "author": "Sarah", "createdAt": "Just now"},
        {"id": "c2", "taskId": task_id, "body": "Please review latest attachment.", "author": "Mostafa", "createdAt": "Yesterday"},
    ])


@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def comment_detail(request, comment_id):
    if request.method == "DELETE":
        return ok(message="Comment deleted")
    return ok({"id": comment_id, **payload(request)})


def task_activity(request, task_id):
    return ok([
        {"id": "a1", "taskId": task_id, "body": "Task moved to Review"},
        {"id": "a2", "taskId": task_id, "body": "Priority changed to High"},
    ])


@csrf_exempt
@require_http_methods(["GET", "POST"])
def task_attachments(request, task_id):
    if request.method == "POST":
        return ok({"id": "file-new", "taskId": task_id, "name": "uploaded-file.pdf"}, status=201)
    return ok([{"id": "file-1", "taskId": task_id, "name": "brief.pdf", "size": "240 KB"}])


@csrf_exempt
@require_http_methods(["DELETE"])
def attachment_detail(request, attachment_id):
    return ok(message="Attachment deleted")


def project_timeline(request, project_id):
    return ok([task_payload(task, index) for index, task in enumerate(database_tasks())])


@csrf_exempt
@require_http_methods(["PATCH"])
def task_schedule(request, task_id):
    return ok({"id": task_id, **payload(request)})


def project_calendar(request, project_id):
    return ok(
        {
            "projectId": project_id,
            "from": request.GET.get("from"),
            "to": request.GET.get("to"),
            "tasks": [task_payload(task, index) for index, task in enumerate(database_tasks())],
        }
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def teams_collection(request):
    if request.method == "GET":
        return ok([{"id": 1, "name": "TaskFlow Workspace", "description": "Default workspace"}])
    return ok({"id": "team-new", **payload(request)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def team_detail(request, team_id):
    if request.method == "DELETE":
        return ok(message="Team deleted")
    return ok({"id": team_id, "name": payload(request).get("name", "TaskFlow Workspace")})


@csrf_exempt
@require_http_methods(["GET", "DELETE"])
def team_members(request, team_id, member_id=None):
    if request.method == "DELETE":
        return ok(message="Team member removed")
    return ok(mock_data.clone(mock_data.TEAM_MEMBERS))


@csrf_exempt
@require_http_methods(["GET", "POST"])
def team_invitations(request, team_id):
    if request.method == "GET":
        invitations = TeamInvitation.objects.select_related("team", "invited_by").order_by("-created_at")[:50]
        return ok([
            {
                "id": invitation.id,
                "email": invitation.email,
                "role": invitation.role,
                "status": invitation.status,
                "team": invitation.team.name,
                "createdAt": invitation.created_at.isoformat(),
            }
            for invitation in invitations
        ])

    data = payload(request)
    actor = invitation_actor_for_request(request)
    team, _ = Team.objects.get_or_create(id=team_id, defaults={"name": "TaskFlow Workspace", "owner": actor})
    invitation = TeamInvitation.objects.create(
        team=team,
        email=data.get("email", ""),
        role=data.get("role", "member"),
        message=data.get("message", ""),
        invited_by=actor,
    )
    for project_name in data.get("projects", []):
        project, _ = Project.objects.get_or_create(user=actor, name=project_name)
        TeamInvitationProject.objects.create(invitation=invitation, project=project)
    return ok({"id": invitation.id, "email": invitation.email, "role": invitation.role, "status": invitation.status}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def invitation_accept(request, token):
    invitation = TeamInvitation.objects.filter(token=token).first()
    if not invitation:
        return error("Invitation not found.", status=404)
    invitation.status = TeamInvitation.STATUS_ACCEPTED
    invitation.accepted_at = timezone.now()
    invitation.save(update_fields=["status", "accepted_at"])
    return ok(message="Invitation accepted")


@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def invitation_action(request, invitation_id, action=None):
    if request.method == "DELETE":
        TeamInvitation.objects.filter(id=invitation_id).update(status=TeamInvitation.STATUS_CANCELLED)
        return ok(message="Invitation cancelled")
    return ok(message="Invitation resent")


def conversations(request, team_id):
    return ok([
        {"id": member["id"], "teamId": team_id, "member": member}
        for member in mock_data.clone(mock_data.TEAM_MEMBERS)
    ])


@csrf_exempt
@require_http_methods(["GET", "POST"])
def conversation_messages(request, conversation_id):
    member = next((item for item in mock_data.TEAM_MEMBERS if item["id"] == conversation_id), mock_data.TEAM_MEMBERS[0])
    if request.method == "POST":
        return ok({"id": "message-new", "body": payload(request).get("body", ""), "time": "Just now"}, status=201)
    return ok(mock_data.clone(member["messages"]))


def conversation_message_search(request, conversation_id):
    q = request.GET.get("q", "").lower()
    member = next((item for item in mock_data.TEAM_MEMBERS if item["id"] == conversation_id), mock_data.TEAM_MEMBERS[0])
    messages = [message for message in member["messages"] if q in message["body"].lower()]
    return ok(messages)


@csrf_exempt
@require_http_methods(["DELETE", "PATCH"])
def conversation_detail(request, conversation_id, action=None):
    return ok(message="Conversation updated")


@csrf_exempt
@require_http_methods(["POST"])
def conversation_calls(request, conversation_id):
    return ok({"id": f"call-{conversation_id}", "conversationId": conversation_id, "status": "ringing"}, status=201)


@csrf_exempt
@require_http_methods(["PATCH"])
def call_end(request, call_id):
    return ok({"id": call_id, "status": "ended"})


def team_presence(request, team_id):
    return ok([{"id": member["id"], "status": member["status"]} for member in mock_data.TEAM_MEMBERS])


@csrf_exempt
@require_http_methods(["PATCH"])
def user_presence(request):
    return ok({"user": current_user_payload(request.user), "presence": payload(request).get("presence", "online")})


def notifications(request):
    return ok([
        {"id": "n1", "body": "Aisha mentioned you in UX copy updates.", "read": False},
        {"id": "n2", "body": "Daniel completed responsive review.", "read": False},
    ])


@csrf_exempt
@require_http_methods(["PATCH"])
def notification_read(request, notification_id=None):
    return ok({"notificationId": notification_id, "read": True})


def team_frontend_data(request):
    return ok({"members": mock_data.clone(mock_data.TEAM_MEMBERS), "notifications": mock_data.clone(mock_data.TEAM_NOTIFICATIONS)})


def project_frontend_data(request):
    tasks = database_tasks()
    return ok(
        {
            "tasks": [task_payload(task, index) for index, task in enumerate(tasks)],
            "notifications": mock_data.clone(mock_data.PROJECT_NOTIFICATIONS),
        }
    )


def dashboard_frontend_data(request):
    tasks = database_tasks()
    projects = database_projects()
    done_count = len([task for task in tasks if task.status == "done"])
    upcoming_tasks = [
        {
            "title": task.title,
            "deadline": due_label(task),
            "priority": task_priority_label(task),
            "assignee": initials(display_name(task.user)),
            "project": "TaskFlow",
        }
        for task in tasks
        if task.due_date
    ][:6]
    return ok(
        {
            "projects": [
                project_payload(project, index, len(tasks), done_count)
                for index, project in enumerate(projects)
            ],
            "upcomingTasks": upcoming_tasks,
            "notifications": mock_data.clone(mock_data.DASHBOARD_NOTIFICATIONS),
            "activityItems": mock_data.clone(mock_data.DASHBOARD_ACTIVITY),
            "analytics": dashboard_analytics_from_tasks(tasks),
            "statusData": dashboard_status_from_tasks(tasks),
        }
    )
