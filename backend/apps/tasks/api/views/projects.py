from django.core.exceptions import ValidationError
from django.db.models import Q
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import activity_payload, display_name, notification_payload, project_payload, task_payload, task_priority_label, task_status_label
from apps.tasks.models import Notification, Project, ProjectMember, TaskActivity, TaskFavorite, Team, TeamMember
from apps.tasks.permissions import can_manage_project
from apps.tasks.selectors import database_projects, database_tasks, visible_project_filter
from apps.tasks.services.projects import (
    create_project,
    delete_project,
    set_project_favorite,
    update_project,
    upsert_project_member,
)
from apps.tasks.services.tasks import create_task


@require_http_methods(["GET", "POST"])
def projects_collection(request):
    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)

    if request.method == "GET":
        workspace_id = request.GET.get("workspace_id") or request.GET.get("workspaceId")
        tasks = database_tasks(user, workspace_id=workspace_id)
        return ok([
            project_payload(
                project,
                index,
                len([task for task in tasks if task.project_id == project.id]),
                len([task for task in tasks if task.project_id == project.id and task.status == "done"]),
            )
            for index, project in enumerate(database_projects(user, workspace_id=workspace_id))
        ])

    data = payload(request)
    title = data.get("title") or data.get("name") or "Untitled Project"
    description = data.get("description", "Created through API.")
    workspace_id = data.get("workspace_id") or data.get("workspaceId")

    team = None
    if workspace_id and str(workspace_id).isdigit():
        try:
            team = Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct().get(id=workspace_id)
        except (Team.DoesNotExist, ValueError):
            return error("Workspace not found or not accessible.", status=404)
    elif workspace_id:
        return error("Workspace is required to create a project.", status=400, code="workspace_required")

    if not team:
        teams = Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct()
        if teams.count() == 1:
            team = teams.first()
        else:
            return error(
                "Workspace is required to create a project.",
                status=400,
                code="workspace_required",
            )

    if team:
        member = TeamMember.objects.filter(team=team, user=user).first()
        if not member and team.owner == user:
            member = TeamMember.objects.create(team=team, user=user, role=TeamMember.ROLE_OWNER, status=TeamMember.STATUS_ACTIVE)
        if not member or member.role not in [TeamMember.ROLE_OWNER, TeamMember.ROLE_ADMIN]:
            return error("You do not have permission to create projects in this workspace.", status=403, code="permission_denied")

    try:
        project_obj = create_project(actor=user, team=team, name=title, description=description)
    except ValidationError as exc:
        return error(exc.messages[0], status=400, code="bad_request")

    project_payload_data = {
        "id": str(project_obj.id),
        "databaseId": project_obj.id,
        "initials": "".join(word[:1] for word in title.split()[:2]).upper() or "PR",
        "title": title,
        "description": description,
        "status": "Active",
        "progress": 0,
        "members": [user.username[:2].upper()] if user.is_authenticated else ["US"],
        "tasks": 0,
        "done": 0,
        "gradientClass": "bg-gradient-to-br from-cyan-500 to-violet-500",
        "due": "No date",
    }
    return ok(project_payload_data, status=201)


@require_http_methods(["GET", "PATCH", "DELETE"])
def project_detail(request, project_id):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    projects = database_projects(request.user)
    project = next(
        (
            item for item in projects
            if str(item.id) == str(project_id) or project_payload(item, 0, 0, 0)["id"] == str(project_id)
        ),
        None,
    )
    if not project:
        return error("Project not found or not accessible.", status=404)
    if request.method == "DELETE":
        if not can_manage_project(request.user, project):
            return error("You do not have permission to delete this project.", status=403)
        delete_project(actor=request.user, project=project)
        return ok(message="Project deleted")
    if request.method == "PATCH":
        if not can_manage_project(request.user, project):
            return error("You do not have permission to update this project.", status=403)
        try:
            project = update_project(actor=request.user, project=project, data=payload(request))
        except ValidationError as exc:
            return error(exc.messages[0], status=400)
    tasks = database_tasks(request.user)
    return ok(project_payload(
        project,
        0,
        len([task for task in tasks if task.project_id == project.id]),
        len([task for task in tasks if task.project_id == project.id and task.status == "done"]),
    ))


@require_http_methods(["POST", "DELETE"])
def project_favorite(request, project_id):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    project = (
        Project.objects.filter(visible_project_filter(request.user))
        .filter(id=project_id if str(project_id).isdigit() else None)
        .distinct()
        .first()
    )
    if not project:
        return error("Project not found or not accessible.", status=404)
    set_project_favorite(actor=request.user, project=project, favorite=request.method == "POST")
    return ok({"projectId": str(project.id), "favorite": request.method == "POST"})


@require_http_methods(["GET", "POST", "PATCH", "DELETE"])
def project_members(request, project_id, member_id=None):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    project = (
        Project.objects.filter(visible_project_filter(request.user))
        .filter(id=project_id if str(project_id).isdigit() else None)
        .distinct()
        .first()
    )
    if not project:
        return error("Project not found or not accessible.", status=404)
    if request.method == "GET":
        return ok([
            {
                "id": str(member.user_id),
                "name": member.user.get_full_name() or member.user.username,
                "role": member.role,
            }
            for member in project.members.select_related("user").order_by("joined_at")
        ])
    if request.method == "DELETE":
        if not can_manage_project(request.user, project):
            return error("You do not have permission to remove project members.", status=403)
        ProjectMember.objects.filter(project=project, user_id=member_id).delete()
        return ok(message="Project member removed")
    if not can_manage_project(request.user, project):
        return error("You do not have permission to manage project members.", status=403)
    data = payload(request)
    user_id = data.get("user_id") or data.get("userId") or member_id
    if not user_id:
        return error("User id is required.", status=400)
    try:
        member = upsert_project_member(
            actor=request.user,
            project=project,
            user_id=user_id,
            role=data.get("role", ProjectMember.ROLE_MEMBER),
        )
    except (ValidationError, ValueError) as exc:
        message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
        code = "invalid_role" if "role" in message.lower() else "bad_request"
        return error(message, status=400, code=code)
    return ok(
        {"projectId": str(project.id), "memberId": str(member.user_id), "role": member.role},
        status=201 if request.method == "POST" else 200,
    )


@require_http_methods(["GET", "POST"])
def project_tasks(request, project_id):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)

    project = (
        Project.objects.select_related("team")
        .filter(visible_project_filter(request.user))
        .filter(Q(id=project_id) if str(project_id).isdigit() else Q(name__iexact=str(project_id).replace("-", " ")))
        .distinct()
        .first()
    )
    if not project:
        return error("Project not found or not accessible.", status=404)

    tasks = database_tasks(request.user, project_id=project.id)
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
    if not can_manage_project(request.user, project):
        return error("You do not have permission to create tasks in this project.", status=403)
    title = str(data.get("title") or "New Task").strip()
    try:
        task = create_task(actor=request.user, project=project, data=data)
    except ValidationError as exc:
        return error(exc.messages[0], status=400)
    return ok(task_payload(task), status=201)


def project_timeline(request, project_id):
    return ok([task_payload(task, index) for index, task in enumerate(database_tasks(request.user, project_id=project_id))])


def project_calendar(request, project_id):
    return ok(
        {
            "projectId": project_id,
            "from": request.GET.get("from"),
            "to": request.GET.get("to"),
            "tasks": [task_payload(task, index) for index, task in enumerate(database_tasks(request.user, project_id=project_id))],
        }
    )


def project_frontend_data(request):
    workspace_id = request.GET.get("workspace_id")
    tasks = database_tasks(request.user, workspace_id=workspace_id)
    user = request.user

    if not user.is_authenticated:
        return error("Authentication required.", status=401)
    else:
        teams = Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct().order_by("-created_at")
        if workspace_id and str(workspace_id).isdigit():
            teams = teams.filter(id=workspace_id)

    projects_data = []
    for team in teams:
        members = [m.user.username[:2].upper() for m in team.members.all()[:4]]
        if not members:
            members = [user.username[:2].upper()] if user.is_authenticated else ["US"]
            
        project_names = list(
            team.projects.filter(visible_project_filter(user)).distinct().values_list("name", flat=True)
        )
        project_ids = {
            project.name: project.id
            for project in team.projects.filter(visible_project_filter(user)).distinct()
        }
        team_tasks = [task for task in tasks if task.project and task.project.team_id == team.id]
        done_tasks = [task for task in team_tasks if task.status == "done"]

        projects_data.append({
            "id": str(team.id),
            "databaseId": team.id,
            "name": team.name,
            "breadcrumb": "/ Workspaces",
            "category": "Active",
            "company": "My Workspace",
            "date": "No date",
            "members": members,
            "projects": project_names,
            "projectIds": project_ids,
            "inviteUrl": f"/api/teams/{team.id}/invitations/",
            "canManage": team.owner_id == user.id or team.members.filter(
                user=user,
                role__in=[TeamMember.ROLE_OWNER, TeamMember.ROLE_ADMIN],
            ).exists(),
            "progress": round((len(done_tasks) / len(team_tasks)) * 100) if team_tasks else 0,
            "tasks": len(team_tasks),
            "done": len(done_tasks),
        })

    return ok(
        {
            "tasks": [task_payload(task, index) for index, task in enumerate(tasks)],
            "favoriteTaskIds": [
                str(task_id)
                for task_id in TaskFavorite.objects.filter(user=user, task__in=tasks).values_list("task_id", flat=True)
            ],
            "notifications": [
                notification_payload(notification)
                for notification in Notification.objects.filter(recipient=user).order_by("-created_at")[:20]
            ],
            "activityItems": [
                activity_payload(activity)
                for activity in TaskActivity.objects.filter(task__in=tasks).select_related("task").order_by("-created_at")[:20]
            ],
            "projects": projects_data,
        }
    )
