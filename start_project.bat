@echo off
setlocal enabledelayedexpansion

echo Starting Aloo Project...

REM Start the backend in a new window
start "Aloo Backend" cmd /c "run_backend_new.bat"

REM Wait a moment for backend to initialize
timeout /t 5 /nobreak

REM Start the frontend in a new window
cd frontend
start "Aloo Frontend" cmd /c "npm install && npm run dev"
cd ..

echo.
echo Aloo Project is starting...
echo.
echo Frontend will be available at: http://localhost:5177
echo Backend will be available at:  http://localhost:8000
echo.
echo Press any key to stop all servers...
pause > nul

REM Kill all node and Python processes started by this script
taskkill /F /IM node.exe /T > nul 2>&1
taskkill /F /IM python.exe /T > nul 2>&1

endlocal
