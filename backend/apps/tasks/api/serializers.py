from django.utils.text import slugify


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

    return {
        "daily": {
            "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "planned": distribute(total, 7),
            "completed": distribute(done, 7),
        },
        "weekly": {
            "labels": ["W1", "W2", "W3", "W4", "W5"],
            "planned": distribute(total, 5),
            "completed": distribute(done, 5),
        },
        "monthly": {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            "planned": distribute(total, 6),
            "completed": distribute(done, 6),
        },
    }


def project_payload(project, index, tasks=None):
    tasks = list(tasks if tasks is not None else project.tasks.all())
    task_count = len(tasks)
    done_count = len([task for task in tasks if task.status == "done"])
    progress = round((done_count / task_count) * 100) if task_count else 0
    status = "Completed" if progress == 100 and task_count else "Active"
    members = [
        initials(display_name(member.user))
        for member in project.members.all()
    ] or [initials(display_name(project.user))]
    return {
        "id": slugify(project.name) or f"project-{project.id}",
        "databaseId": project.id,
        "initials": initials(project.name),
        "title": project.name,
        "description": project.description or "Project created from MySQL database.",
        "status": status,
        "progress": progress,
        "members": members,
        "tasks": task_count,
        "done": done_count,
        "gradientClass": PROJECT_GRADIENTS[index % len(PROJECT_GRADIENTS)],
        "due": project.created_at.strftime("%b %d") if project.created_at else "No date",
    }


def task_payload(task, index=0):
    color, text = TASK_COLORS[index % len(TASK_COLORS)]
    return {
        "id": str(task.id),
        "projectId": str(task.project_id) if task.project_id else None,
        "project": task.project.name if task.project_id else "Unassigned",
        "title": task.title,
        "subtitle": task.description or "No description yet",
        "start": task.start,
        "duration": task.duration,
        "row": task.row,
        "color": color,
        "text": text,
        "members": [initials(display_name(task.user))],
        "category": "Project Task",
        "priority": task_priority_label(task),
        "status": task_status_label(task),
        "owner": display_name(task.user),
        "due": due_label(task),
        "dueDate": task.due_date.isoformat() if task.due_date else None,
        "progress": task_progress(task),
        "comments": 0,
        "attachments": 0,
        "kanbanOnly": False,
    }
