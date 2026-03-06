# Dashboard Live Resilience Design

## Context

Live E2E repeatedly failed on `/dashboard` with no cards rendered in time. Existing frontend behavior used a 60s orchestrator timeout and only showed cards after request completion. The live assertion waited 20s, so slow upstream responses kept UI in loading state and caused deterministic test failure.

## Goal

Keep dashboard usable under transient upstream latency/errors without bypassing SMS auth flow:
- avoid long blocking loading on dashboard module fetch
- always render deterministic role fallback cards when request fails
- keep permission-denied behavior unchanged

## Options

1. Only relax Playwright assertion timeout.
- Pros: no app change.
- Cons: hides production UX issue; longer test runtime.

2. Retry dashboard request in test script only.
- Pros: localized to CI.
- Cons: user-facing dashboard still blocks in real sessions.

3. Add frontend degradation policy (recommended).
- Pros: improves actual UX and test stability; aligns safety-first fallback behavior.
- Cons: requires clear telemetry so failures are not silent.

## Decision

Use option 3 in `RoleDashboardPage`:
- reduce dashboard request timeout to `12_000ms`
- on non-permission request errors: record telemetry, clear blocking error state, and render role fallback cards
- on permission denied: keep redirect + error path as-is

## Verification

- RED/GREEN unit regression in `src/components/cards/role-dashboard-page.test.tsx`
- full gate: `bash scripts/ci/frontend_final_gate.sh`
