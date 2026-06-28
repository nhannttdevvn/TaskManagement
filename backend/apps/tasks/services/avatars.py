from pathlib import Path
from time import time
from urllib.parse import quote

from django.conf import settings


ALLOWED_AVATAR_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_AVATAR_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
}


def avatar_upload_max_size():
    return int(getattr(settings, "AVATAR_UPLOAD_MAX_SIZE", 25 * 1024 * 1024))


def avatar_upload_max_mb():
    return round(avatar_upload_max_size() / (1024 * 1024))


def _avatar_dir():
    path = Path(settings.MEDIA_ROOT) / "avatars"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _avatar_url(filename):
    media_url = "/" + str(settings.MEDIA_URL).strip("/") + "/"
    return f"{media_url}avatars/{quote(filename)}"


def _avatar_files_for_user(user):
    if not user or not getattr(user, "is_authenticated", False):
        return []
    directory = _avatar_dir()
    return [path for path in directory.glob(f"user_{user.pk}_*") if path.is_file()]


def get_user_avatar_url(user):
    files = _avatar_files_for_user(user)
    if not files:
        return ""
    latest = max(files, key=lambda path: path.stat().st_mtime)
    return _avatar_url(latest.name)


def delete_user_avatar(user):
    for path in _avatar_files_for_user(user):
        path.unlink(missing_ok=True)


def validate_avatar_file(uploaded_file):
    if not uploaded_file:
        return "Please choose an avatar image."

    if uploaded_file.size > avatar_upload_max_size():
        return f"Avatar must be {avatar_upload_max_mb()}MB or smaller."

    extension = Path(uploaded_file.name or "").suffix.lower()
    if extension not in ALLOWED_AVATAR_EXTENSIONS:
        return "Avatar must be JPG, PNG, GIF, or WebP."

    content_type = (getattr(uploaded_file, "content_type", "") or "").lower()
    if content_type and content_type not in ALLOWED_AVATAR_MIME_TYPES:
        return "Avatar file type is not supported."

    return ""


def save_user_avatar(user, uploaded_file):
    validation_error = validate_avatar_file(uploaded_file)
    if validation_error:
        raise ValueError(validation_error)

    delete_user_avatar(user)

    extension = Path(uploaded_file.name).suffix.lower()
    filename = f"user_{user.pk}_{int(time())}{extension}"
    target = _avatar_dir() / filename
    with target.open("wb+") as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)

    return _avatar_url(filename)
