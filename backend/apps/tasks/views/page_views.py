from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.views import View
from django.views.generic import TemplateView


class RootRedirectView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect("dashboard")
        return redirect("login")


class LoginPageView(TemplateView):
    template_name = "auth/login.html"

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect("dashboard")
        return super().dispatch(request, *args, **kwargs)


class LogoutPageView(LoginRequiredMixin, TemplateView):
    template_name = "auth/logout.html"
    login_url = "/login/"


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "pages/dashboard/index.html"
    login_url = "/login/"


class ProjectView(LoginRequiredMixin, TemplateView):
    template_name = "pages/timeline/index.html"
    login_url = "/login/"


class TeamView(LoginRequiredMixin, TemplateView):
    template_name = "pages/team/index.html"
    login_url = "/login/"


class SettingsPageView(LoginRequiredMixin, TemplateView):
    template_name = "settings/index.html"
    login_url = "/login/"


class FilesPageView(LoginRequiredMixin, TemplateView):
    template_name = "files/index.html"
    login_url = "/login/"

