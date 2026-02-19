#!/usr/bin/env bash
set -euo pipefail

CODEX_DIR="/root/.codex"

if [[ "${1:-}" != "--yes" ]]; then
  read -r -p "This will permanently remove ${CODEX_DIR}. Continue? [y/N] " reply
  if [[ ! "$reply" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
  fi
fi

if [[ -d "$CODEX_DIR" ]]; then
  rm -rf "$CODEX_DIR"
  echo "Removed ${CODEX_DIR}."
else
  echo "Nothing to remove: ${CODEX_DIR} does not exist."
fi

echo "You can now try logging into Codex again."
