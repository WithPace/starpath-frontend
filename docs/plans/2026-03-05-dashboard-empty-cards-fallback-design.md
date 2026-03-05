# Dashboard Empty Cards Fallback Design

## Context

Live E2E repeatedly failed on parent dashboard when backend `dashboard` module returned no `cards` payload. Current behavior treated this as hard error (`看板加载失败`), which blocked the parent chain even though auth/session were valid.

## Goal

When dashboard response has no cards, keep page usable by rendering role-based fallback cards instead of surfacing a blocking error banner.

## Non-goals

- No backend schema or orchestrator payload changes.
- No change to OTP/SMS auth flow.

## Decision

1. Keep `extractDashboardCards(events)` as payload parser.
2. Add `applyDashboardCardFallback(cards, role)` in runtime layer:
- If payload has cards: return as-is.
- If payload is empty: return deterministic role fallback cards.
3. Update `RoleDashboardPage` to use fallback cards and avoid setting error for empty-card success responses.

## Risks & Mitigation

- Risk: fallback may hide backend regressions.
- Mitigation: keep runtime telemetry and existing gates; fallback only applies to empty-card success path, not request failures.

## Verification Plan

- Unit: `src/lib/runtime/dashboard-cards.test.ts` (new fallback tests).
- Regression: `src/components/cards/role-dashboard-page.test.tsx`.
- E2E regression: dashboard-related specs.
- Full gate: `bash scripts/ci/frontend_final_gate.sh`.
