import math
import re
from pathlib import Path

from django.db import IntegrityError, transaction
from django.db.models import Count, Max
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.models import Project, Task, TaskAttachment
from apps.tasks.permissions import can_manage_project
from apps.tasks.selectors import database_projects, visible_project_filter
from apps.tasks.services.tasks import add_task_attachment


FOLDER_PALETTE = [
    {"color": "blue", "icon": "folder"},
    {"color": "violet", "icon": "music"},
    {"color": "emerald", "icon": "briefcase"},
    {"color": "amber", "icon": "folder-open"},
    {"color": "cyan", "icon": "cloud"},
    {"color": "rose", "icon": "folder-heart"},
]

STORAGE_BUCKETS = {
    "Images": {
        "extensions": {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"},
        "icon": "image",
        "color": "from-cyan-400 to-blue-500",
    },
    "Documents": {
        "extensions": {".doc", ".docx", ".pdf", ".txt", ".md", ".xls", ".xlsx", ".ppt", ".pptx"},
        "icon": "file-text",
        "color": "from-amber-400 to-rose-500",
    },
    "Videos": {
        "extensions": {".mp4", ".mov", ".avi", ".mkv", ".webm"},
        "icon": "film",
        "color": "from-rose-400 to-fuchsia-500",
    },
    "Other": {
        "extensions": set(),
        "icon": "file",
        "color": "from-emerald-400 to-cyan-500",
    },
}

FILE_META = {
    ".jpg": ("image", "bg-emerald-400/20 text-emerald-200"),
    ".jpeg": ("image", "bg-emerald-400/20 text-emerald-200"),
    ".png": ("image", "bg-emerald-400/20 text-emerald-200"),
    ".gif": ("image", "bg-emerald-400/20 text-emerald-200"),
    ".webp": ("image", "bg-emerald-400/20 text-emerald-200"),
    ".doc": ("file-text", "bg-blue-400/20 text-blue-200"),
    ".docx": ("file-text", "bg-blue-400/20 text-blue-200"),
    ".pdf": ("file-text", "bg-rose-400/20 text-rose-200"),
    ".fig": ("pen-tool", "bg-violet-400/20 text-violet-200"),
    ".ai": ("palette", "bg-amber-400/20 text-amber-200"),
    ".zip": ("archive", "bg-slate-400/20 text-slate-200"),
    ".rar": ("archive", "bg-slate-400/20 text-slate-200"),
}


def _auth_required(request):
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    return None


def _extension(name):
    return Path(str(name or "")).suffix.lower()


def _file_visual(name):
    return FILE_META.get(_extension(name), ("file", "bg-cyan-400/20 text-cyan-200"))


def _parse_size_mb(value):
    match = re.search(r"[\d.]+", str(value or ""))
    if not match:
        return 0.0
    try:
        return round(float(match.group(0)), 2)
    except ValueError:
        return 0.0


def _uploaded_size_mb(uploaded_file):
    size = getattr(uploaded_file, "size", 0) or 0
    if size <= 0:
        return 0.01
    return round(max(size / (1024 * 1024), 0.01), 2)


def _members_count(project):
    if not project:
        return 1
    if project.team_id:
        return max(1, project.team.members.count())
    return max(1, project.members.count() + 1)


def _days_since(value):
    if not value:
        return 0
    from django.utils import timezone

    return max(0, (timezone.now().date() - value.date()).days)


def _folder_payload(project, index=0):
    palette = FOLDER_PALETTE[index % len(FOLDER_PALETTE)]
    stats = project.tasks.aggregate(
        file_count=Count("attachments", distinct=True),
        last_file_at=Max("attachments__created_at"),
    )
    members = _members_count(project)
    updated_at = stats.get("last_file_at") or project.created_at
    return {
        "id": str(project.id),
        "name": project.name,
        "count": stats.get("file_count") or 0,
        "color": palette["color"],
        "icon": palette["icon"],
        "members": members,
        "shared": members > 1 or bool(project.team_id),
        "updatedAt": _days_since(updated_at),
    }


def _file_payload(attachment):
    project = attachment.task.project if attachment.task_id else None
    icon, accent = _file_visual(attachment.name)
    return {
        "id": attachment.id,
        "name": attachment.name,
        "size": _parse_size_mb(attachment.size),
        "modified": attachment.created_at.strftime("%b %d, %Y"),
        "members": _members_count(project),
        "icon": icon,
        "accent": accent,
        "folderId": str(project.id) if project else None,
        "taskId": attachment.task_id,
    }


def _storage_payload(attachments):
    totals = {label: 0.0 for label in STORAGE_BUCKETS}
    for attachment in attachments:
        extension = _extension(attachment.name)
        bucket = "Other"
        for label, meta in STORAGE_BUCKETS.items():
            if extension in meta["extensions"]:
                bucket = label
                break
        totals[bucket] += _parse_size_mb(attachment.size)

    breakdown = []
    for label, used_mb in totals.items():
        meta = STORAGE_BUCKETS[label]
        used_gb = round(used_mb / 1024, 2)
        total_gb = max(1, math.ceil(used_gb + 1))
        breakdown.append(
            {
                "label": label,
                "used": used_gb,
                "total": total_gb,
                "icon": meta["icon"],
                "color": meta["color"],
            }
        )
    return breakdown


def _visible_project(user, project_id):
    if not project_id or not str(project_id).isdigit():
        return None
    return Project.objects.filter(visible_project_filter(user), id=project_id).distinct().first()


def _ensure_default_project(user):
    projects = database_projects(user)
    if projects:
        return projects[0]

    try:
        return Project.objects.create(
            name="Uploaded Files",
            description="Default folder for files uploaded from the Files page.",
            user=user,
        )
    except IntegrityError:
        return Project.objects.filter(user=user, name="Uploaded Files").first()


def _ensure_file_task(user, project):
    task = Task.objects.filter(project=project, category="Files", title="File Inbox").first()
    if task:
        return task
    return Task.objects.create(
        user=user,
        project=project,
        title="File Inbox",
        description="Files uploaded from the Files page.",
        status="todo",
        priority="medium",
        start=9,
        duration=1,
        row=0,
        category="Files",
    )


def _visible_attachments(user, projects):
    return (
        TaskAttachment.objects.select_related("task", "task__project", "task__project__team", "user")
        .filter(task__project__in=projects)
        .order_by("-created_at", "-id")
    )


@require_http_methods(["GET"])
def files_collection(request):
    auth_error = _auth_required(request)
    if auth_error:
        return auth_error

    projects = database_projects(request.user)
    attachments = list(_visible_attachments(request.user, projects)[:50])
    folders = [_folder_payload(project, index) for index, project in enumerate(projects)]
    return ok(
        {
            "folders": folders,
            "recentFiles": [_file_payload(attachment) for attachment in attachments],
            "storageBreakdown": _storage_payload(attachments),
            "notifications": [],
        }
    )


@require_http_methods(["POST"])
def folders_collection(request):
    auth_error = _auth_required(request)
    if auth_error:
        return auth_error

    data = payload(request)
    name = str(data.get("name") or "").strip()
    if not name:
        return error("Folder name is required.", status=400)

    try:
        project = Project.objects.create(
            name=name,
            description="Folder created from the Files page.",
            user=request.user,
        )
    except IntegrityError:
        return error("A folder with this name already exists.", status=409)

    index = Project.objects.filter(visible_project_filter(request.user)).count() - 1
    return ok(_folder_payload(project, index), status=201)


@require_http_methods(["POST"])
@transaction.atomic
def files_upload(request):
    auth_error = _auth_required(request)
    if auth_error:
        return auth_error

    uploaded_file = request.FILES.get("file")
    if not uploaded_file:
        return error("Please choose a file to upload.", status=400)

    project = _visible_project(request.user, request.POST.get("folder_id")) or _ensure_default_project(request.user)
    if not project:
        return error("No folder is available for this upload.", status=400)
    if not can_manage_project(request.user, project):
        return error("You do not have permission to upload files to this folder.", status=403)

    task = _ensure_file_task(request.user, project)
    attachment = add_task_attachment(
        actor=request.user,
        task=task,
        name=uploaded_file.name,
        size=f"{_uploaded_size_mb(uploaded_file):.2f}",
    )
    return ok(_file_payload(attachment), status=201)
