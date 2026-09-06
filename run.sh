#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
    echo "Stopping Smart-Recipe..."

    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $FRONTEND_ADMIN_PID 2>/dev/null || true

    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    wait $FRONTEND_ADMIN_PID 2>/dev/null || true
}

trap cleanup SIGINT SIGTERM EXIT

echo "Starting backend..."
cd "$ROOT_DIR"
uvicorn backend.app:app --reload --port 3651 &
BACKEND_PID=$!

echo "Starting frontend..."
cd "$ROOT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "Starting frontend admin ..."
cd "$ROOT_DIR/frontend_admin"
npm run dev &
FRONTEND_ADMIN_PID=$!

echo ""
echo "================================="
echo " Smart-Recipe is running"
echo " Backend:  http://localhost:3651"
echo " Frontend: http://localhost:5173"
echo " Frontend Admin: http://localhost:5174"
echo "================================="
echo ""
echo "Press Ctrl+C to stop everything."

wait