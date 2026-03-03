#!/usr/bin/env bash
set -euo pipefail

RUN_E2E="${RUN_E2E:-1}"
RUN_E2E_LIVE="${RUN_E2E_LIVE:-0}"

pnpm lint
pnpm typecheck
pnpm test
pnpm build

if [ "$RUN_E2E" = "1" ]; then
  pnpm playwright test --grep-invert @live
fi

if [ "$RUN_E2E_LIVE" = "1" ]; then
  bash scripts/ci/frontend_live_e2e.sh
fi

echo "frontend final gate pass"
