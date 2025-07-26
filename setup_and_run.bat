@echo off
echo Setting up Aloo Project...

:: 1. Check PostgreSQL
echo Checking PostgreSQL...
"C:\Program Files\PostgreSQL\14\bin\pg_ctl.exe" status -D "C:\Program Files\PostgreSQL\14\data"
if %ERRORLEVEL% NEQ 0 (
    echo Starting PostgreSQL...
    net start postgresql-x64-14
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to start PostgreSQL
        pause
        exit /b 1
    )
)

:: 2. Initialize Database
echo Setting up database...
set PGPASSWORD=projectaloo123
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -f "app\db\init.sql"

:: 3. Create Python virtual environment
echo Setting up Python environment...
python -m venv .venv
call .venv\Scripts\activate.bat

:: 4. Install Python dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

:: 5. Start backend server
echo Starting backend server...
start cmd /k "call .venv\Scripts\activate.bat && cd app && uvicorn main:app --reload --port 8000"

:: 6. Start frontend server
echo Starting frontend server...
cd frontend
start cmd /k "python -m http.server 5173"

echo Setup complete! 
echo Backend running at: http://localhost:8000
echo Frontend running at: http://localhost:5173
pause
