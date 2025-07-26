@echo off
REM Script to setup and run the Aloo backend

REM Check if PostgreSQL is installed
where psql > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL is not found in PATH
    echo Please install PostgreSQL and add it to PATH
    echo Default location is: C:\Program Files\PostgreSQL\{version}\bin
    pause
    exit /b 1
)

echo Setting up PostgreSQL database...
SET PGPASSWORD=projectaloo123
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS aloo"
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -c "CREATE DATABASE aloo"

echo Installing Python dependencies...
pip install -r requirements.txt

echo Initializing database...
cd app
python -c "from db.init_script import init_db, create_sample_data; from db.session import SessionLocal; db = SessionLocal(); init_db(); create_sample_data(db); db.close()"

echo Starting the backend server...
uvicorn main:app --reload --port 8000
