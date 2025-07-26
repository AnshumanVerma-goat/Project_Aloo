@echo off
setlocal enabledelayedexpansion

echo Checking prerequisites...

REM Check Node.js installation
node --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH
    echo Please install Node.js 14 or higher
    pause
    exit /b 1
)

cd frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install npm dependencies
        pause
        exit /b 1
    )
)

REM Start the frontend server
echo Starting the frontend development server...
call npm run dev

endlocal
