#!/usr/bin/env bash
set -euo pipefail

RUN_E2E="${RUN_E2E:-1}"

pnpm lint
pnpm typecheck
pnpm test
pnpm build

if [ "$RUN_E2E" = "1" ]; then
  pnpm playwright test
fi

echo "frontend final gate pass"
