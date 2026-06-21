@echo off
REM AI Video Note Extractor — Windows Start Script

echo 🎬 AI Video Note Extractor
echo ──────────────────────────────

REM Backend
echo.
echo 🐍 Starting backend on port 8000...
cd backend

if not exist "venv" (
    echo   Creating Python venv...
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -q -r requirements.txt
    echo   Dependencies installed
) else (
    call venv\Scripts\activate.bat
)

if not exist ".env" (
    copy .env.example .env
    echo   Created .env — add your API keys!
)

start /B cmd /c "uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Frontend
echo.
echo ⚛️  Starting frontend on port 3000...
cd ..\frontend

if not exist "node_modules" (
    echo   Installing npm packages...
    call npm install --silent
)

if not exist ".env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
)

start /B cmd /c "npm run dev"

echo.
echo ──────────────────────────────────────────
echo ✅ All services starting!
echo.
echo   🌐 Frontend:  http://localhost:3000
echo   ⚙️  Backend:   http://localhost:8000
echo   📖 API Docs:  http://localhost:8000/docs
echo ──────────────────────────────────────────
pause
