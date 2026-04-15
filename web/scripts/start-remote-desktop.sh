#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

DESKTOP_ROOT="${DESKTOP_ROOT:-/tmp/cambermast-remote-desktop}"
DISPLAY_NUM="${DISPLAY_NUM:-:99}"
DISPLAY_PORT="${DISPLAY_PORT:-5900}"
NOVNC_PORT="${NOVNC_PORT:-6080}"
NOVNC_PATH="${NOVNC_PATH:-/usr/share/novnc}"
XVFB_PID_FILE="$DESKTOP_ROOT/xvfb.pid"
OPENBOX_PID_FILE="$DESKTOP_ROOT/openbox.pid"
X11VNC_PID_FILE="$DESKTOP_ROOT/x11vnc.pid"
WEBSOCKIFY_PID_FILE="$DESKTOP_ROOT/websockify.pid"

mkdir -p "$DESKTOP_ROOT"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    echo "Rebuild the devcontainer after the Dockerfile changes so the desktop packages are installed."
    exit 1
  fi
}

require_path() {
  if [ ! -e "$1" ]; then
    echo "Missing required path: $1"
    echo "Rebuild the devcontainer after the Dockerfile changes so the desktop packages are installed."
    exit 1
  fi
}

require_cmd Xvfb
require_cmd openbox
require_cmd x11vnc
require_cmd websockify
require_path "$NOVNC_PATH/vnc.html"

is_pid_running() {
  local pid_file="$1"
  [ -f "$pid_file" ] || return 1
  local pid
  pid="$(cat "$pid_file" 2>/dev/null || true)"
  [ -n "$pid" ] || return 1
  kill -0 "$pid" >/dev/null 2>&1
}

clear_stale_pid_file() {
  local pid_file="$1"
  if ! is_pid_running "$pid_file"; then
    rm -f "$pid_file"
  fi
}

start_detached() {
  local pid_file="$1"
  local log_file="$2"
  shift 2

  clear_stale_pid_file "$pid_file"
  if is_pid_running "$pid_file"; then
    return 0
  fi

  nohup "$@" >"$log_file" 2>&1 </dev/null &
  echo "$!" >"$pid_file"
  sleep 1
}

start_detached "$XVFB_PID_FILE" "$DESKTOP_ROOT/xvfb.log" \
  Xvfb "$DISPLAY_NUM" -screen 0 1440x960x24 -nolisten tcp

export DISPLAY="$DISPLAY_NUM"

start_detached "$OPENBOX_PID_FILE" "$DESKTOP_ROOT/openbox.log" \
  openbox

start_detached "$X11VNC_PID_FILE" "$DESKTOP_ROOT/x11vnc.log" \
  x11vnc \
  -display "$DISPLAY_NUM" \
  -forever \
  -shared \
  -nopw \
  -rfbport "$DISPLAY_PORT"

start_detached "$WEBSOCKIFY_PID_FILE" "$DESKTOP_ROOT/websockify.log" \
  websockify \
  --web "$NOVNC_PATH" \
  "$NOVNC_PORT" \
  "127.0.0.1:$DISPLAY_PORT"

cat <<EOF
Remote desktop is running.

Open this in your browser:
  http://localhost:${NOVNC_PORT}/vnc.html

Display:
  ${DISPLAY_NUM}

Logs:
  $DESKTOP_ROOT/xvfb.log
  $DESKTOP_ROOT/openbox.log
  $DESKTOP_ROOT/x11vnc.log
  $DESKTOP_ROOT/websockify.log
EOF
