from apps.tasks.api import mock_data
from apps.tasks.api.responses import api_login_required, ok
from apps.tasks.api.serializers import (
    dashboard_analytics_from_tasks,
    dashboard_status_from_tasks,
    due_label,
    initials,
    project_payload,
    task_priority_label,
)
from apps.tasks.selectors import database_projects, database_tasks


@api_login_required
def dashboard_summary(request):
    tasks = database_tasks(user=request.user)
    done_tasks = len([task for task in tasks if task.status == "done"])
    projects = [
        project_payload(project, index)
        for index, project in enumerate(database_projects(user=request.user))
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


@api_login_required
def dashboard_task_done(request):
    range_name = request.GET.get("range", "daily")
    analytics = dashboard_analytics_from_tasks(database_tasks(user=request.user))
    return ok(analytics.get(range_name, analytics["daily"]))


@api_login_required
def dashboard_task_status(request):
    return ok(dashboard_status_from_tasks(database_tasks(user=request.user)))


@api_login_required
def dashboard_activity(request):
    return ok(
        {
            "notifications": mock_data.clone(mock_data.DASHBOARD_NOTIFICATIONS),
            "activity": mock_data.clone(mock_data.DASHBOARD_ACTIVITY),
        }
    )


@api_login_required
def dashboard_frontend_data(request):
    tasks = database_tasks(user=request.user)
    projects = database_projects(user=request.user)
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
            "projects": [
                project_payload(project, index)
                for index, project in enumerate(projects)
            ],
            "upcomingTasks": upcoming_tasks,
            "notifications": mock_data.clone(mock_data.DASHBOARD_NOTIFICATIONS),
            "activityItems": mock_data.clone(mock_data.DASHBOARD_ACTIVITY),
            "analytics": dashboard_analytics_from_tasks(tasks),
            "statusData": dashboard_status_from_tasks(tasks),
        }
    )
