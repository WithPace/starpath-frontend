#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
fi

backend_env_file="${BACKEND_ENV_FILE:-../07-SPath/.env}"
if [ -f "$backend_env_file" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$backend_env_file"
  set +a
fi

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] && [ -n "${SUPABASE_URL:-}" ]; then
  export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
fi
if [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ] || [ "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" = "replace-with-anon-key" ] || [ "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" = "++" ]; then
  if [ -n "${SUPABASE_ANON_KEY:-}" ]; then
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
  fi
fi

if [ -z "${E2E_LIVE_PHONE:-}" ]; then
  echo "missing E2E_LIVE_PHONE in .env.local"
  exit 1
fi

if [ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ] || [ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]; then
  echo "missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
  exit 1
fi

echo "sending otp to ${E2E_LIVE_PHONE} ..."
otp_resp="$(mktemp)"
http_code="$(curl -sS -o "$otp_resp" -w "%{http_code}" \
  "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"${E2E_LIVE_PHONE}\",\"create_user\":true}")"

if [ "$http_code" != "200" ]; then
  echo "failed to request otp: http=$http_code body=$(cat "$otp_resp")"
  rm -f "$otp_resp"
  exit 1
fi
rm -f "$otp_resp"

read -r -p "input latest 6-digit otp: " live_otp
if [[ ! "$live_otp" =~ ^[0-9]{6}$ ]]; then
  echo "invalid otp format, expect 6 digits"
  exit 1
fi

echo "verifying otp via supabase auth api ..."
verify_resp="$(mktemp)"
verify_code="$(curl -sS -o "$verify_resp" -w "%{http_code}" \
  "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"${E2E_LIVE_PHONE}\",\"token\":\"${live_otp}\",\"type\":\"sms\"}")"

if [ "$verify_code" != "200" ]; then
  echo "otp verify failed: http=$verify_code body=$(cat "$verify_resp")"
  rm -f "$verify_resp"
  exit 1
fi

live_access_token="$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write((p.access_token || "").trim());' "$verify_resp")"
rm -f "$verify_resp"

if [ -z "$live_access_token" ]; then
  echo "otp verify response missing access_token"
  exit 1
fi

RUN_E2E_LIVE=1 \
E2E_LIVE_TRIGGER_OTP_SEND=0 \
E2E_LIVE_OTP="$live_otp" \
E2E_LIVE_ACCESS_TOKEN="$live_access_token" \
bash scripts/ci/frontend_live_e2e.sh
