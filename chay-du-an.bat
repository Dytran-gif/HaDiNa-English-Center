@echo off
chcp 65001 >nul
REM Chay ca du an: double-click file nay (hoac go: chay-du-an.bat)
REM  - Backend: tu tao/cap nhat database (tu backup truoc khi migrate)
REM  - Frontend: tu npm install neu thu vien thay doi
cd /d "%~dp0"
where dotnet >nul 2>nul || (echo [LOI] Chua cai .NET 10 SDK: https://dotnet.microsoft.com/download & pause & exit /b 1)
where npm >nul 2>nul || (echo [LOI] Chua cai Node.js: https://nodejs.org & pause & exit /b 1)
start "HaDI Backend (localhost:5220)" cmd /k "cd /d app\backend\EnglishCenter.Api\EnglishCenter.Api && dotnet run --launch-profile http"
start "HaDI Frontend (localhost:5173)" cmd /k "cd /d app\frontend && npm run dev"
echo Dang khoi dong backend va frontend... trinh duyet se mo sau it giay.
timeout /t 15 /nobreak >nul
start "" http://localhost:5173
