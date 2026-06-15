from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction

from apps.tasks.models import Project, Team, TeamInvitation, TeamInvitationProject


def invitation_actor_for_request(request):
    if request.user.is_authenticated:
        return request.user

    User = get_user_model()
    system_user, _ = User.objects.get_or_create(
        username="system",
        defaults={
            "email": "system@example.com",
            "is_active": False,
        },
    )
    return system_user


def clean_invitation_payload(email, role, project_names):
    email = str(email or "").strip().lower()
    role = str(role or "member").strip().lower()

    if not isinstance(project_names, list):
        raise ValidationError("Projects must be a list.")

    validate_email(email)

    allowed_roles = {choice[0] for choice in TeamInvitation.ROLE_CHOICES}
    if role not in allowed_roles:
        raise ValidationError("Invalid role selected.")

    projects = [str(name).strip() for name in project_names if str(name).strip()]
    return email, role, list(dict.fromkeys(projects))


@transaction.atomic
def create_team_invitation(
    *,
    actor,
    email,
    role="member",
    positions="Member",
    message="",
    project_names=None,
    team=None,
    team_id=None,
):
    email, role, project_names = clean_invitation_payload(email, role, project_names or [])
    message = str(message or "").strip()
    positions = str(positions or "Member").strip()

    if team is None and team_id is not None:
        team, _ = Team.objects.get_or_create(
            id=team_id,
            defaults={
                "name": "TaskFlow Workspace",
                "description": "Default workspace for team collaboration.",
                "owner": actor,
            },
        )

    if team is None:
        team, _ = Team.objects.get_or_create(
            owner=actor,
            name="TaskFlow Workspace",
            defaults={"description": "Default workspace for team collaboration."},
        )

    invitation = TeamInvitation.objects.create(
        team=team,
        email=email,
        role=role,
        message=message,
        invited_by=actor,
    )

    # Automatically add to TeamMember if user exists
    from django.contrib.auth.models import User
    from apps.tasks.models import TeamMember
    invited_user = User.objects.filter(email=email).first() or User.objects.filter(username=email).first()
    if invited_user:
        TeamMember.objects.get_or_create(
            team=team,
            user=invited_user,
            defaults={
                "role": role,
                "positions": positions,
                "status": TeamMember.STATUS_ACTIVE
            }
        )

    linked_projects = []
    for project_name in project_names:
        project, _ = Project.objects.get_or_create(
            user=actor,
            name=project_name,
            defaults={"description": "Created from a team invitation."},
        )
        TeamInvitationProject.objects.create(invitation=invitation, project=project)
        linked_projects.append(project.name)

    return invitation, team, linked_projects
