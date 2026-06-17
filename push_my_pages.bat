@echo off
chcp 65001 >nul
REM ============================================================
REM  Day CAC TRANG CUA BAN len nhanh feature/ui-components
REM  Cac trang: Settings, Files, Login, Logout, Team, theme.css
REM  Chi commit dung 10 file duoi day, KHONG dung file nguoi khac.
REM ============================================================
cd /d "%~dp0"

REM Go file khoa con sot (neu co) tu lan git bi gian doan
if exist ".git\index.lock" del /f ".git\index.lock"

echo === Branch hien tai ===
git branch --show-current
echo.

echo === Dam bao dang o nhanh feature/ui-components ===
git checkout feature/ui-components

echo.
echo === Stage dung cac trang cua ban ===
git add frontend/templates/settings/index.html
git add frontend/static/js/settings.js
git add frontend/templates/files/index.html
git add frontend/static/js/files.js
git add frontend/templates/auth/login.html
git add frontend/templates/auth/logout.html
git add frontend/static/js/auth.js
git add frontend/templates/pages/team/index.html
git add frontend/static/js/team.js
git add frontend/static/css/theme.css

echo.
echo === Cac file se duoc commit ===
git status -s

echo.
echo Nhan phim bat ky de COMMIT va PUSH, hoac dong cua so de huy...
pause >nul

git commit -m "feat(ui): dong bo chuong/nut/header + lien ket dieu huong, polish trang Team; fix light-mode theme.css (Settings, Files, Login, Logout, Team)"

echo.
echo === Day len GitHub ===
git push origin feature/ui-components

echo.
echo === XONG. Kiem tra tren GitHub nhe ===
pause
