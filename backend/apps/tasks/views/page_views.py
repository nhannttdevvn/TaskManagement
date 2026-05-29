from django.views.generic import TemplateView


class DashboardView(TemplateView):
    template_name = "pages/dashboard/index.html"


class ProjectView(TemplateView):
    template_name = "pages/timeline/index.html"


class TeamView(TemplateView):
    template_name = "pages/team/index.html"
