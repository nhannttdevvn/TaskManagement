from django.db import migrations, models
from django.db.models import Count


def dedupe_projects(apps, schema_editor):
    Project = apps.get_model("tasks", "Project")
    TeamInvitationProject = apps.get_model("tasks", "TeamInvitationProject")
    ProjectMember = apps.get_model("tasks", "ProjectMember")

    duplicates = (
        Project.objects.values("user_id", "name")
        .annotate(total=Count("id"))
        .filter(total__gt=1)
    )

    for duplicate in duplicates:
        projects = list(
            Project.objects.filter(
                user_id=duplicate["user_id"],
                name=duplicate["name"],
            ).order_by("-created_at", "-id")
        )
        canonical = projects[0]
        stale_projects = projects[1:]

        for stale_project in stale_projects:
            for relation in TeamInvitationProject.objects.filter(project_id=stale_project.id):
                exists = TeamInvitationProject.objects.filter(
                    invitation_id=relation.invitation_id,
                    project_id=canonical.id,
                ).exists()
                if exists:
                    relation.delete()
                else:
                    relation.project_id = canonical.id
                    relation.save(update_fields=["project"])

            for relation in ProjectMember.objects.filter(project_id=stale_project.id):
                exists = ProjectMember.objects.filter(
                    project_id=canonical.id,
                    user_id=relation.user_id,
                ).exists()
                if exists:
                    relation.delete()
                else:
                    relation.project_id = canonical.id
                    relation.save(update_fields=["project"])

            stale_project.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0003_team_teaminvitation_teammember_teaminvitationproject_and_more"),
    ]

    operations = [
        migrations.RunPython(dedupe_projects, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="project",
            constraint=models.UniqueConstraint(
                fields=("user", "name"),
                name="unique_project_name_per_user",
            ),
        ),
    ]
