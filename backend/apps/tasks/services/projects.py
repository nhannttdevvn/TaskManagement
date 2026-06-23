from django.core.exceptions import ValidationError
from django.db import transaction

from apps.tasks.models import Notification, Project, ProjectFavorite, ProjectMember
from apps.tasks.services.notifications import notify_many, notify_user


def validate_project_name(name, team=None, exclude=None):
    name = str(name or "").strip()
    if not name:
        raise ValidationError("Project name is required.")
    query = Project.objects.filter(name__iexact=name)
    if team:
        query = query.filter(team=team)
    if exclude:
        query = query.exclude(id=exclude.id)
    if query.exists():
        raise ValidationError("A project with this name already exists in this workspace.")
    return name


@transaction.atomic
def create_project(*, actor, team, name, description=""):
    name = validate_project_name(name, team=team)
    project = Project.objects.create(
        name=name,
        description=description or "",
        user=actor,
        team=team,
    )
    if team:
        recipients = [member.user for member in team.members.select_related("user")]
        notify_many(
            recipients=recipients,
            actor=actor,
            type=Notification.TYPE_PROJECT,
            body=f"{project.name} created.",
            target_type="project",
            target_id=project.id,
        )
    return project


@transaction.atomic
def update_project(*, actor, project, data):
    if "name" in data or "title" in data:
        project.name = validate_project_name(data.get("name") or data.get("title") or project.name, team=project.team, exclude=project)
    if "description" in data:
        project.description = data.get("description") or ""
    project.save()
    notify_user(
        recipient=project.user,
        actor=actor,
        type=Notification.TYPE_PROJECT,
        body=f"{project.name} updated.",
        target_type="project",
        target_id=project.id,
    )
    return project


@transaction.atomic
def delete_project(*, actor, project):
    notify_user(
        recipient=project.user,
        actor=actor,
        type=Notification.TYPE_PROJECT,
        body=f"{project.name} deleted.",
        target_type="project",
        target_id=project.id,
    )
    project.delete()


def set_project_favorite(*, actor, project, favorite):
    if favorite:
        ProjectFavorite.objects.get_or_create(user=actor, project=project)
    else:
        ProjectFavorite.objects.filter(user=actor, project=project).delete()


@transaction.atomic
def upsert_project_member(*, actor, project, user_id, role):
    allowed_roles = {choice[0] for choice in ProjectMember.ROLE_CHOICES}
    if role not in allowed_roles:
        raise ValidationError("Invalid project role selected.")
    member, _ = ProjectMember.objects.update_or_create(
        project=project,
        user_id=user_id,
        defaults={"role": role},
    )
    notify_user(
        recipient=member.user,
        actor=actor,
        type=Notification.TYPE_PROJECT,
        body=f"You were added to {project.name}.",
        target_type="project",
        target_id=project.id,
    )
    return member
