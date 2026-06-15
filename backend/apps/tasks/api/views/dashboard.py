from apps.tasks.api import mock_data
from apps.tasks.api.responses import ok
from apps.tasks.api.serializers import (
    dashboard_analytics_from_tasks,
    dashboard_status_from_tasks,
    due_label,
    initials,
    project_payload,
    task_priority_label,
)
from apps.tasks.selectors import database_projects, database_tasks


def dashboard_summary(request):
    tasks = database_tasks()
    done_tasks = len([task for task in tasks if task.status == "done"])
    projects = [
        project_payload(project, index, len(tasks), done_tasks)
        for index, project in enumerate(database_projects())
    ]
    return ok(
        {
            "activeProjects": len([project for project in projects if project["status"] == "Active"]),
            "tasksDone": done_tasks,
            "totalTasks": len(tasks),
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


def dashboard_frontend_data(request):
    from django.db.models import Q
    from apps.tasks.models import Team, TeamMember

    tasks = database_tasks()
    user = request.user

    if not user.is_authenticated:
        teams = Team.objects.all().order_by("-created_at")
    else:
        teams = Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct().order_by("-created_at")

    projects_data = []
    # Auto-create a default workspace for authenticated users if none exist
    if not teams.exists() and user.is_authenticated:
        team = Team.objects.create(name="Default Workspace", owner=user)
        TeamMember.objects.create(team=team, user=user, role=TeamMember.ROLE_OWNER, status=TeamMember.STATUS_ACTIVE)
        teams = Team.objects.filter(id=team.id)

    for index, team in enumerate(teams):
        members = [m.user.username[:2].upper() for m in team.members.all()[:4]]
        if not members:
            members = [user.username[:2].upper()] if user.is_authenticated else ["US"]

        initials_ws = "".join(word[:1] for word in team.name.split()[:2]).upper() or "WS"
        projects_data.append({
            "id": str(team.id),
            "databaseId": team.id,
            "initials": initials_ws,
            "title": team.name,
            "description": team.description or "Workspace managed in database.",
            "status": "Active",
            "progress": 0,
            "members": members,
            "tasks": 0,
            "done": 0,
            "gradientClass": "bg-gradient-to-br from-cyan-500 to-violet-500",
            "due": team.created_at.strftime("%b %d") if team.created_at else "No date",
        })

    upcoming_tasks = [
        {
            "title": task.title,
            "deadline": due_label(task),
            "priority": task_priority_label(task),
            "assignee": initials(task.user.get_full_name() or task.user.username),
            "project": "TaskFlow",
        }
        for task in tasks
        if task.due_date
    ][:6]

    return ok(
        {
            "projects": projects_data,
            "upcomingTasks": upcoming_tasks,
            "notifications": mock_data.clone(mock_data.DASHBOARD_NOTIFICATIONS),
            "activityItems": mock_data.clone(mock_data.DASHBOARD_ACTIVITY),
            "analytics": dashboard_analytics_from_tasks(tasks),
            "statusData": dashboard_status_from_tasks(tasks),
        }
    )
