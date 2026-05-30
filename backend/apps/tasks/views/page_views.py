from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "pages/dashboard/index.html"


class ProjectView(LoginRequiredMixin, TemplateView):
    template_name = "pages/timeline/index.html"


class TeamView(LoginRequiredMixin, TemplateView):
    template_name = "pages/team/index.html"
