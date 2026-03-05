# Dashboard Empty Cards Fallback Implementation

## Scope

- Runtime fallback logic for empty dashboard cards payload.
- Parent/role dashboard page integration.
- Test coverage for fallback behavior.

## Changes

1. `src/lib/runtime/dashboard-cards.ts`
- Added role-based `FALLBACK_DASHBOARD_CARDS`.
- Added `applyDashboardCardFallback(cards, role)`.

2. `src/components/cards/role-dashboard-page.tsx`
- Switched from direct `extractDashboardCards` assignment to:
  - parse payload cards
  - apply role fallback when empty
- Removed empty-cards hard error branch.

3. `src/lib/runtime/dashboard-cards.test.ts`
- Added RED/GREEN coverage:
  - returns fallback cards for empty payload
  - keeps backend cards when present

## Verification Evidence

- `pnpm exec vitest run src/lib/runtime/dashboard-cards.test.ts src/components/cards/role-dashboard-page.test.tsx`
- `pnpm typecheck`
- `pnpm playwright test tests/e2e/parent-dashboard-followup.spec.ts tests/e2e/role-dashboard-business-panels.spec.ts`
- `bash scripts/ci/frontend_final_gate.sh`

All commands passed on branch `feature/dashboard-empty-cards-fallback-wave1`.
