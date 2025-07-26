@echo off
setlocal enabledelayedexpansion

REM Script to setup and run the Aloo backend
echo Checking prerequisites...

REM Check Python installation
python --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

REM Check PostgreSQL installation
set PG_PATH=C:\Program Files\PostgreSQL
set PG_VERSION=
for /d %%i in ("%PG_PATH%\*") do (
    set "PG_VERSION=%%~nxi"
)

if "%PG_VERSION%"=="" (
    echo PostgreSQL is not found in the default location
    echo Please install PostgreSQL and add it to PATH
    pause
    exit /b 1
)

set PATH=%PATH%;%PG_PATH%\%PG_VERSION%\bin

REM Create virtual environment if it doesn't exist
if not exist ".venv" (
    echo Creating Python virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Install PostgreSQL development files for psycopg2
echo Installing PostgreSQL dependencies...
set PATH=%PATH%;%PG_PATH%\%PG_VERSION%\lib

REM Install Python dependencies
echo Installing Python dependencies...
pip install --upgrade pip
pip install wheel
pip install -r requirements.txt

REM Setup PostgreSQL database
echo Setting up PostgreSQL database...
SET PGPASSWORD=postgres
psql -U postgres -d postgres -c "SELECT 1 FROM pg_database WHERE datname='aloo'" | findstr "1" > nul
if %ERRORLEVEL% NEQ 0 (
    echo Creating database...
    psql -U postgres -c "CREATE DATABASE aloo"
) else (
    echo Database already exists
)

REM Initialize database
echo Initializing database...
cd app
python -c "from db.init_script import init_db, create_sample_data; from db.session import SessionLocal; db = SessionLocal(); init_db(); create_sample_data(db); db.close()"

REM Start the backend server
echo Starting the backend server...
uvicorn main:app --reload --port 8000
