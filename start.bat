@echo off
echo Starting WebChat Application...

REM Start backend server
start cmd /k "cd backend && npm start"

REM Wait a moment for backend to initialize
timeout /t 5

REM Start frontend server
start cmd /k "cd frontend && npm run dev"

echo WebChat servers are starting. Please check the command windows for details. 