# API Documentation

Tat ca API chinh nam duoi prefix:

```text
/api/
```

## Auth API

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| POST | `/api/auth/login/` | Dang nhap email/password |
| POST | `/api/auth/signup/` | Dang ky tai khoan |
| POST | `/api/auth/logout/` | Dang xuat |

Google OAuth su dung route cua django-allauth:

```text
/accounts/google/login/
/accounts/google/login/callback/
```

## Project API

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/projects/` | Lay danh sach project |
| POST | `/api/projects/` | Tao project |
| GET | `/api/projects/<project_id>/` | Lay chi tiet project |
| PATCH | `/api/projects/<project_id>/` | Cap nhat project |
| DELETE | `/api/projects/<project_id>/` | Xoa project |
| POST | `/api/projects/<project_id>/favorite/` | Favorite project |
| DELETE | `/api/projects/<project_id>/favorite/` | Bo favorite |
| GET | `/api/projects/<project_id>/members/` | Lay thanh vien project |
| POST | `/api/projects/<project_id>/members/` | Them thanh vien project |
| PATCH | `/api/projects/<project_id>/members/<member_id>/` | Cap nhat role thanh vien |
| DELETE | `/api/projects/<project_id>/members/<member_id>/` | Xoa thanh vien |
| GET | `/api/projects/<project_id>/tasks/` | Lay task theo project |
| POST | `/api/projects/<project_id>/tasks/` | Tao task trong project |
| GET | `/api/projects/<project_id>/timeline/` | Du lieu timeline |
| GET | `/api/projects/<project_id>/calendar/` | Du lieu calendar |

## Project Frontend Data

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/project/data/` | Gom data cho Workspace/Project page |

## Task API

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/tasks/<task_id>/` | Lay chi tiet task |
| PATCH | `/api/tasks/<task_id>/` | Cap nhat task |
| DELETE | `/api/tasks/<task_id>/` | Xoa task |
| PATCH | `/api/tasks/<task_id>/status/` | Cap nhat status/progress |
| PATCH | `/api/tasks/<task_id>/position/` | Cap nhat vi tri Kanban |
| PATCH | `/api/tasks/<task_id>/schedule/` | Cap nhat lich calendar |
| POST | `/api/tasks/<task_id>/favorite/` | Favorite task |
| DELETE | `/api/tasks/<task_id>/favorite/` | Bo favorite |
| GET | `/api/tasks/<task_id>/comments/` | Lay comment |
| POST | `/api/tasks/<task_id>/comments/` | Them comment |
| GET | `/api/tasks/<task_id>/activity/` | Lay activity log |
| GET | `/api/tasks/<task_id>/attachments/` | Lay attachment |
| POST | `/api/tasks/<task_id>/attachments/` | Them attachment |

## Team API

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/teams/` | Lay danh sach team/workspace |
| POST | `/api/teams/` | Tao team/workspace |
| GET | `/api/teams/<team_id>/` | Chi tiet team |
| PATCH | `/api/teams/<team_id>/` | Cap nhat team |
| DELETE | `/api/teams/<team_id>/` | Xoa team |
| GET | `/api/teams/<team_id>/members/` | Lay thanh vien |
| PATCH | `/api/teams/<team_id>/members/<member_id>/` | Cap nhat role |
| DELETE | `/api/teams/<team_id>/members/<member_id>/` | Xoa member |
| POST | `/api/teams/<team_id>/invitations/` | Gui loi moi |
| GET | `/api/teams/<team_id>/conversations/` | Lay hoi thoai |
| GET | `/api/teams/<team_id>/presence/` | Lay trang thai online |

## Team Frontend Data

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/team/data/` | Gom data cho Team page |

## Friend API

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/friends/search/?q=<keyword>` | Tim user |
| POST | `/api/friends/request/` | Gui friend request |
| POST | `/api/friends/respond/` | Chap nhan/tu choi request |
| GET | `/api/friends/list/` | Lay danh sach ban |
| GET | `/api/friends/requests/` | Lay request dang cho |

## Files API

| Method | Endpoint | Chuc nang |
| --- | --- | --- |
| GET | `/api/files/` | Lay folders/recent files |
| POST | `/api/files/folders/` | Tao folder |
| POST | `/api/files/upload/` | Upload file metadata |

## Response Format

API su dung response JSON theo dang:

```json
{
  "ok": true,
  "data": {}
}
```

Khi loi:

```json
{
  "ok": false,
  "message": "Error message"
}
```

