@echo off
setlocal enabledelayedexpansion
set ROOT_DIR=%~dp0

echo Starting Blog Application...

REM Kill any existing process on port 8080
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Killing process %%a on port 8080...
    taskkill /PID %%a /F >nul 2>&1
)

REM Start MySQL service (assuming it's installed as service)
echo Starting MySQL service...
net start mysql >nul 2>&1

echo Starting backend...
start "Backend" cmd /k "cd /d "%ROOT_DIR%demo" && .\mvnw.cmd spring-boot:run"

echo Starting frontend...
start "Frontend" cmd /k "cd /d "%ROOT_DIR%blog-frontend" && npm start"

echo All services launched.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
pause
