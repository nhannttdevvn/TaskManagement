from .settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": str(ROOT_DIR / "db.sqlite3"),
    }
}
