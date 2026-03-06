#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT_PATH="$ROOT_DIR/scripts/ci/frontend_ui_audit_screenshots.sh"

if [ ! -x "$SCRIPT_PATH" ]; then
  echo "missing executable script: $SCRIPT_PATH"
  exit 1
fi

OUT_DIR="$(mktemp -d)"
PROTOTYPE_DIR="$(mktemp -d)"
trap 'rm -rf "$OUT_DIR" "$PROTOTYPE_DIR"' EXIT

pages=(
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
)

for page in "${pages[@]}"; do
  cat > "$PROTOTYPE_DIR/${page}.html" <<HTML
<!doctype html>
<html lang="zh-CN"><body><main>${page}</main></body></html>
HTML
done

set +e
UI_AUDIT_MOCK=1 \
UI_AUDIT_STRICT_PROTOTYPE=1 \
UI_AUDIT_PROTOTYPE_SOURCE_DIR="$PROTOTYPE_DIR" \
UI_AUDIT_OUTPUT_DIR="$OUT_DIR" \
bash "$SCRIPT_PATH" >"$OUT_DIR/run.log" 2>&1
status=$?
set -e

if [ "$status" -eq 0 ]; then
  echo "expected strict prototype mapping check to fail when one page source is missing"
  cat "$OUT_DIR/run.log"
  exit 1
fi

if ! grep -q "missing prototype source mapping" "$OUT_DIR/run.log"; then
  echo "expected missing prototype source mapping error message"
  cat "$OUT_DIR/run.log"
  exit 1
fi

echo "frontend ui audit strict mapping gate present"
