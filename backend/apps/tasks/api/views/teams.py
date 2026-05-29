from django.core.exceptions import ValidationError
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.tasks.api import mock_data
from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import current_user_payload
from apps.tasks.models import TeamInvitation
from apps.tasks.services import create_team_invitation, invitation_actor_for_request


@csrf_exempt
@require_http_methods(["GET", "POST"])
def teams_collection(request):
    if request.method == "GET":
        return ok([{"id": 1, "name": "TaskFlow Workspace", "description": "Default workspace"}])
    return ok({"id": "team-new", **payload(request)}, status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def team_detail(request, team_id):
    if request.method == "DELETE":
        return ok(message="Team deleted")
    return ok({"id": team_id, "name": payload(request).get("name", "TaskFlow Workspace")})


@csrf_exempt
@require_http_methods(["GET", "DELETE"])
def team_members(request, team_id, member_id=None):
    if request.method == "DELETE":
        return ok(message="Team member removed")
    return ok(mock_data.clone(mock_data.TEAM_MEMBERS))


@csrf_exempt
@require_http_methods(["GET", "POST"])
def team_invitations(request, team_id):
    if request.method == "GET":
        invitations = TeamInvitation.objects.select_related("team", "invited_by").order_by("-created_at")[:50]
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
            team_id=team_id,
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
