#!/usr/bin/env bash
set -euo pipefail

# Avoid Node warning noise when Playwright later injects FORCE_COLOR.
if [ "${NO_COLOR+x}" = "x" ]; then
  unset NO_COLOR
fi

is_invalid_anon_key() {
  local key="${1:-}"
  if [ -z "$key" ] || [ "$key" = "replace-with-anon-key" ] || [ "$key" = "++" ]; then
    return 0
  fi
  if [[ ! "$key" =~ ^[^.]+\.[^.]+\.[^.]+$ ]]; then
    return 0
  fi
  return 1
}

exchange_otp_for_access_token() {
  local phone="$1"
  local otp="$2"
  local verify_resp
  verify_resp="$(mktemp)"

  local verify_code
  verify_code="$(curl -sS -o "$verify_resp" -w "%{http_code}" \
    "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify" \
    -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"phone\":\"${phone}\",\"token\":\"${otp}\",\"type\":\"sms\"}")"

  if [ "$verify_code" != "200" ]; then
    local body
    body="$(cat "$verify_resp")"
    rm -f "$verify_resp"
    echo "otp verify failed: http=$verify_code body=$body" >&2
    return 1
  fi

  local token
  token="$(node -e 'const fs=require("fs"); const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write((p.access_token || "").trim());' "$verify_resp")"
  rm -f "$verify_resp"

  if [ -z "$token" ]; then
    echo "otp verify response missing access_token" >&2
    return 1
  fi

  printf "%s" "$token"
}

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
if [ -z "${NEXT_PUBLIC_API_BASE_URL:-}" ] && [ -n "${SUPABASE_URL:-}" ]; then
  export NEXT_PUBLIC_API_BASE_URL="${SUPABASE_URL%/}/functions/v1/orchestrator"
fi
if is_invalid_anon_key "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}"; then
  if [ -n "${SUPABASE_ANON_KEY:-}" ]; then
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
  fi
fi

frontend_required_keys=(
  NEXT_PUBLIC_API_BASE_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
)

frontend_missing=()
for key in "${frontend_required_keys[@]}"; do
  value="${!key:-}"
  if [ -z "${value}" ]; then
    frontend_missing+=("${key}")
  fi
done

if [ "${#frontend_missing[@]}" -gt 0 ]; then
  echo "missing frontend env keys: ${frontend_missing[*]}"
  echo "set keys in .env.local or provide BACKEND_ENV_FILE (default: ../07-SPath/.env)"
  exit 1
fi

if is_invalid_anon_key "${NEXT_PUBLIC_SUPABASE_ANON_KEY}"; then
  echo "invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: empty/placeholder/malformed"
  echo "set real anon key in .env.local or BACKEND_ENV_FILE"
  exit 1
fi

if [ "${RUN_E2E_LIVE:-0}" != "1" ]; then
  echo "skip live e2e (set RUN_E2E_LIVE=1 to enable)"
  exit 0
fi

missing=()
if [ -z "${E2E_LIVE_PARENT_CHILD_ID:-}" ]; then
  missing+=("E2E_LIVE_PARENT_CHILD_ID")
fi
if [ -z "${E2E_LIVE_ACCESS_TOKEN:-}" ]; then
  if [ -z "${E2E_LIVE_PHONE:-}" ]; then
    missing+=("E2E_LIVE_PHONE")
  fi
  if [ -z "${E2E_LIVE_OTP:-}" ]; then
    missing+=("E2E_LIVE_OTP")
  fi
fi

if [ "${#missing[@]}" -gt 0 ]; then
  echo "missing live e2e env keys: ${missing[*]}"
  echo "set E2E_LIVE_PARENT_CHILD_ID and one auth mode:"
  echo "  - otp mode: E2E_LIVE_PHONE + E2E_LIVE_OTP"
  echo "  - token mode: E2E_LIVE_ACCESS_TOKEN"
  exit 1
fi

if [ "${E2E_LIVE_USE_TOKEN_MODE:-0}" = "1" ] && [ -z "${E2E_LIVE_ACCESS_TOKEN:-}" ] && [ -n "${E2E_LIVE_PHONE:-}" ] && [ -n "${E2E_LIVE_OTP:-}" ]; then
  echo "verifying otp and switching to access-token mode for live e2e..."
  if live_access_token="$(exchange_otp_for_access_token "${E2E_LIVE_PHONE}" "${E2E_LIVE_OTP}")"; then
    export E2E_LIVE_ACCESS_TOKEN="$live_access_token"
    export E2E_LIVE_TRIGGER_OTP_SEND=0
  else
    echo "live e2e bootstrap failed: unable to exchange otp for access token"
    exit 1
  fi
fi

pnpm playwright test --grep @live tests/e2e/live-parent-full-chain.spec.ts
echo "frontend live e2e pass"
