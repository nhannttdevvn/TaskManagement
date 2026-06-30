# Submission Checklist

Dung checklist nay truoc khi day len Git hoac nop bai.

## Code

- [ ] Khong commit `backend/.env`.
- [ ] Khong commit `.venv/`.
- [ ] Khong commit file cache `.pyc` hoac `__pycache__/`.
- [ ] Migration da day du.
- [ ] `python manage.py check` pass.
- [ ] `python manage.py migrate` chay duoc tren MySQL.
- [ ] Login/register hoat dong.
- [ ] Google login da co credential neu demo production.

## Database

- [ ] MySQL service dang chay.
- [ ] Database `task_management` ton tai.
- [ ] User `task_management_user` co quyen tren database.
- [ ] `.env` dung DB host/user/password.
- [ ] Tao workspace/project/task luu duoc vao database.

## UI/UX

- [ ] Dashboard load du lieu that.
- [ ] Workspace/Project khong mat du lieu khi chuyen trang.
- [ ] Kanban drag/drop task hoat dong.
- [ ] Progress task hien o Kanban/List/Calendar.
- [ ] Light mode va dark mode khong loi mau chu.
- [ ] Sidebar khong che noi dung.
- [ ] Login/register/logout full English.

## Documentation

- [ ] `document/README.md` co link den cac file.
- [ ] Co tai lieu setup.
- [ ] Co tai lieu database.
- [ ] Co tai lieu Django models.
- [ ] Co tai lieu API.
- [ ] Co tai lieu testing/QA.
- [ ] Co bang phan chia dong gop thanh vien.
- [ ] Co link screenshots.

## Git

Kiem tra thay doi:

```powershell
git status
```

Them file can commit:

```powershell
git add document
git add frontend/static/js/pages/team.js
git add frontend/static/js/pages/timeline/renderers.js
git add frontend/templates/settings/index.html
git add QA/screenshots
```

Khong nen add:

```text
backend/.env
.venv/
db.sqlite3
__pycache__/
*.pyc
```

Commit:

```powershell
git commit -m "docs: add project submission documentation"
```

