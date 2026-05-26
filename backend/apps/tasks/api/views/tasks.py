from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import ok, payload


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


@csrf_exempt
@require_http_methods(["PATCH"])
def task_schedule(request, task_id):
    return ok({"id": task_id, **payload(request)})
