@echo off
echo Starting Aloo Application...

REM Start backend in a new window
start cmd /k "run_backend_new.bat"

REM Wait for backend to initialize
timeout /t 5

REM Start frontend in a new window
start cmd /k "run_frontend_new.bat"

echo Both servers are starting...
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:8000
echo.
echo Press any key to close all servers...
pause

REM Kill all running servers
taskkill /F /IM node.exe > nul 2>&1
taskkill /F /IM python.exe > nul 2>&1
