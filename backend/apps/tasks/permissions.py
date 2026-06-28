from apps.tasks.models import ProjectMember, TeamMember


def can_view_workspace(user, team):
    if not user.is_authenticated or not team:
        return False
    if team.owner_id == user.id:
        return True
    return TeamMember.objects.filter(team=team, user=user).exists()


def can_manage_workspace(user, team):
    if not user.is_authenticated or not team:
        return False
    if team.owner_id == user.id:
        return True
    return TeamMember.objects.filter(
        team=team,
        user=user,
        role__in=[TeamMember.ROLE_OWNER, TeamMember.ROLE_ADMIN],
    ).exists()


def can_view_project(user, project):
    if not user.is_authenticated or not project:
        return False
    if project.user_id == user.id:
        return True
    return can_view_workspace(user, project.team)


def can_manage_project(user, project):
    if not user.is_authenticated or not project:
        return False
    if project.user_id == user.id:
        return True
    if can_manage_workspace(user, project.team):
        return True
    return ProjectMember.objects.filter(
        project=project,
        user=user,
        role=ProjectMember.ROLE_MANAGER,
    ).exists()


def can_edit_task(user, task):
    if not user.is_authenticated or not task:
        return False
    if task.user_id == user.id:
        return True
    if task.assignees.filter(id=user.id).exists():
        return True
    return can_manage_project(user, task.project)
