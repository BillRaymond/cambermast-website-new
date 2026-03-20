#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

npm run watch:training-pdfs &
WATCH_PID=$!

cleanup() {
  if kill -0 "$WATCH_PID" >/dev/null 2>&1; then
    kill "$WATCH_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

exec npm run dev:vite
