#!/usr/bin/env bash
set -euo pipefail

RUN_E2E="${RUN_E2E:-1}"
RUN_E2E_LIVE="${RUN_E2E_LIVE:-0}"

# Remove stale Next artifacts to keep type validation deterministic across branches/worktrees.
rm -rf .next

pnpm lint
pnpm typecheck
pnpm test
bash tests/governance/test_frontend_ui_audit_artifacts.sh
pnpm build

if [ "$RUN_E2E" = "1" ]; then
  pnpm playwright test --grep @exception
  pnpm playwright test --grep-invert "@live|@exception"
fi

if [ "$RUN_E2E_LIVE" = "1" ]; then
  bash scripts/ci/frontend_live_e2e.sh
fi

echo "frontend final gate pass"
