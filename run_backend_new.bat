@echo off
setlocal enabledelayedexpansion

REM --- SETUP AND RUN THE ALOO BACKEND ---
echo Checking prerequisites...

REM 1. Check Python and PostgreSQL
python --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.8+.
    pause
    exit /b 1
)
set "PG_PATH=C:\Program Files\PostgreSQL"
set "PG_VERSION="
for /d %%i in ("%PG_PATH%\*") do ( set "PG_VERSION=%%~nxi" )
if "%PG_VERSION%"=="" (
    echo [ERROR] PostgreSQL is not found in the default location.
    pause
    exit /b 1
)
set "PATH=%PATH%;%PG_PATH%\%PG_VERSION%\bin"

REM 2. Create and activate Python virtual environment
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)
call .venv\Scripts\activate.bat

REM 3. Install Python dependencies
echo Installing Python dependencies from requirements.txt...
pip install --upgrade pip > nul
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install Python dependencies. Please check errors above.
    pause
    exit /b 1
)

REM 4. Setup PostgreSQL database
echo Setting up PostgreSQL database...
set PGPASSWORD=postgres
psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname='aloo'" | findstr "1" > nul
if %ERRORLEVEL% NEQ 0 (
    echo Creating database 'aloo'...
    psql -U postgres -c "CREATE DATABASE aloo"
) else (
    echo Database 'aloo' already exists.
)

REM 5. Initialize database
echo Initializing database...
cd app
python -c "from db.init_script import init_db, create_sample_data; from db.session import SessionLocal; db = SessionLocal(); init_db(); create_sample_data(db); db.close()"
cd ..

REM 6. Start the backend server
echo Starting the backend server on http://localhost:8000
uvicorn app.main:app --reload --port 8000

endlocal
