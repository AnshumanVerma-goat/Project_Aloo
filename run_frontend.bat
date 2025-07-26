@echo off
echo Starting Frontend Server...

:: Navigate to frontend directory
cd frontend

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing npm dependencies...
    npm install
)

:: Start the frontend server
echo Starting Vite server...
npm run dev
