@echo off
echo Starting Aloo Application...

REM Start backend in a new window
echo Starting Backend Server...
start "Aloo Backend" cmd /k "run_backend_new.bat"

REM Wait a few seconds for the backend to initialize the database
echo Waiting for backend to initialize...
timeout /t 8

REM Start frontend in a new window
echo Starting Frontend Server...
start "Aloo Frontend" cmd /k "run_frontend_new.bat"

echo.
echo Both servers are starting up in separate windows.
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:8000
echo.
echo To stop the application, close the two new command prompt windows.
pause
