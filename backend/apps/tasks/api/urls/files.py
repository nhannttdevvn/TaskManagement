from django.urls import path

from apps.tasks.api.views import files_collection, files_upload, folders_collection

urlpatterns = [
    path("", files_collection, name="api_files"),
    path("folders/", folders_collection, name="api_file_folders"),
    path("upload/", files_upload, name="api_file_upload"),
]
