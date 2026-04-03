#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

VITE_DEV_CMD="${VITE_DEV_CMD:-npm run dev:host}"
EXPECTED_DEV_PATTERN="${EXPECTED_DEV_PATTERN:-[v]ite dev --host 0.0.0.0 --port 5173}"

is_expected_dev_running() {
  pgrep -f "$EXPECTED_DEV_PATTERN" >/dev/null 2>&1
}

if is_expected_dev_running; then
  echo "Cambermast dev server is already running on http://localhost:5173/."
  echo "Stop the existing dev process before starting another foreground session."
  exit 1
fi

npm run watch:training-pdfs &
WATCH_PID=$!

cleanup() {
  if kill -0 "$WATCH_PID" >/dev/null 2>&1; then
    kill "$WATCH_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT INT TERM

exec bash -lc "$VITE_DEV_CMD"
