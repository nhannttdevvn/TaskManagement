from pathlib import Path

from django.db.models import Count, Sum
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import api_login_required, error, ok, payload
from apps.tasks.models import FileAsset, FileFolder


FOLDER_ICONS = {
    "blue": "folder",
    "violet": "music",
    "emerald": "briefcase",
    "amber": "folder-open",
    "cyan": "cloud",
    "rose": "folder-heart",
}

TYPE_ICONS = {
    "Images": ("image", "bg-emerald-400/20 text-emerald-200"),
    "Documents": ("file-text", "bg-blue-400/20 text-blue-200"),
    "Videos": ("film", "bg-rose-400/20 text-rose-200"),
    "Audio": ("music", "bg-violet-400/20 text-violet-200"),
    "Other": ("file", "bg-amber-400/20 text-amber-200"),
}


def file_type_for_name(name):
    suffix = Path(name).suffix.lower()
    if suffix in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
        return "Images"
    if suffix in {".doc", ".docx", ".pdf", ".txt", ".md", ".xls", ".xlsx", ".ppt", ".pptx"}:
        return "Documents"
    if suffix in {".mp4", ".mov", ".avi", ".mkv", ".webm"}:
        return "Videos"
    if suffix in {".mp3", ".wav", ".flac", ".m4a"}:
        return "Audio"
    return "Other"


def folder_payload(folder):
    return {
        "id": str(folder.id),
        "name": folder.name,
        "count": folder.files.count(),
        "color": folder.color,
        "icon": folder.icon,
        "members": 1,
        "shared": folder.shared,
        "updatedAt": 0,
    }


def file_payload(file_asset):
    icon, accent = TYPE_ICONS.get(file_asset.file_type, TYPE_ICONS["Other"])
    return {
        "id": file_asset.id,
        "name": file_asset.name,
        "size": round(file_asset.size_mb, 2),
        "modified": file_asset.updated_at.strftime("%b %d,%Y"),
        "members": 1,
        "icon": icon,
        "accent": accent,
    }


def storage_payload(files):
    by_type = {item["file_type"]: float(item["size"] or 0) for item in files}
    return [
        {"label": "Images", "used": round(by_type.get("Images", 0), 2), "total": 120, "icon": "image", "color": "from-cyan-400 to-blue-500"},
        {"label": "Documents", "used": round(by_type.get("Documents", 0), 2), "total": 80, "icon": "file-text", "color": "from-amber-400 to-rose-500"},
        {"label": "Videos", "used": round(by_type.get("Videos", 0), 2), "total": 60, "icon": "film", "color": "from-rose-400 to-fuchsia-500"},
        {"label": "Other", "used": round(by_type.get("Audio", 0) + by_type.get("Other", 0), 2), "total": 70, "icon": "file", "color": "from-emerald-400 to-cyan-500"},
    ]


@csrf_exempt
@api_login_required
@require_http_methods(["GET"])
def files_collection(request):
    folders = FileFolder.objects.filter(owner=request.user).annotate(file_count=Count("files"))
    files = FileAsset.objects.filter(owner=request.user).select_related("folder")[:40]
    storage_rows = (
        FileAsset.objects.filter(owner=request.user)
        .values("file_type")
        .annotate(size=Sum("size_mb"))
    )
    return ok(
        {
            "folders": [folder_payload(folder) for folder in folders],
            "recentFiles": [file_payload(file_asset) for file_asset in files],
            "storageBreakdown": storage_payload(storage_rows),
        }
    )


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def file_folders(request):
    data = payload(request)
    name = str(data.get("name") or "").strip()
    if not name:
        return error("Folder name is required.", status=400)

    color = str(data.get("color") or "blue").strip() or "blue"
    folder, created = FileFolder.objects.get_or_create(
        owner=request.user,
        name=name,
        defaults={
            "color": color,
            "icon": str(data.get("icon") or FOLDER_ICONS.get(color, "folder")),
        },
    )
    if not created:
        return error("Folder name already exists.", status=400)
    return ok(folder_payload(folder), status=201)


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def file_upload(request):
    uploaded = request.FILES.get("file")
    if not uploaded:
        return error("No file was uploaded.", status=400)

    folder = None
    folder_id = request.POST.get("folder_id")
    if folder_id:
        folder = FileFolder.objects.filter(id=folder_id, owner=request.user).first()

    file_asset = FileAsset.objects.create(
        owner=request.user,
        folder=folder,
        name=uploaded.name,
        size_mb=uploaded.size / (1024 * 1024),
        file_type=file_type_for_name(uploaded.name),
    )
    return ok(file_payload(file_asset), status=201)
