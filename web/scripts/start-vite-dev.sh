#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
DEV_LOG="/tmp/cambermast-dev.log"
DEV_CMD='VITE_DEV_CMD="npm run dev:host" bash ./scripts/run-dev-with-training-pdf-watch.sh'
DEV_HEALTHCHECK_URL="http://127.0.0.1:5173/"
LOCKFILE_PATH="package-lock.json"
INSTALLED_LOCKFILE_PATH="node_modules/.package-lock.json"

print_success_message() {
  cat <<EOF
Cambermast dev server is running at http://localhost:5173/
Training and resource PDF watchers are running alongside Vite.
Logs: $DEV_LOG
Note: the VS Code post-start terminal will close after this command finishes.
EOF
}

node_modules_need_refresh() {
  if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    return 0
  fi

  if [ ! -f "$LOCKFILE_PATH" ] || [ ! -f "$INSTALLED_LOCKFILE_PATH" ]; then
    return 0
  fi

  if [ "$LOCKFILE_PATH" -nt "$INSTALLED_LOCKFILE_PATH" ]; then
    return 0
  fi

  if ! npm ls --depth=0 >/dev/null 2>&1; then
    return 0
  fi

  return 1
}

refresh_node_modules_if_needed() {
  if [ ! -f "$LOCKFILE_PATH" ]; then
    echo "Missing $LOCKFILE_PATH; cannot restore dependencies with npm ci."
    exit 1
  fi

  if node_modules_need_refresh; then
    echo "Refreshing node_modules with npm ci to match $LOCKFILE_PATH."
    npm ci
  fi
}

refresh_node_modules_if_needed

# Keep published metadata files in sync before running dev
npm run predev

is_dev_server_healthy() {
  command -v curl >/dev/null 2>&1 && curl -fsS --max-time 1 "$DEV_HEALTHCHECK_URL" >/dev/null 2>&1
}

if pgrep -f "[v]ite dev --host 0.0.0.0 --port 5173" >/dev/null; then
  if is_dev_server_healthy; then
    print_success_message
    exit 0
  fi

  echo "Found stale Vite dev process entries; restarting host dev server."
  pkill -f "[v]ite dev --host 0.0.0.0 --port 5173" >/dev/null 2>&1 || true
  sleep 1
fi

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
      if is_dev_server_healthy; then
        print_success_message
        exit 0
      fi
    fi
    sleep 0.5
  done

  echo "Dev startup failed. Last log lines:"
  tail -n 40 "$DEV_LOG" || true
  exit 1
fi
