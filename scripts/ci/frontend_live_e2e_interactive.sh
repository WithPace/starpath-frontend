#!/usr/bin/env bash
set -euo pipefail

preserve_keys=(
  RUN_E2E_LIVE
  E2E_LIVE_USE_TOKEN_MODE
  E2E_LIVE_PHONE
  E2E_LIVE_OTP
  E2E_LIVE_ACCESS_TOKEN
  E2E_LIVE_PARENT_CHILD_ID
  E2E_LIVE_CHAT_MESSAGE
  E2E_LIVE_PARENT_NICKNAME
  E2E_LIVE_TRIGGER_OTP_SEND
  NEXT_PUBLIC_API_BASE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  BACKEND_ENV_FILE
  SUPABASE_URL
  SUPABASE_ANON_KEY
)
preserve_set=()
preserve_values=()
for key in "${preserve_keys[@]}"; do
  if [ "${!key+x}" = "x" ]; then
    preserve_set+=("1")
    preserve_values+=("${!key}")
  else
    preserve_set+=("0")
    preserve_values+=("")
  fi
done

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

idx=0
for key in "${preserve_keys[@]}"; do
  if [ "${preserve_set[$idx]}" = "1" ]; then
    export "$key=${preserve_values[$idx]}"
  fi
  idx=$((idx + 1))
done

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

request_otp_once() {
  local out_file="$1"
  curl -sS -o "$out_file" -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/otp" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"${E2E_LIVE_PHONE}\",\"create_user\":true}"
}

request_otp_with_retry() {
  local max_attempts=6
  local attempt=1
  local otp_resp http_code body error_code wait_seconds

  while [ "$attempt" -le "$max_attempts" ]; do
    otp_resp="$(mktemp)"
    http_code="$(request_otp_once "$otp_resp")"
    body="$(cat "$otp_resp")"

    if [ "$http_code" = "200" ]; then
      rm -f "$otp_resp"
      echo "otp request accepted (attempt ${attempt}/${max_attempts})"
      return 0
    fi

    error_code="$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write((p.error_code || "").trim());' "$otp_resp" 2>/dev/null || true)"
    rm -f "$otp_resp"

    if [ "$error_code" = "hook_timeout" ]; then
      echo "otp request timeout at provider hook (attempt ${attempt}/${max_attempts}), retrying in 3s ..."
      sleep 3
      attempt=$((attempt + 1))
      continue
    fi

    if [ "$error_code" = "over_sms_send_rate_limit" ]; then
      wait_seconds="$(echo "$body" | sed -n 's/.*request this after \([0-9][0-9]*\) seconds.*/\1/p')"
      if [ -z "$wait_seconds" ]; then
        wait_seconds=3
      fi
      wait_seconds=$((wait_seconds + 1))
      echo "otp request rate-limited (attempt ${attempt}/${max_attempts}), retrying in ${wait_seconds}s ..."
      sleep "$wait_seconds"
      attempt=$((attempt + 1))
      continue
    fi

    echo "failed to request otp: http=$http_code body=$body"
    return 1
  done

  echo "failed to request otp after ${max_attempts} attempts due to provider instability/rate limit"
  return 1
}

if [ -n "${E2E_LIVE_OTP:-}" ]; then
  live_otp="$E2E_LIVE_OTP"
  echo "using otp from E2E_LIVE_OTP env"
else
  echo "sending otp to ${E2E_LIVE_PHONE} ..."
  if ! request_otp_with_retry; then
    exit 1
  fi

  read -r -p "input latest 6-digit otp: " live_otp
  if [[ ! "$live_otp" =~ ^[0-9]{6}$ ]]; then
    echo "invalid otp format, expect 6 digits"
    exit 1
  fi
fi

if [ "${E2E_LIVE_USE_TOKEN_MODE:-0}" = "1" ]; then
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
  E2E_LIVE_USE_TOKEN_MODE=1 \
  E2E_LIVE_TRIGGER_OTP_SEND=0 \
  E2E_LIVE_OTP="$live_otp" \
  E2E_LIVE_ACCESS_TOKEN="$live_access_token" \
  bash scripts/ci/frontend_live_e2e.sh
else
  RUN_E2E_LIVE=1 \
  E2E_LIVE_TRIGGER_OTP_SEND=0 \
  E2E_LIVE_OTP="$live_otp" \
  E2E_LIVE_ACCESS_TOKEN= \
  bash scripts/ci/frontend_live_e2e.sh
fi
