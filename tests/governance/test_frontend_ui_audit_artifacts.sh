#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT_PATH="$ROOT_DIR/scripts/ci/frontend_ui_audit_screenshots.sh"

if [ ! -x "$SCRIPT_PATH" ]; then
  echo "missing executable script: $SCRIPT_PATH"
  exit 1
fi

OUT_DIR="$(mktemp -d)"
trap 'rm -rf "$OUT_DIR"' EXIT

UI_AUDIT_MOCK=1 UI_AUDIT_OUTPUT_DIR="$OUT_DIR" bash "$SCRIPT_PATH"

expected_pages=(
  00-welcome
  01-login
  02-chat
  03-quick-menu
  04-settings
  05-create-child
  06-card-fullscreen
  07-assessment
  08-home-guide
  09-voice-record
  10-training-weekly
  11-analysis-report
  12-training-detail
)

for page in "${expected_pages[@]}"; do
  if [ ! -f "$OUT_DIR/current/${page}.png" ]; then
    echo "missing current screenshot: $page"
    exit 1
  fi
  if [ ! -f "$OUT_DIR/prototype/${page}.png" ]; then
    echo "missing prototype screenshot: $page"
    exit 1
  fi
done

echo "frontend ui audit artifacts generated"
