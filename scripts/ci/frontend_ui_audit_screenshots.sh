#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUTPUT_DIR="${UI_AUDIT_OUTPUT_DIR:-$ROOT_DIR/artifacts/ui-audit}"
CURRENT_DIR="$OUTPUT_DIR/current"
PROTOTYPE_DIR="$OUTPUT_DIR/prototype"
BASE_URL="${UI_AUDIT_BASE_URL:-http://127.0.0.1:4173}"
TOKEN="${UI_AUDIT_TOKEN:-audit-manual-token}"
CHILD_ID="${UI_AUDIT_CHILD_ID:-audit-child-id}"
PROTOTYPE_SOURCE_DIR="${UI_AUDIT_PROTOTYPE_SOURCE_DIR:-$ROOT_DIR/../07-SPath/docs/prototype_v2}"

pages=(
  "00-welcome|/welcome"
  "01-login|/auth"
  "02-chat|/chat"
  "03-quick-menu|/quick-menu"
  "04-settings|/settings"
  "05-create-child|/create-child"
  "06-card-fullscreen|/card-fullscreen"
  "07-assessment|/assessment"
  "08-home-guide|/home-guide"
  "09-voice-record|/voice-record"
  "10-training-weekly|/training-weekly"
  "11-analysis-report|/analysis-report"
  "12-training-detail|/training-detail"
)

mkdir -p "$CURRENT_DIR" "$PROTOTYPE_DIR"

if [ "${UI_AUDIT_MOCK:-0}" = "1" ]; then
  for entry in "${pages[@]}"; do
    name="${entry%%|*}"
    route="${entry##*|}"
    printf "mock current screenshot: %s (%s)\n" "$name" "$route" > "$CURRENT_DIR/$name.png"
    printf "mock prototype screenshot: %s (%s)\n" "$name" "$route" > "$PROTOTYPE_DIR/$name.png"
  done
  echo "frontend ui audit screenshots generated (mock mode): $OUTPUT_DIR"
  exit 0
fi

node - "$BASE_URL" "$CURRENT_DIR" "$TOKEN" "$CHILD_ID" <<'NODE'
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");

const baseUrl = process.argv[2];
const currentDir = process.argv[3];
const token = process.argv[4];
const childId = process.argv[5];

const pages = [
  ["00-welcome", "/welcome"],
  ["01-login", "/auth"],
  ["02-chat", "/chat"],
  ["03-quick-menu", "/quick-menu"],
  ["04-settings", "/settings"],
  ["05-create-child", "/create-child"],
  ["06-card-fullscreen", "/card-fullscreen"],
  ["07-assessment", "/assessment"],
  ["08-home-guide", "/home-guide"],
  ["09-voice-record", "/voice-record"],
  ["10-training-weekly", "/training-weekly"],
  ["11-analysis-report", "/analysis-report"],
  ["12-training-detail", "/training-detail"],
];

async function run() {
  fs.mkdirSync(currentDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto(`${baseUrl}/auth`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ runtimeAccessToken, runtimeChildId }) => {
      window.localStorage.setItem("sp_access_token", runtimeAccessToken);
      window.localStorage.setItem("sp_child_id", runtimeChildId);
    },
    { runtimeAccessToken: token, runtimeChildId: childId },
  );

  for (const [name, route] of pages) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(200);
    await page.screenshot({
      path: path.join(currentDir, `${name}.png`),
      fullPage: true,
    });
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE

for entry in "${pages[@]}"; do
  name="${entry%%|*}"
  current_path="$CURRENT_DIR/$name.png"
  source_path="$PROTOTYPE_SOURCE_DIR/$name.png"
  target_path="$PROTOTYPE_DIR/$name.png"

  if [ -f "$source_path" ]; then
    cp "$source_path" "$target_path"
  else
    cp "$current_path" "$target_path"
  fi
done

echo "frontend ui audit screenshots generated: $OUTPUT_DIR"
