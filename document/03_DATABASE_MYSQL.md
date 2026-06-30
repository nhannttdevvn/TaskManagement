# MySQL Database Documentation

## Muc Tieu

Backend su dung MySQL lam database that de luu:

- User account.
- Workspace/team.
- Project.
- Task.
- Comment, attachment, notification.
- Invitation, friendship, chat.

SQLite chi la fallback cho developer chua cau hinh MySQL.

## Tao Database Trong MySQL Workbench

Mo MySQL Workbench va chay:

```sql
CREATE DATABASE task_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'task_management_user'@'localhost' IDENTIFIED BY 'change-this-password';

GRANT ALL PRIVILEGES ON task_management.* TO 'task_management_user'@'localhost';

FLUSH PRIVILEGES;
```

## Cau Hinh `backend/.env`

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

## Chay Migration

```powershell
cd D:\htdakt\backend
.\.venv\Scripts\Activate.ps1
python manage.py migrate
```

## Kiem Tra Ket Noi Database

```powershell
python manage.py check
python manage.py showmigrations
```

## Bang Du Lieu Chinh

| Model | Bang DB | Y nghia |
| --- | --- | --- |
| User | `auth_user` | Tai khoan dang nhap |
| Team | `tasks_team` | Workspace |
| TeamMember | `tasks_teammember` | Thanh vien workspace |
| Project | `tasks_project` | Project trong workspace |
| ProjectMember | `tasks_projectmember` | Phan quyen project |
| Task | `tasks_task` | Cong viec |
| TaskComment | `tasks_taskcomment` | Binh luan task |
| TaskAttachment | `tasks_taskattachment` | File/attachment metadata |
| Notification | `tasks_notification` | Thong bao |
| TeamInvitation | `tasks_teaminvitation` | Loi moi vao team |
| Friendship | `tasks_friendship` | Ket ban |
| ChatMessage | `tasks_chatmessage` | Tin nhan chat |

## Luu Y

- Khong commit `backend/.env` vi co thong tin nhay cam.
- Can chay MySQL service truoc khi `migrate`.
- Warning `account.EmailAddress (models.W036)` tren MySQL/allauth la warning ve unique constraint co dieu kien, khong chan migration.
- Nen dung user rieng cho app, khong dung root.

