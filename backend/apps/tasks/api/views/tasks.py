from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import task_payload
from apps.tasks.models import FileAsset, Task

STATUS_BY_LABEL = {
    "To Do": "todo",
    "Todo": "todo",
    "In Progress": "in_progress",
    "Done": "done",
    "todo": "todo",
    "in_progress": "in_progress",
    "done": "done",
}

PRIORITY_BY_LABEL = {
    "Low": "low",
    "Medium": "medium",
    "High": "high",
    "low": "low",
    "medium": "medium",
    "high": "high",
}


def database_task_for_request(request, task_id):
    if not str(task_id).isdigit() or not request.user.is_authenticated:
        return None
    return (
        Task.objects.select_related("project", "user")
        .filter(id=task_id, project__members__user=request.user)
        .distinct()
        .first()
    )


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def task_detail(request, task_id):
    db_task = database_task_for_request(request, task_id)
    if db_task:
        if request.method == "DELETE":
            db_task.delete()
            return ok(message="Task deleted")
        if request.method == "PATCH":
            data = payload(request)
            db_task.title = str(data.get("title") or db_task.title).strip()
            db_task.description = str(data.get("description") or db_task.description or "").strip()
            db_task.status = STATUS_BY_LABEL.get(data.get("status"), db_task.status)
            db_task.priority = PRIORITY_BY_LABEL.get(data.get("priority"), db_task.priority)
            if data.get("start") is not None:
                db_task.start = float(data.get("start") or db_task.start)
            if data.get("duration") is not None:
                db_task.duration = float(data.get("duration") or db_task.duration)
            if data.get("row") is not None:
                db_task.row = int(data.get("row") or db_task.row)
            db_task.save()
        return ok(task_payload(db_task))

    task = next((item for item in mock_data.PROJECT_TASKS if item["id"] == task_id), None)
    if request.method == "DELETE":
        return ok(message="Task deleted")
    if request.method == "PATCH":
        return ok({**(task or {"id": task_id}), **payload(request)})
    return ok(task or {"id": task_id, "title": "Task not found"})


@csrf_exempt
@require_http_methods(["PATCH"])
def task_status(request, task_id):
    db_task = database_task_for_request(request, task_id)
    next_status = payload(request).get("status", "To Do")
    if db_task:
        db_task.status = STATUS_BY_LABEL.get(next_status, db_task.status)
        db_task.save(update_fields=["status", "updated_at"])
        return ok(task_payload(db_task))
    return ok({"id": task_id, "status": next_status})


@csrf_exempt
@require_http_methods(["PATCH"])
def task_position(request, task_id):
    db_task = database_task_for_request(request, task_id)
    data = payload(request)
    if db_task:
        if data.get("start") is not None:
            db_task.start = float(data.get("start") or db_task.start)
        if data.get("duration") is not None:
            db_task.duration = float(data.get("duration") or db_task.duration)
        if data.get("row") is not None:
            db_task.row = int(data.get("row") or db_task.row)
        db_task.save(update_fields=["start", "duration", "row", "updated_at"])
        return ok(task_payload(db_task))
    return ok({"id": task_id, "position": data.get("position", 0)})


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
    if request.user.is_authenticated:
        FileAsset.objects.filter(id=attachment_id, owner=request.user).delete()
    return ok(message="Attachment deleted")


@csrf_exempt
@require_http_methods(["PATCH"])
def task_schedule(request, task_id):
    db_task = database_task_for_request(request, task_id)
    data = payload(request)
    if db_task:
        if data.get("start") is not None:
            db_task.start = float(data.get("start") or db_task.start)
        if data.get("duration") is not None:
            db_task.duration = float(data.get("duration") or db_task.duration)
        if data.get("row") is not None:
            db_task.row = int(data.get("row") or db_task.row)
        db_task.save(update_fields=["start", "duration", "row", "updated_at"])
        return ok(task_payload(db_task))
    return ok({"id": task_id, **data})
