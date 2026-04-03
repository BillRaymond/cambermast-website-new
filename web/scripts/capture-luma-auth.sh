#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

DESKTOP_ROOT="${DESKTOP_ROOT:-/tmp/cambermast-remote-desktop}"
DISPLAY_NUM="${DISPLAY_NUM:-:99}"
AUTH_PATH="${LUMA_STORAGE_STATE_PATH:-./.auth/luma.json}"

bash ./scripts/start-remote-desktop.sh >/dev/null

export DISPLAY="$DISPLAY_NUM"

node ./scripts/capture-luma-auth.mjs "$AUTH_PATH"
