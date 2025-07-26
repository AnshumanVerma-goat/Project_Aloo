# Load environment variables
Get-Content ".\config.env" | foreach {
    $name, $value = $_.split('=')
    Set-Content env:\$name $value
}

Write-Host "Starting Aloo Project..." -ForegroundColor Green

# Ensure PostgreSQL is running
$pgService = Get-Service postgresql-x64-17 -ErrorAction SilentlyContinue
if ($pgService.Status -ne 'Running') {
    Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
    Start-Service postgresql-x64-17
    Start-Sleep -Seconds 5
}

# Initialize database
Write-Host "Initializing database..." -ForegroundColor Yellow
$pgPath = "C:\Program Files\PostgreSQL\17\bin"
if (Test-Path $pgPath) {
    $env:PATH = "$pgPath;$env:PATH"
    & psql -U $env:DB_USER -h $env:DB_HOST -p $env:DB_PORT -f "app/db/init.sql"
} else {
    Write-Host "PostgreSQL not found in default location. Please update the script with correct path." -ForegroundColor Red
    exit 1
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @"
cd '$PWD\app'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r ..\requirements.txt
uvicorn main:app --reload --port $env:BACKEND_PORT
"@ -WindowStyle Normal

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList @"
cd '$PWD\frontend'
npm install
npm run dev -- --port $env:FRONTEND_PORT
"@ -WindowStyle Normal

Write-Host "`nAloo Project is running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:$env:FRONTEND_PORT" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:$env:BACKEND_PORT" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
