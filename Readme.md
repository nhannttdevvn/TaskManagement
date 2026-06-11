# Task Management System

Django backend with server-rendered frontend templates for task, project, team, dashboard, settings, files, login, and logout pages.

## Project Structure

- `backend/`: Django project, apps, middleware, APIs, migrations, and management commands.
- `frontend/`: HTML templates and static assets used by the Django backend.
- `backend/.env.example`: Environment variable template.
- `backend/requirements.txt`: Python dependencies, including `mysqlclient` for MySQL.

## Local Setup

```powershell
cd E:\htdakt\TaskManagement\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

SQLite is the default fallback database. To run with SQLite:

```powershell
python manage.py migrate
python manage.py runserver
```

Open `http://127.0.0.1:8000/`.

## MySQL Workbench Setup

Start the local MySQL Windows service:

```powershell
Start-Service MYSQL80
```

In MySQL Workbench, run this SQL:

```sql
CREATE DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'task_management_user'@'localhost' IDENTIFIED BY 'change-this-password';

GRANT ALL PRIVILEGES ON task_management.* TO 'task_management_user'@'localhost';

FLUSH PRIVILEGES;
```

Create `backend/.env` from `backend/.env.example` and set MySQL values:

```env
SECRET_KEY=change-me
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.mysql
DB_NAME=task_management
DB_USER=task_management_user
DB_PASSWORD=change-this-password
DB_HOST=127.0.0.1
DB_PORT=3306
```

Apply migrations to the empty MySQL database:

```powershell
cd E:\htdakt\TaskManagement\backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

## Google Login Setup

In Google Cloud Console, create an OAuth client for a web application and add this redirect URI:

```text
http://127.0.0.1:8000/accounts/google/login/callback/
```

Then set these values in `backend/.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

The app uses `/login/` as the only login/signup screen. Django allauth routes under `/accounts/` are used only for the Google OAuth flow.

## Useful Commands

```powershell
python manage.py check
python manage.py test
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## Expected Pages

- `http://127.0.0.1:8000/dashboard/`
- `http://127.0.0.1:8000/project/`
- `http://127.0.0.1:8000/team/`
- `http://127.0.0.1:8000/admin/`

## Notes

- Do not commit `backend/.env`; it contains local credentials.
- The MySQL database starts empty. Existing SQLite data is not imported.
- If MySQL is not configured, Django continues to use SQLite.
