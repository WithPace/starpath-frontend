#!/usr/bin/env bash
set -euo pipefail

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

preserve_keys=(
  RUN_E2E_LIVE
  E2E_LIVE_PHONE
  E2E_LIVE_OTP
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

required_keys=(
  E2E_LIVE_PHONE
  E2E_LIVE_OTP
  E2E_LIVE_PARENT_CHILD_ID
)

missing=()
for key in "${required_keys[@]}"; do
  value="${!key:-}"
  if [ -z "${value}" ]; then
    missing+=("${key}")
  fi
done

if [ "${#missing[@]}" -gt 0 ]; then
  echo "missing live e2e env keys: ${missing[*]}"
  echo "set required keys in shell or .env.local before running live gate"
  exit 1
fi

pnpm playwright test --grep @live tests/e2e/live-parent-full-chain.spec.ts
echo "frontend live e2e pass"
