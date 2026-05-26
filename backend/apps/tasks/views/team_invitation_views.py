import json

from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from apps.tasks.services import create_team_invitation, invitation_actor_for_request


@require_POST
def invite_team_member(request):
    try:
        data = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"ok": False, "error": "Invalid JSON payload."}, status=400)

    try:
        invitation, team, linked_projects = create_team_invitation(
            actor=invitation_actor_for_request(request),
            email=data.get("email"),
            role=data.get("role", "member"),
            message=data.get("message", ""),
            project_names=data.get("projects", []),
        )
    except ValidationError as exc:
        message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
        if message == "Enter a valid email address.":
            message = "Please enter a valid email address."
        return JsonResponse({"ok": False, "error": message}, status=400)

    return JsonResponse(
        {
            "ok": True,
            "message": "Invitation sent",
            "invitation": {
                "id": invitation.id,
                "email": invitation.email,
                "role": invitation.role,
                "team": team.name,
                "projects": linked_projects,
            },
        },
        status=201,
    )
