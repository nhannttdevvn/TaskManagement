# Setup And Run Guide

## Yeu Cau Moi Truong

- Python 3.12
- MySQL 8.x neu chay voi MySQL Workbench
- Git
- PowerShell tren Windows

## Cai Dat Backend

```powershell
cd D:\htdakt\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Neu `.venv` da ton tai thi chi can:

```powershell
cd D:\htdakt\backend
.\.venv\Scripts\Activate.ps1
```

## Cau Hinh Env

Sao chep file mau:

```powershell
copy .env.example .env
```

Neu chua dung MySQL, co the de mac dinh SQLite. Neu dung MySQL, xem chi tiet trong [03_DATABASE_MYSQL.md](03_DATABASE_MYSQL.md).

## Chay Migration

```powershell
python manage.py migrate
```

## Tao Superuser

```powershell
python manage.py createsuperuser
```

## Khoi Dong Server

```powershell
python manage.py runserver
```

Mo trinh duyet:

```text
http://127.0.0.1:8000/login/
```

## Cac Trang Chinh

| Trang | URL |
| --- | --- |
| Login/Register | `http://127.0.0.1:8000/login/` |
| Dashboard | `http://127.0.0.1:8000/dashboard/` |
| Workspace/Project | `http://127.0.0.1:8000/project/` |
| Team | `http://127.0.0.1:8000/team/` |
| Files | `http://127.0.0.1:8000/files/` |
| Settings | `http://127.0.0.1:8000/settings/` |
| Admin | `http://127.0.0.1:8000/admin/` |

## Lenh Kiem Tra

```powershell
python manage.py check
python manage.py test
```

Neu MySQL user khong co quyen tao test database, co the test bang SQLite tam thoi:

```powershell
$env:DB_ENGINE='django.db.backends.sqlite3'
$env:DB_NAME=':memory:'
python manage.py test
Remove-Item Env:DB_ENGINE
Remove-Item Env:DB_NAME
```

