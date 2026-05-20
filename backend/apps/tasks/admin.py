from django.contrib import admin

from .models import (
    Project,
    ProjectMember,
    Task,
    Team,
    TeamInvitation,
    TeamInvitationProject,
    TeamMember,
)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'priority', 'due_date', 'created_at')
    list_filter = ('status', 'priority', 'due_date')
    search_fields = ('title', 'description')
    date_hierarchy = 'created_at'


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'description', 'user__username')
    date_hierarchy = 'created_at'


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "created_at", "updated_at")
    search_fields = ("name", "description", "owner__username", "owner__email")
    date_hierarchy = "created_at"


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("team", "user", "role", "status", "joined_at")
    list_filter = ("role", "status", "joined_at")
    search_fields = ("team__name", "user__username", "user__email")
    date_hierarchy = "joined_at"


@admin.register(TeamInvitation)
class TeamInvitationAdmin(admin.ModelAdmin):
    list_display = ("email", "team", "role", "status", "invited_by", "expires_at", "created_at")
    list_filter = ("role", "status", "created_at", "expires_at")
    search_fields = ("email", "team__name", "invited_by__username", "invited_by__email")
    readonly_fields = ("token", "created_at", "accepted_at")
    date_hierarchy = "created_at"


@admin.register(TeamInvitationProject)
class TeamInvitationProjectAdmin(admin.ModelAdmin):
    list_display = ("invitation", "project")
    search_fields = ("invitation__email", "project__name")


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ("project", "user", "role", "joined_at")
    list_filter = ("role", "joined_at")
    search_fields = ("project__name", "user__username", "user__email")
    date_hierarchy = "joined_at"
