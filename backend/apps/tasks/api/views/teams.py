from django.core.exceptions import ValidationError
from django.db.models import Q
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from apps.tasks.api.responses import error, ok, payload
from apps.tasks.api.serializers import current_user_payload, notification_payload
from apps.tasks.models import ChatMessage, Notification, Team, TeamInvitation, TeamMember
from apps.tasks.permissions import can_manage_workspace
from apps.tasks.services import create_team_invitation, invitation_actor_for_request
from apps.tasks.services.teams import create_workspace


def visible_teams(user):
    if not user.is_authenticated:
        return Team.objects.none()
    return Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct()


def team_for_request(user, team_id):
    return visible_teams(user).filter(id=team_id).first()


def can_manage_team(user, team):
    return can_manage_workspace(user, team)


def team_member_payload(member):
    user = member.user
    role_label = member.role.capitalize()
    if member.positions:
        role_label = f"{role_label}, {member.positions}"
    return {
        "id": str(user.id),
        "name": user.get_full_name() or user.username,
        "role": role_label,
        "status": "online" if member.status == TeamMember.STATUS_ACTIVE else "offline",
        "avatar": "",
        "messages": [
            {"body": f"Welcome to {member.team.name} workspace.", "time": "System"}
        ],
    }


def chat_room_name(user_id, other_user_id):
    ids = sorted([str(user_id), str(other_user_id)])
    return "_".join(ids)


def chat_history_payload(user, other_user):
    room_name = chat_room_name(user.id, other_user.id)
    messages = ChatMessage.objects.filter(room_name=room_name).order_by("-created_at")[:50]
    rows = []
    for message in reversed(list(messages)):
        rows.append({
            "body": message.body,
            "sender_id": message.sender_id,
            "sender_name": message.sender_name,
            "time": message.created_at.strftime("%I:%M %p"),
        })
    return rows


@require_http_methods(["GET", "POST"])
def teams_collection(request):
    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)

    if request.method == "GET":
        teams = visible_teams(user).order_by("-created_at")
        
        teams_data = []
        for team in teams:
            members = [m.user.username[:2].upper() for m in team.members.all()[:4]]
            if not members:
                members = [user.username[:2].upper()]
            
            project_names = list(team.projects.values_list("name", flat=True))
            project_ids = {project.name: project.id for project in team.projects.all()}

            teams_data.append({
                "id": str(team.id),
                "databaseId": team.id,
                "name": team.name,
                "breadcrumb": "/ Workspaces",
                "category": "Active",
                "company": "My Workspace",
                "date": "No date",
                "members": members,
                "projects": project_names,
                "projectIds": project_ids,
                "inviteUrl": f"/api/teams/{team.id}/invitations/",
                "progress": 0,
                "tasks": 0,
                "done": 0,
            })
        return ok(teams_data)

    data = payload(request)
    name = data.get("name") or data.get("title")
    description = data.get("description", "")

    if not name:
        return error("Workspace name is required.", status=400)

    team = create_workspace(actor=user, name=name, description=description)

    members = [user.username[:2].upper()]
    return ok({
        "id": str(team.id),
        "databaseId": team.id,
        "name": team.name,
        "breadcrumb": "/ Workspaces",
        "category": "Active",
        "company": "My Workspace",
        "date": "No date",
        "members": members,
        "projects": [],
        "projectIds": {},
        "inviteUrl": f"/api/teams/{team.id}/invitations/",
        "progress": 0,
        "tasks": 0,
        "done": 0,
    }, status=201)


@require_http_methods(["GET", "PATCH", "DELETE"])
def team_detail(request, team_id):
    team = team_for_request(request.user, team_id)
    if not team:
        return error("Workspace not found or not accessible.", status=404)
    if request.method == "DELETE":
        if not can_manage_team(request.user, team):
            return error("You do not have permission to delete this workspace.", status=403)
        team.delete()
        return ok(message="Team deleted")
    if request.method == "PATCH":
        if not can_manage_team(request.user, team):
            return error("You do not have permission to update this workspace.", status=403)
        data = payload(request)
        if "name" in data:
            team.name = data.get("name") or team.name
        if "description" in data:
            team.description = data.get("description") or ""
        team.save()
    return ok({"id": str(team.id), "databaseId": team.id, "name": team.name, "description": team.description or ""})


@require_http_methods(["GET", "DELETE"])
def team_members(request, team_id, member_id=None):
    team = team_for_request(request.user, team_id)
    if not team:
        return error("Workspace not found or not accessible.", status=404)
    if request.method == "DELETE":
        if not can_manage_team(request.user, team):
            return error("You do not have permission to remove members.", status=403)
        TeamMember.objects.filter(team=team, user_id=member_id).exclude(user=team.owner).delete()
        return ok(message="Team member removed")
    return ok([team_member_payload(member) for member in team.members.select_related("user").order_by("joined_at")])


@require_http_methods(["GET", "POST"])
def team_invitations(request, team_id):
    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)

    team = team_for_request(user, team_id)
    if not team:
        return error("Workspace not found or not accessible.", status=404)
    if not can_manage_team(user, team):
        return error("You do not have permission to manage invitations in this workspace.", status=403)

    if request.method == "GET":
        invitations = TeamInvitation.objects.select_related("team", "invited_by").filter(team=team).order_by("-created_at")[:50]
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
            positions=data.get("positions", "Member"),
            message=data.get("message", ""),
            project_names=data.get("projects", []),
            team=team,
        )
    except ValidationError as exc:
        message = exc.messages[0] if hasattr(exc, "messages") else str(exc)
        if "role" in message.lower():
            code = "invalid_role"
        elif "pending invitation" in message.lower():
            code = "duplicate_invitation"
        else:
            code = "bad_request"
        return error(message, status=400, code=code)

    return ok(
        {
            "id": invitation.id,
            "email": invitation.email,
            "role": invitation.role,
            "status": invitation.status,
        },
        status=201,
    )


@require_http_methods(["POST"])
def invitation_accept(request, token):
    invitation = TeamInvitation.objects.filter(token=token).first()
    if not invitation:
        return error("Invitation not found.", status=404)
    invitation.status = TeamInvitation.STATUS_ACCEPTED
    invitation.accepted_at = timezone.now()
    invitation.save(update_fields=["status", "accepted_at"])
    return ok(message="Invitation accepted")


@require_http_methods(["POST", "DELETE"])
def invitation_action(request, invitation_id, action=None):
    if request.method == "DELETE":
        TeamInvitation.objects.filter(id=invitation_id).update(status=TeamInvitation.STATUS_CANCELLED)
        return ok(message="Invitation cancelled")
    return ok(message="Invitation resent")


def team_presence(request, team_id):
    team = team_for_request(request.user, team_id)
    if not team:
        return error("Workspace not found or not accessible.", status=404)
    return ok([
        {"id": str(member.user_id), "status": "online" if member.status == TeamMember.STATUS_ACTIVE else "offline"}
        for member in team.members.select_related("user")
    ])


@require_http_methods(["PATCH"])
def user_presence(request):
    return ok({"user": current_user_payload(request.user), "presence": payload(request).get("presence", "online")})


def team_frontend_data(request):
    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)

    workspace_id = request.GET.get("workspace_id")
    
    team = None
    if workspace_id:
        try:
            team = team_for_request(user, workspace_id)
        except (Team.DoesNotExist, ValueError):
            pass
            
    if not team:
        team = visible_teams(user).first()
        
    if team:
        members_list = []
        # Add the owner first if they are not in members
        owner_member = team.members.filter(user=team.owner).first()
        if not owner_member:
            members_list.append({
                "id": str(team.owner.id),
                "name": team.owner.get_full_name() or team.owner.username,
                "role": "Owner, Creator",
                "status": "online",
                "avatar": "",
                "messages": chat_history_payload(user, team.owner) or [
                    {"body": f"Welcome to {team.name} workspace!", "time": "System"}
                ]
            })
            
        for m in team.members.select_related("user"):
            role_label = m.role.capitalize()
            if m.positions:
                role_label = f"{role_label}, {m.positions}"
                
            members_list.append({
                "id": str(m.user.id),
                "name": m.user.get_full_name() or m.user.username,
                "role": role_label,
                "status": "online" if m.status == TeamMember.STATUS_ACTIVE else "offline",
                "avatar": "",
                "messages": chat_history_payload(user, m.user) or [
                    {"body": "Hello team, let's collaborate on this workspace.", "time": "System"}
                ]
            })
            
        return ok({
            "team": {
                "id": str(team.id),
                "databaseId": team.id,
                "name": team.name,
                "inviteUrl": f"/api/teams/{team.id}/invitations/",
                "canManage": can_manage_team(user, team),
                "projects": list(team.projects.values_list("name", flat=True)),
            },
            "members": members_list,
            "notifications": [
                notification_payload(notification)
                for notification in Notification.objects.filter(recipient=user).order_by("-created_at")[:20]
            ],
        })
        
    return ok({"team": None, "members": [], "notifications": []})
