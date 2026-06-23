from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import Q

from apps.tasks.models import Notification, Project, Team, TeamInvitation, TeamInvitationProject
from apps.tasks.services.notifications import notify_user


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
        team = Team.objects.filter(id=team_id).first()
        if team is None:
            raise ValidationError("Workspace not found.")

    if team is None:
        teams = Team.objects.filter(Q(owner=actor) | Q(members__user=actor)).distinct()
        if teams.count() != 1:
            raise ValidationError("Workspace is required to invite members.")
        team = teams.first()

    if TeamInvitation.objects.filter(team=team, email=email, status=TeamInvitation.STATUS_PENDING).exists():
        raise ValidationError("This user already has a pending invitation for this workspace.")

    invitation = TeamInvitation.objects.create(
        team=team,
        email=email,
        role=role,
        message=message,
        invited_by=actor,
    )

    # Automatically add to TeamMember if user exists
    from apps.tasks.models import TeamMember
    User = get_user_model()
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
        notify_user(
            recipient=invited_user,
            actor=actor,
            type=Notification.TYPE_TEAM,
            body=f"You were invited to {team.name}.",
            target_type="team",
            target_id=team.id,
        )

    linked_projects = []
    for project_name in project_names:
        project, _ = Project.objects.get_or_create(
            user=actor,
            name=project_name,
            defaults={"description": "Created from a team invitation.", "team": team},
        )
        if project.team_id is None:
            project.team = team
            project.save(update_fields=["team"])
        TeamInvitationProject.objects.create(invitation=invitation, project=project)
        linked_projects.append(project.name)

    return invitation, team, linked_projects
