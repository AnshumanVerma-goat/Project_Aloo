@echo off
setlocal enabledelayedexpansion

REM --- SETUP AND RUN THE ALOO FRONTEND ---
echo Checking prerequisites...

REM 1. Check Node.js installation
node --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 14+.
    pause
    exit /b 1
)

cd frontend

REM 2. Install npm dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install npm dependencies.
        pause
        exit /b 1
    )
)

REM 3. Start the frontend development server
echo Starting the frontend development server on http://localhost:5173
call npm run dev

endlocal
