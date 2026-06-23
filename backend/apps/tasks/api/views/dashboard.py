from apps.tasks.api.responses import error
from apps.tasks.api.responses import ok
from apps.tasks.api.serializers import (
    activity_payload,
    dashboard_analytics_from_tasks,
    dashboard_status_from_tasks,
    due_label,
    initials,
    notification_payload,
    project_payload,
    task_priority_label,
)
from apps.tasks.models import Notification, TaskActivity
from apps.tasks.selectors import database_projects, database_tasks


def dashboard_summary(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    tasks = database_tasks(request.user)
    done_tasks = len([task for task in tasks if task.status == "done"])
    projects = [
        project_payload(
            project,
            index,
            len([task for task in tasks if task.project_id == project.id]),
            len([task for task in tasks if task.project_id == project.id and task.status == "done"]),
        )
        for index, project in enumerate(database_projects(request.user))
    ]
    due_this_week = len([task for task in tasks if task.due_date and task.status != "done"])
    return ok(
        {
            "activeProjects": len([project for project in projects if project["status"] == "Active"]),
            "tasksDone": done_tasks,
            "totalTasks": len(tasks),
            "dueThisWeek": due_this_week,
            "teamVelocity": round((done_tasks / len(tasks)) * 100) if tasks else 0,
            "projects": projects,
            "upcomingTasks": [],
        }
    )


def dashboard_task_done(request):
    range_name = request.GET.get("range", "daily")
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    analytics = dashboard_analytics_from_tasks(database_tasks(request.user))
    return ok(analytics.get(range_name, analytics["daily"]))


def dashboard_task_status(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    return ok(dashboard_status_from_tasks(database_tasks(request.user)))


def dashboard_activity(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    return ok(
        {
            "notifications": [
                notification_payload(notification)
                for notification in Notification.objects.filter(recipient=request.user).order_by("-created_at")[:20]
            ],
            "activity": [
                activity_payload(activity)
                for activity in TaskActivity.objects.filter(task__in=database_tasks(request.user)).select_related("task").order_by("-created_at")[:20]
            ],
        }
    )


def dashboard_frontend_data(request):
    from django.db.models import Q
    from apps.tasks.models import Team, TeamMember

    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)
    tasks = database_tasks(user)

    teams = Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct().order_by("-created_at")

    projects_data = []
    for index, team in enumerate(teams):
        members = [m.user.username[:2].upper() for m in team.members.all()[:4]]
        if not members:
            members = [user.username[:2].upper()] if user.is_authenticated else ["US"]

        team_tasks = [task for task in tasks if task.project and task.project.team_id == team.id]
        done_tasks = [task for task in team_tasks if task.status == "done"]
        initials_ws = "".join(word[:1] for word in team.name.split()[:2]).upper() or "WS"
        projects_data.append({
            "id": str(team.id),
            "databaseId": team.id,
            "initials": initials_ws,
            "title": team.name,
            "description": team.description or "Workspace managed in database.",
            "status": "Active",
            "progress": round((len(done_tasks) / len(team_tasks)) * 100) if team_tasks else 0,
            "members": members,
            "tasks": len(team_tasks),
            "done": len(done_tasks),
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
            "notifications": [
                notification_payload(notification)
                for notification in Notification.objects.filter(recipient=user).order_by("-created_at")[:20]
            ],
            "activityItems": [
                activity_payload(activity)
                for activity in TaskActivity.objects.filter(task__in=tasks).select_related("task").order_by("-created_at")[:20]
            ],
            "analytics": dashboard_analytics_from_tasks(tasks),
            "statusData": dashboard_status_from_tasks(tasks),
        }
    )
