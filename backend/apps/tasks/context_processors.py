from django.conf import settings

def google_oauth_status(request):
    google_client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
    google_client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", "")
    return {
        "google_oauth_enabled": bool(google_client_id and google_client_secret)
    }

def workspace_role(request):
    user = request.user
    role = "viewer"
    if user and user.is_authenticated:
        from apps.tasks.models import TeamMember
        workspace_id = request.GET.get("workspace_id")
        if workspace_id:
            request.session["active_workspace_id"] = workspace_id
        else:
            workspace_id = request.session.get("active_workspace_id")

        membership = None
        if workspace_id:
            try:
                membership = TeamMember.objects.filter(team_id=workspace_id, user=user).first()
            except (ValueError, TypeError):
                pass
        if not membership:
            membership = TeamMember.objects.filter(user=user).first()
            if membership:
                request.session["active_workspace_id"] = str(membership.team_id)
        if membership:
            role = membership.role
    return {
        "workspace_role": role
    }
