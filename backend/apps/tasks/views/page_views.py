from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.views import View
from django.views.generic import TemplateView

from apps.tasks.models import Team, TeamMember


class RootRedirectView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect("dashboard")
        return redirect("login")


class WorkspaceContextMixin:
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["workspace_role"] = self.workspace_role()
        return context

    def workspace_role(self):
        membership = (
            TeamMember.objects.filter(user=self.request.user, status=TeamMember.STATUS_ACTIVE)
            .select_related("team")
            .order_by("joined_at")
            .first()
        )
        if membership:
            return membership.role.title()

        if self.request.user.is_authenticated:
            team, _ = Team.objects.get_or_create(
                owner=self.request.user,
                name="TaskFlow Workspace",
                defaults={"description": "Default workspace"},
            )
            TeamMember.objects.get_or_create(
                team=team,
                user=self.request.user,
                defaults={"role": TeamMember.ROLE_OWNER},
            )
            return "Owner"
        return "Viewer"


class DashboardView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "pages/dashboard/index.html"


class ProjectView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "pages/timeline/index.html"


class TeamView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "pages/team/index.html"


class EquipmentView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "pages/equipment/index.html"


class SettingsView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "settings/index.html"


class FilesView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "files/index.html"


class UpdatesView(WorkspaceContextMixin, LoginRequiredMixin, TemplateView):
    template_name = "pages/updates/index.html"
