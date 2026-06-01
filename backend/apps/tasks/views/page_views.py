from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.views import View
from django.views.generic import TemplateView


class RootRedirectView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect("dashboard")
        return redirect("login")


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "pages/dashboard/index.html"


class ProjectView(LoginRequiredMixin, TemplateView):
    template_name = "pages/timeline/index.html"


class TeamView(LoginRequiredMixin, TemplateView):
    template_name = "pages/team/index.html"


class EquipmentView(LoginRequiredMixin, TemplateView):
    template_name = "pages/equipment/index.html"
