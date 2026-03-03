#!/usr/bin/env bash
set -euo pipefail

if [ -f ".env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  source ".env.local"
  set +a
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
