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
    from django.db.models import Q
    from apps.tasks.models import Team, TeamMember

    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)

    if request.method == "GET":
        teams = Team.objects.filter(Q(owner=user) | Q(members__user=user)).distinct().order_by("-created_at")
        
        # Auto-create a default workspace for authenticated users if none exist
        if not teams.exists():
            team = Team.objects.create(name="Default Workspace", owner=user)
            TeamMember.objects.create(team=team, user=user, role=TeamMember.ROLE_OWNER, status=TeamMember.STATUS_ACTIVE)
            teams = Team.objects.filter(id=team.id)

        teams_data = []
        for team in teams:
            members = [m.user.username[:2].upper() for m in team.members.all()[:4]]
            if not members:
                members = [user.username[:2].upper()]
            
            project_names = list(team.projects.values_list("name", flat=True))

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

    team = Team.objects.create(
        name=name,
        description=description,
        owner=user
    )
    TeamMember.objects.create(
        team=team,
        user=user,
        role=TeamMember.ROLE_OWNER,
        status=TeamMember.STATUS_ACTIVE
    )

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
        "progress": 0,
        "tasks": 0,
        "done": 0,
    }, status=201)


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
    from apps.tasks.models import Team, TeamMember
    user = request.user
    if not user.is_authenticated:
        return error("Authentication required.", status=401)

    try:
        team = Team.objects.get(id=team_id)
        member = TeamMember.objects.filter(team=team, user=user).first()
        if not member or member.role not in [TeamMember.ROLE_OWNER, TeamMember.ROLE_ADMIN]:
            return error("You do not have permission to manage invitations in this workspace.", status=403)
    except (Team.DoesNotExist, ValueError):
        pass

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
            positions=data.get("positions", "Member"),
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
    from django.db.models import Q
    from apps.tasks.models import Team, TeamMember
    
    user = request.user
    workspace_id = request.GET.get("workspace_id")
    
    team = None
    if workspace_id:
        try:
            team = Team.objects.get(id=workspace_id)
        except (Team.DoesNotExist, ValueError):
            pass
            
    if not team and user.is_authenticated:
        team = Team.objects.filter(Q(owner=user) | Q(members__user=user)).first()
        
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
                "messages": [
                    {"body": f"Welcome to {team.name} workspace!", "time": "10:00 AM"}
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
                "messages": [
                    {"body": "Hello team, let's collaborate on this workspace.", "time": "09:00 AM"}
                ]
            })
            
        return ok({
            "members": members_list,
            "notifications": mock_data.clone(mock_data.TEAM_NOTIFICATIONS)
        })
        
    return ok({"members": mock_data.clone(mock_data.TEAM_MEMBERS), "notifications": mock_data.clone(mock_data.TEAM_NOTIFICATIONS)})
