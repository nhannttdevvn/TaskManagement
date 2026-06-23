from django.db import transaction

from apps.tasks.models import Team, TeamMember


@transaction.atomic
def create_workspace(*, actor, name, description=""):
    team = Team.objects.create(name=name, description=description or "", owner=actor)
    TeamMember.objects.create(
        team=team,
        user=actor,
        role=TeamMember.ROLE_OWNER,
        status=TeamMember.STATUS_ACTIVE,
    )
    return team


def team_members_payload(team):
    return [member.user for member in team.members.select_related("user")]
