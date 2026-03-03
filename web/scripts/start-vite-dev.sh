#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
DEV_LOG="/tmp/cambermast-dev.log"
DEV_CMD="npm run dev:host"
DEV_MATCH="vite dev --host 0.0.0.0 --port 5173"

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
fi

# Keep published metadata files in sync before running dev
npm run predev

if ! pgrep -f "[v]ite dev --host 0.0.0.0 --port 5173" >/dev/null; then
  : >"$DEV_LOG"

  # Launch in a separate session so postStart terminal teardown does not kill Vite.
  if command -v setsid >/dev/null 2>&1; then
    setsid bash -lc "$DEV_CMD" < /dev/null >>"$DEV_LOG" 2>&1 &
  else
    nohup bash -lc "$DEV_CMD" < /dev/null >>"$DEV_LOG" 2>&1 &
  fi

  for _ in {1..20}; do
    if pgrep -f "[v]ite dev --host 0.0.0.0 --port 5173" >/dev/null; then
      if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 1 http://127.0.0.1:5173/ >/dev/null 2>&1; then
        echo "Started Vite dev server in background (logs: $DEV_LOG)."
        exit 0
      fi
    fi
    sleep 0.5
  done

  echo "Vite failed to start. Last log lines:"
  tail -n 40 "$DEV_LOG" || true
  exit 1
else
  echo "Vite dev already running."
fi
