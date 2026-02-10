#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  npm install
fi

if ! pgrep -f "vite dev" >/dev/null; then
  nohup npm run dev:host > /tmp/vite-dev.log 2>&1 &
fi
