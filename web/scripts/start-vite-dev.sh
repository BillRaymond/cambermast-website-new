#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -d node_modules ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
fi

# Keep published metadata files in sync before running dev
npm run predev

if ! pgrep -f "vite dev" >/dev/null; then
  exec npm run dev:host
else
  echo "Vite dev already running."
fi
