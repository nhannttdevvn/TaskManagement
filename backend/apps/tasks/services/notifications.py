from django.utils import timezone

from apps.tasks.models import Notification, TaskActivity


def notify_user(*, recipient, actor=None, type=Notification.TYPE_TASK, body, target_type="", target_id=""):
    if not recipient or not getattr(recipient, "is_authenticated", True):
        return None
    return Notification.objects.create(
        recipient=recipient,
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        type=type,
        body=str(body)[:255],
        target_type=str(target_type or ""),
        target_id=str(target_id or ""),
    )


def notify_many(*, recipients, actor=None, type=Notification.TYPE_TASK, body, target_type="", target_id=""):
    seen = set()
    notifications = []
    for recipient in recipients:
        if not recipient or recipient.id in seen:
            continue
        seen.add(recipient.id)
        notifications.append(
            Notification(
                recipient=recipient,
                actor=actor if getattr(actor, "is_authenticated", False) else None,
                type=type,
                body=str(body)[:255],
                target_type=str(target_type or ""),
                target_id=str(target_id or ""),
            )
        )
    return Notification.objects.bulk_create(notifications)


def mark_notification_read(notification, actor):
    if notification.recipient_id != actor.id:
        return False
    if not notification.read_at:
        notification.read_at = timezone.now()
        notification.save(update_fields=["read_at"])
    return True


def record_task_activity(*, task, actor=None, action, body, metadata=None, notify=True):
    activity = TaskActivity.objects.create(
        task=task,
        actor=actor if getattr(actor, "is_authenticated", False) else None,
        action=action,
        body=str(body)[:255],
        metadata=metadata or {},
    )
    if notify and task.user_id and (not actor or task.user_id != actor.id):
        notify_user(
            recipient=task.user,
            actor=actor,
            type=Notification.TYPE_TASK,
            body=body,
            target_type="task",
            target_id=task.id,
        )
    return activity
