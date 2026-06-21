#!/usr/bin/env bash
# ──────────────────────────────────────────────
# AI Video Note Extractor — Start Script
# Launches backend + frontend in parallel
# ──────────────────────────────────────────────

set -e

BACKEND_PORT=8000
FRONTEND_PORT=3000
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🎬 AI Video Note Extractor"
echo "──────────────────────────"

# Check prerequisites
command -v python3 >/dev/null 2>&1 || { echo "❌ python3 not found"; exit 1; }
command -v node >/dev/null 2>&1    || { echo "❌ node not found"; exit 1; }
command -v ffmpeg >/dev/null 2>&1  || echo "⚠️  ffmpeg not found — audio extraction may fail"
command -v yt-dlp >/dev/null 2>&1  || echo "⚠️  yt-dlp not found — YouTube download may fail"

# ── Backend ────────────────────────────────────
echo ""
echo "🐍 Starting backend on port $BACKEND_PORT..."

cd "$ROOT_DIR/backend"

# Create venv if needed
if [ ! -d "venv" ]; then
  echo "  Creating Python venv..."
  python3 -m venv venv
  source venv/bin/activate
  pip install -q -r requirements.txt
  echo "  ✅ Dependencies installed"
else
  source venv/bin/activate
fi

# Copy env if not present
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "  📋 Created .env from .env.example — add your API keys!"
fi

uvicorn main:app --reload --host 0.0.0.0 --port $BACKEND_PORT &
BACKEND_PID=$!
echo "  ✅ Backend PID: $BACKEND_PID"

# ── Frontend ───────────────────────────────────
echo ""
echo "⚛️  Starting frontend on port $FRONTEND_PORT..."

cd "$ROOT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "  Installing npm packages..."
  npm install --silent
  echo "  ✅ Packages installed"
fi

if [ ! -f ".env.local" ]; then
  echo "NEXT_PUBLIC_API_URL=http://localhost:$BACKEND_PORT" > .env.local
  echo "  📋 Created .env.local"
fi

npm run dev -- --port $FRONTEND_PORT &
FRONTEND_PID=$!
echo "  ✅ Frontend PID: $FRONTEND_PID"

# ── Summary ────────────────────────────────────
echo ""
echo "──────────────────────────────────────────"
echo "✅ All services running!"
echo ""
echo "  🌐 Frontend:  http://localhost:$FRONTEND_PORT"
echo "  ⚙️  Backend:   http://localhost:$BACKEND_PORT"
echo "  📖 API Docs:  http://localhost:$BACKEND_PORT/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "──────────────────────────────────────────"

# Cleanup on exit
cleanup() {
  echo ""
  echo "🛑 Stopping services..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
  echo "Bye!"
}
trap cleanup INT TERM

wait
