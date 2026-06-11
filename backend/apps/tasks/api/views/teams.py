from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import api_login_required, error, ok, payload
from apps.tasks.api.serializers import current_user_payload
from apps.tasks.models import Team, TeamInvitation, TeamMember
from apps.tasks.services import create_team_invitation, invitation_actor_for_request


def get_default_team(user, team_id=None):
    if team_id:
        team = Team.objects.filter(id=team_id).filter(models.Q(owner=user) | models.Q(members__user=user)).distinct().first()
        if team:
            TeamMember.objects.get_or_create(
                team=team,
                user=user,
                defaults={"role": TeamMember.ROLE_OWNER if team.owner_id == user.id else TeamMember.ROLE_MEMBER},
            )
            return team

    team, _ = Team.objects.get_or_create(
        owner=user,
        name="TaskFlow Workspace",
        defaults={"description": "Default workspace"},
    )
    TeamMember.objects.get_or_create(
        team=team,
        user=user,
        defaults={"role": TeamMember.ROLE_OWNER},
    )
    return team


def team_payload(team):
    return {"id": team.id, "name": team.name, "description": team.description or ""}


def member_payload(member):
    user = member.user
    return {
        "id": user.id,
        "name": user.get_full_name() or user.username,
        "email": user.email or user.username,
        "role": member.role.title(),
        "status": "online" if member.status == TeamMember.STATUS_ACTIVE else "offline",
        "online": member.status == TeamMember.STATUS_ACTIVE,
    }


@csrf_exempt
@api_login_required
@require_http_methods(["GET", "POST"])
def teams_collection(request):
    if request.method == "GET":
        teams = Team.objects.filter(members__user=request.user).distinct()
        if not teams.exists():
            teams = Team.objects.filter(id=get_default_team(request.user).id)
        return ok([team_payload(team) for team in teams])
    data = payload(request)
    team = Team.objects.create(
        owner=request.user,
        name=str(data.get("name") or "TaskFlow Workspace").strip(),
        description=str(data.get("description") or "").strip(),
    )
    TeamMember.objects.create(team=team, user=request.user, role=TeamMember.ROLE_OWNER)
    return ok(team_payload(team), status=201)


@csrf_exempt
@api_login_required
@require_http_methods(["GET", "PATCH", "DELETE"])
def team_detail(request, team_id):
    team = get_default_team(request.user, team_id)
    if request.method == "DELETE":
        if team.owner_id != request.user.id:
            return error("Only the team owner can delete this team.", status=403)
        team.delete()
        return ok(message="Team deleted")
    if request.method == "PATCH":
        data = payload(request)
        team.name = str(data.get("name") or team.name).strip()
        team.description = str(data.get("description") or team.description or "").strip()
        team.save(update_fields=["name", "description", "updated_at"])
    return ok(team_payload(team))


@csrf_exempt
@api_login_required
@require_http_methods(["GET", "PATCH", "DELETE"])
def team_members(request, team_id, member_id=None):
    team = get_default_team(request.user, team_id)
    if member_id:
        member = TeamMember.objects.filter(team=team, user_id=member_id).select_related("user").first()
        if not member:
            return error("Team member not found.", status=404)

        actor = TeamMember.objects.filter(team=team, user=request.user).first()
        if not actor or actor.role not in {TeamMember.ROLE_OWNER, TeamMember.ROLE_ADMIN}:
            return error("Only owners and admins can manage team members.", status=403)

        if request.method == "DELETE":
            if member.role == TeamMember.ROLE_OWNER:
                return error("Owner cannot be removed.", status=400)
            member.delete()
            return ok(message="Team member removed")

        data = payload(request)
        role = str(data.get("role") or "").strip().lower()
        allowed = {TeamMember.ROLE_ADMIN, TeamMember.ROLE_MEMBER, TeamMember.ROLE_VIEWER}
        if role not in allowed:
            return error("Invalid role selected.", status=400)
        member.role = role
        member.save(update_fields=["role"])
        return ok(member_payload(member))

    if request.method == "DELETE":
        return ok(message="Team member removed")
    members = TeamMember.objects.filter(team=team).select_related("user").order_by("role", "user__first_name", "user__username")
    return ok([member_payload(member) for member in members])


@csrf_exempt
@api_login_required
@require_http_methods(["GET", "POST"])
def team_invitations(request, team_id):
    team = get_default_team(request.user, team_id)
    if request.method == "GET":
        invitations = TeamInvitation.objects.filter(team=team).select_related("team", "invited_by").order_by("-created_at")[:50]
        return ok([
            {
                "id": invitation.id,
                "email": invitation.email,
                "role": invitation.role,
                "status": invitation.status,
                "team": invitation.team.name,
                "createdAt": invitation.created_at.isoformat(),
            }
            for invitation in invitations
        ])

    data = payload(request)
    try:
        invitation, _, _ = create_team_invitation(
            actor=invitation_actor_for_request(request),
            email=data.get("email"),
            role=data.get("role", "member"),
            message=data.get("message", ""),
            project_names=data.get("projects", []),
            team=team,
        )
    except ValidationError as exc:
        message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
        return error(message, status=400)

    return ok(
        {
            "id": invitation.id,
            "email": invitation.email,
            "role": invitation.role,
            "status": invitation.status,
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["POST"])
def invitation_accept(request, token):
    invitation = TeamInvitation.objects.filter(token=token).first()
    if not invitation:
        return error("Invitation not found.", status=404)
    invitation.status = TeamInvitation.STATUS_ACCEPTED
    invitation.accepted_at = timezone.now()
    invitation.save(update_fields=["status", "accepted_at"])
    return ok(message="Invitation accepted")


@csrf_exempt
@require_http_methods(["POST", "DELETE"])
def invitation_action(request, invitation_id, action=None):
    if request.method == "DELETE":
        TeamInvitation.objects.filter(id=invitation_id).update(status=TeamInvitation.STATUS_CANCELLED)
        return ok(message="Invitation cancelled")
    return ok(message="Invitation resent")


def team_presence(request, team_id):
    return ok([{"id": member["id"], "status": member["status"]} for member in mock_data.TEAM_MEMBERS])


@csrf_exempt
@require_http_methods(["PATCH"])
def user_presence(request):
    return ok({"user": current_user_payload(request.user), "presence": payload(request).get("presence", "online")})


def team_frontend_data(request):
    return ok({"members": mock_data.clone(mock_data.TEAM_MEMBERS), "notifications": mock_data.clone(mock_data.TEAM_NOTIFICATIONS)})
