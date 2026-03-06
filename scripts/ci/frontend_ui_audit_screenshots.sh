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
STRICT_PROTOTYPE="${UI_AUDIT_STRICT_PROTOTYPE:-1}"
ALLOW_PROTOTYPE_FALLBACK="${UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK:-0}"

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

missing_sources=()
for entry in "${pages[@]}"; do
  name="${entry%%|*}"
  source_png_path="$PROTOTYPE_SOURCE_DIR/$name.png"
  source_html_path="$PROTOTYPE_SOURCE_DIR/$name.html"
  if [ ! -f "$source_png_path" ] && [ ! -f "$source_html_path" ]; then
    missing_sources+=("$name")
  fi
done

if [ "${#missing_sources[@]}" -gt 0 ] && [ "$STRICT_PROTOTYPE" = "1" ] && [ "$ALLOW_PROTOTYPE_FALLBACK" != "1" ]; then
  echo "missing prototype source mapping: ${missing_sources[*]}"
  echo "set UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK=1 only for emergency bypass"
  exit 1
fi

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

html_source_names=()
for entry in "${pages[@]}"; do
  name="${entry%%|*}"
  current_path="$CURRENT_DIR/$name.png"
  source_png_path="$PROTOTYPE_SOURCE_DIR/$name.png"
  source_html_path="$PROTOTYPE_SOURCE_DIR/$name.html"
  target_path="$PROTOTYPE_DIR/$name.png"

  if [ -f "$source_png_path" ]; then
    cp "$source_png_path" "$target_path"
  elif [ -f "$source_html_path" ]; then
    html_source_names+=("$name")
  elif [ "$ALLOW_PROTOTYPE_FALLBACK" = "1" ] || [ "$STRICT_PROTOTYPE" != "1" ]; then
    cp "$current_path" "$target_path"
  else
    echo "missing prototype source mapping at render stage: $name"
    exit 1
  fi
done

if [ "${#html_source_names[@]}" -gt 0 ]; then
  joined_names=""
  for name in "${html_source_names[@]}"; do
    if [ -n "$joined_names" ]; then
      joined_names="${joined_names},"
    fi
    joined_names="${joined_names}${name}"
  done

  node - "$PROTOTYPE_SOURCE_DIR" "$PROTOTYPE_DIR" "$joined_names" <<'NODE'
const { chromium } = require("playwright");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const sourceDir = process.argv[2];
const targetDir = process.argv[3];
const names = process.argv[4] ? process.argv[4].split(",").filter(Boolean) : [];

async function run() {
  if (names.length === 0) return;

  fs.mkdirSync(targetDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  for (const name of names) {
    const htmlPath = path.join(sourceDir, `${name}.html`);
    const targetPath = path.join(targetDir, `${name}.png`);
    const fileUrl = pathToFileURL(htmlPath).href;

    await page.goto(fileUrl, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(200);
    await page.screenshot({ path: targetPath, fullPage: true });
  }

  await browser.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
NODE
fi

echo "frontend ui audit screenshots generated: $OUTPUT_DIR"
