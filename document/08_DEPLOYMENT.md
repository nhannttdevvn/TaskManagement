# Deployment Notes

## Docker

Project co `Dockerfile` o root.

Build image:

```powershell
docker build -t taskflow .
```

Run local:

```powershell
docker run -p 8000:8000 --env-file backend/.env taskflow
```

## Railway

Railway can cac bien moi truong:

```env
SECRET_KEY=your-production-secret
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.up.railway.app
CSRF_TRUSTED_ORIGINS=https://your-railway-domain.up.railway.app

DB_ENGINE=django.db.backends.mysql
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
DB_HOST=...
DB_PORT=3306

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## Start Command

Neu dung Daphne:

```text
python manage.py migrate && daphne -b 0.0.0.0 -p ${PORT:-8000} config.asgi:application
```

## Loi 502 Bad Gateway Tren Railway

Nguyen nhan thuong gap:

- App khong listen dung `$PORT`.
- Database production chua ket noi duoc.
- Migration loi khi container start.
- `ALLOWED_HOSTS` thieu Railway domain.
- `CSRF_TRUSTED_ORIGINS` thieu HTTPS domain.
- Google OAuth redirect URI chua dung domain production.

## Production Checklist

- `DEBUG=False`.
- `SECRET_KEY` la secret that, khong dung `change-me`.
- Database MySQL Railway da co migration.
- `ALLOWED_HOSTS` dung domain production.
- `CSRF_TRUSTED_ORIGINS` dung HTTPS domain production.
- Google redirect URI da them tren Google Cloud.
- Static files da collect.

