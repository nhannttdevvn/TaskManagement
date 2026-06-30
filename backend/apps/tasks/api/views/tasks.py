from django.core.exceptions import ValidationError
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import activity_payload, task_payload
from apps.tasks.models import Task, TaskAttachment, TaskComment
from apps.tasks.permissions import can_edit_task
from apps.tasks.selectors import visible_task_filter
from apps.tasks.services.tasks import (
    add_task_attachment,
    add_task_comment,
    apply_task_payload,
    delete_task,
    int_value,
    set_task_favorite,
)


def validation_code(exc):
    fields = getattr(exc, "message_dict", {})
    if "status" in fields:
        return "invalid_status"
    if "priority" in fields:
        return "invalid_priority"
    return "bad_request"


def visible_task(request, task_id):
    if not request.user.is_authenticated:
        return None
    if not str(task_id).isdigit():
        return None
    return (
        Task.objects.select_related("user", "project", "project__team")
        .filter(visible_task_filter(request.user), id=task_id)
        .distinct()
        .first()
    )


@require_http_methods(["GET", "PATCH", "DELETE"])
def task_detail(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)

    if request.method == "DELETE":
        if not can_edit_task(request.user, task):
            return error("You do not have permission to delete this task.", status=403)
        delete_task(actor=request.user, task=task)
        return ok(message="Task deleted")

    if request.method == "PATCH":
        if not can_edit_task(request.user, task):
            return error("You do not have permission to update this task.", status=403)
        try:
            task = apply_task_payload(task, payload(request), actor=request.user)
        except ValidationError as exc:
            return error(exc.messages[0], status=400, code=validation_code(exc))
    return ok(task_payload(task))


@require_http_methods(["PATCH"])
def task_status(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    if not can_edit_task(request.user, task):
        return error("You do not have permission to update this task.", status=403)
    data = payload(request)
    try:
        update = {"status": data.get("status")}
        if "progress" in data:
            update["progress"] = data.get("progress")
        task = apply_task_payload(task, update, actor=request.user, action="status_changed")
    except ValidationError as exc:
        return error(exc.messages[0], status=400, code=validation_code(exc))
    return ok(task_payload(task))


@require_http_methods(["PATCH"])
def task_position(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    if not can_edit_task(request.user, task):
        return error("You do not have permission to update this task.", status=403)
    data = payload(request)
    update = {
        "position": int_value(data.get("position"), task.position),
        "row": int_value(data.get("row"), task.row),
    }
    if "status" in data:
        update["status"] = data.get("status")
    if "progress" in data:
        update["progress"] = data.get("progress")
    task = apply_task_payload(
        task,
        update,
        actor=request.user,
        action="position_changed",
    )
    return ok(task_payload(task))


@require_http_methods(["POST", "DELETE"])
def task_favorite(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    if not request.user.is_authenticated:
        return error("Authentication required.", status=401)
    set_task_favorite(actor=request.user, task=task, favorite=request.method == "POST")
    return ok({"taskId": str(task.id), "favorite": request.method == "POST"})


@require_http_methods(["GET", "POST"])
def task_comments(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    if request.method == "POST" and not can_edit_task(request.user, task):
        return error("You do not have permission to comment on this task.", status=403)
    if request.method == "POST":
        data = payload(request)
        comment = add_task_comment(actor=request.user, task=task, body=data.get("body", ""))
        return ok(
            {
                "id": str(comment.id),
                "taskId": str(task.id),
                "body": comment.body,
                "author": request.user.get_full_name() or request.user.username,
                "createdAt": "Just now",
            },
            status=201,
        )
    return ok([
        {
            "id": str(comment.id),
            "taskId": str(task.id),
            "body": comment.body,
            "author": comment.user.get_full_name() or comment.user.username,
            "createdAt": comment.created_at.strftime("%b %d, %Y %I:%M %p"),
        }
        for comment in task.comments.select_related("user")
    ])


@require_http_methods(["PATCH", "DELETE"])
def comment_detail(request, comment_id):
    comment = TaskComment.objects.filter(id=comment_id).select_related("task", "user").first()
    if not comment:
        return error("Comment not found.", status=404)
    if not can_edit_task(request.user, comment.task) and comment.user_id != request.user.id:
        return error("You do not have permission to update this comment.", status=403)
    if request.method == "DELETE":
        comment.delete()
        return ok(message="Comment deleted")
    data = payload(request)
    comment.body = data.get("body", comment.body)
    comment.save(update_fields=["body"])
    return ok({"id": str(comment.id), "body": comment.body})


def task_activity(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    return ok([
        activity_payload(activity)
        for activity in task.activities.select_related("task").order_by("-created_at")[:50]
    ])


@require_http_methods(["GET", "POST"])
def task_attachments(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    if request.method == "POST" and not can_edit_task(request.user, task):
        return error("You do not have permission to upload attachments for this task.", status=403)
    if request.method == "POST":
        data = payload(request)
        attachment = add_task_attachment(
            actor=request.user,
            task=task,
            name=data.get("name") or "uploaded-file",
            size=data.get("size", ""),
        )
        return ok({"id": str(attachment.id), "taskId": str(task.id), "name": attachment.name, "size": attachment.size}, status=201)
    return ok([
        {"id": str(attachment.id), "taskId": str(task.id), "name": attachment.name, "size": attachment.size}
        for attachment in task.attachments.select_related("user")
    ])


@require_http_methods(["DELETE"])
def attachment_detail(request, attachment_id):
    attachment = TaskAttachment.objects.filter(id=attachment_id).select_related("task").first()
    if not attachment:
        return error("Attachment not found.", status=404)
    if not can_edit_task(request.user, attachment.task):
        return error("You do not have permission to delete this attachment.", status=403)
    attachment.delete()
    return ok(message="Attachment deleted")


@require_http_methods(["PATCH"])
def task_schedule(request, task_id):
    task = visible_task(request, task_id)
    if not task:
        return error("Task not found or not accessible.", status=404)
    if not can_edit_task(request.user, task):
        return error("You do not have permission to update this task.", status=403)
    try:
        task = apply_task_payload(task, payload(request), actor=request.user, action="schedule_changed")
    except ValidationError as exc:
        return error(exc.messages[0], status=400, code=validation_code(exc))
    return ok(task_payload(task))
