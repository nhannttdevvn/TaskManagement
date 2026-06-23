from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.dateparse import parse_date

from apps.tasks.models import Task, TaskAttachment, TaskComment, TaskFavorite
from apps.tasks.services.notifications import record_task_activity


STATUS_BY_LABEL = {
    "todo": "todo",
    "to do": "todo",
    "in_progress": "in_progress",
    "in progress": "in_progress",
    "review": "review",
    "done": "done",
}

PRIORITY_BY_LABEL = {
    "low": "low",
    "medium": "medium",
    "high": "high",
}


def normalize_status(value, default="todo"):
    key = str(value or default).replace("-", " ").replace("_", " ").strip().lower()
    if key not in STATUS_BY_LABEL:
        raise ValidationError({"status": "Invalid task status."})
    return STATUS_BY_LABEL[key]


def normalize_priority(value, default="medium"):
    key = str(value or default).strip().lower()
    if key not in PRIORITY_BY_LABEL:
        raise ValidationError({"priority": "Invalid task priority."})
    return PRIORITY_BY_LABEL[key]


def parse_due_date(value):
    value = str(value or "").strip()
    if not value or value.lower() == "no date":
        return None
    parsed = parse_date(value)
    if parsed is None:
        raise ValidationError("Due date must use YYYY-MM-DD.")
    return parsed


def number_value(value, default, minimum=None):
    try:
        parsed = float(value)
    except (TypeError, ValueError):
        return default
    if minimum is not None:
        parsed = max(minimum, parsed)
    return parsed


def int_value(value, default, minimum=0):
    try:
        parsed = int(float(value))
    except (TypeError, ValueError):
        return default
    return max(minimum, parsed)


def apply_task_payload(task, data, actor=None, action="task_updated"):
    changed = {}
    if "title" in data:
        next_value = str(data.get("title") or task.title).strip() or task.title
        if next_value != task.title:
            changed["title"] = [task.title, next_value]
            task.title = next_value
    if "subtitle" in data or "description" in data:
        next_value = data.get("description", data.get("subtitle", "")) or ""
        if next_value != (task.description or ""):
            changed["description"] = [task.description or "", next_value]
            task.description = next_value
    if "status" in data:
        next_value = normalize_status(data.get("status"), task.status)
        if next_value != task.status:
            changed["status"] = [task.status, next_value]
            task.status = next_value
    if "priority" in data:
        next_value = normalize_priority(data.get("priority"), task.priority)
        if next_value != task.priority:
            changed["priority"] = [task.priority, next_value]
            task.priority = next_value
    if "due_date" in data or "due" in data:
        next_value = parse_due_date(data.get("due_date", data.get("due")))
        if next_value != task.due_date:
            changed["due_date"] = [str(task.due_date), str(next_value)]
            task.due_date = next_value
    if "start" in data:
        task.start = number_value(data.get("start"), task.start, minimum=0)
        changed["start"] = task.start
    if "duration" in data:
        task.duration = number_value(data.get("duration"), task.duration, minimum=0.25)
        changed["duration"] = task.duration
    if "row" in data:
        task.row = int_value(data.get("row"), task.row)
        changed["row"] = task.row
    task.save()
    if changed:
        record_task_activity(
            task=task,
            actor=actor,
            action=action,
            body=f"{task.title} updated.",
            metadata={"changed": changed},
        )
    return task


@transaction.atomic
def create_task(*, actor, project, data):
    title = str(data.get("title") or "New Task").strip()
    if not title:
        raise ValidationError("Task title is required.")
    task = Task.objects.create(
        user=actor,
        project=project,
        title=title,
        description=data.get("description", data.get("subtitle", "")) or "",
        status=normalize_status(data.get("status", "todo")),
        priority=normalize_priority(data.get("priority", "medium")),
        due_date=parse_due_date(data.get("due_date", data.get("due"))),
        start=number_value(data.get("start"), 9, minimum=0),
        duration=number_value(data.get("duration"), 1, minimum=0.25),
        row=max(0, int(number_value(data.get("row"), 0, minimum=0))),
    )
    record_task_activity(
        task=task,
        actor=actor,
        action="task_created",
        body=f"{task.title} created.",
        metadata={"project": project.id},
    )
    return task


@transaction.atomic
def delete_task(*, actor, task):
    record_task_activity(task=task, actor=actor, action="task_deleted", body=f"{task.title} deleted.", notify=False)
    task.delete()


def set_task_favorite(*, actor, task, favorite):
    if favorite:
        TaskFavorite.objects.get_or_create(user=actor, task=task)
    else:
        TaskFavorite.objects.filter(user=actor, task=task).delete()


def add_task_comment(*, actor, task, body):
    comment = TaskComment.objects.create(task=task, user=actor, body=body or "")
    record_task_activity(task=task, actor=actor, action="comment_added", body=f"Comment added to {task.title}.")
    return comment


def add_task_attachment(*, actor, task, name, size=""):
    attachment = TaskAttachment.objects.create(task=task, user=actor, name=name or "uploaded-file", size=size or "")
    record_task_activity(task=task, actor=actor, action="attachment_added", body=f"Attachment added to {task.title}.")
    return attachment
