@echo off
chcp 65001 >nul
REM ============================================================
REM  TaskFlow - chay server dev de xem giao dien tren trinh duyet
REM  Nhay doi (double-click) file nay, doi cai dat xong, roi mo:
REM    http://127.0.0.1:8000/team/
REM ============================================================
cd /d "%~dp0backend"

if not exist venv (
  echo [1/4] Tao moi truong ao Python...
  python -m venv venv
)

echo [2/4] Kich hoat moi truong ao...
call venv\Scripts\activate.bat

echo [3/4] Cai dat thu vien (lan dau hoi lau)...
python -m pip install --upgrade pip >nul
pip install -r requirements.txt

echo [4/4] Cap nhat co so du lieu...
python manage.py migrate

echo.
echo ============================================================
echo  Server dang chay. Mo trinh duyet va vao cac dia chi sau:
echo    Dashboard : http://127.0.0.1:8000/dashboard/
echo    Team chat : http://127.0.0.1:8000/team/
echo    Files     : http://127.0.0.1:8000/files/
echo    Settings  : http://127.0.0.1:8000/settings/
echo    Timeline  : http://127.0.0.1:8000/timeline/
echo.
echo  Lan dau can dang ky tai khoan tai: http://127.0.0.1:8000/login/
echo  (Nhan Ctrl+C tai cua so nay de dung server)
echo ============================================================
echo.
python manage.py runserver
pause
