# Testing And QA Report

## Backend Test Commands

```powershell
cd D:\htdakt\backend
.\.venv\Scripts\Activate.ps1
python manage.py check
python manage.py test
```

Neu MySQL user khong co quyen tao test database:

```powershell
$env:DB_ENGINE='django.db.backends.sqlite3'
$env:DB_NAME=':memory:'
python manage.py test
Remove-Item Env:DB_ENGINE
Remove-Item Env:DB_NAME
```

## Frontend Screenshot QA

Da chay Playwright de chup tat ca man hinh chinh o ca dark mode va light mode.

Thu muc anh:

```text
QA/screenshots/
```

Report:

```text
QA/screenshots/README.md
QA/screenshots/screenshot-report.json
```

## Ket Qua Gan Nhat

| Hang muc | Ket qua |
| --- | --- |
| Tong anh | 58 |
| Dark mode | 29 anh |
| Light mode | 29 anh |
| Auth | Login, Register |
| Dashboard | Overview, notifications, profile menu |
| Workspace | Overview, project list, add project modal, Kanban, add task modal, task detail, List, Calendar |
| Team | Overview, invite modal, notifications, profile menu |
| Files | Overview, create folder modal, notifications, profile menu |
| Settings | Profile, Preferences, Account Management, Delete modal, Team Permissions, notifications, profile menu |
| Logout | Confirm logout |

## Loi Da Sua Trong Lan QA

- Sua endpoint Team data tu `/api/teams/data/` sang `/api/team/data/`.
- Xoa ky tu `}` bi render du trong Kanban column.
- Doi TIP trong Settings sang tieng Anh.

## Loi/Canh Bao Con Lai

Mot so request `ERR_ABORTED` xuat hien trong screenshot report do Playwright chuyen trang nhanh trong khi request font/image/API dang tai. Cac anh UI chinh van duoc chup day du.

Can tiep tuc kiem tra sau:

- Friend request flow.
- Files upload flow voi file storage that.
- Google OAuth tren domain Railway sau khi co credential that.

## Manual Test Checklist

| Test case | Trang | Ket qua mong doi |
| --- | --- | --- |
| Login bang email/password | `/login/` | Vao dashboard |
| Register account moi | `/login/` Sign up tab | Account duoc tao |
| Tao workspace | `/project/` | Workspace hien trong sidebar va database |
| Tao project | `/project/` | Project hien trong Workspace Projects |
| Tao task | Kanban View | Task hien dung column |
| Keo task sang Done | Kanban View | Status Done, progress 100% |
| Doi progress task | Add/Edit Task | Percent cap nhat dung |
| Chuyen dark/light | Header toggle | UI doi theme khong loi mau |
| Tao folder file | `/files/` | Folder hien trong Files |
| Cap nhat profile | `/settings/` | UI hien thong tin moi |

