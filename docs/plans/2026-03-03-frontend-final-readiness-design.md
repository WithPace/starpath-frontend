# Frontend Final Readiness Design

## Context

- Parent prototype routes are implemented and mostly live-enabled.
- Core role routes (`/chat`, `/dashboard`, `/journey`) already support runtime auth and child context.
- Current remaining risk before "can go live" is proof, not raw page count:
  - live E2E currently validates only parent auth + chat/dashboard chain
  - newly live pages (`/settings`, `/home-guide`, `/card-fullscreen`) lack real-environment smoke proof
  - operator handoff for deploy/smoke/rollback is spread across docs and easy to miss

## Goal

- Promote frontend from "feature complete" to "release ready" with measurable evidence:
  - extend live E2E coverage to critical newly-live parent pages
  - add explicit go-live runbook + page completeness audit checklist
  - keep architecture stable and avoid risky rewrites

## Non-goals

- No backend schema/RLS changes in this pass.
- No visual redesign of existing pages.
- No new business modules beyond already defined Phase 2/3/4/5 scope.

## Approaches

### A. Docs-only hardening

- Pros: fastest.
- Cons: no executable evidence for critical live pages; risk remains high.

### B. Live E2E + release docs hardening (Chosen)

- Pros: balances speed and confidence; directly closes "can上线" evidence gap.
- Cons: requires stable live test account and env discipline.

### C. Full frontend architecture refactor

- Pros: long-term structural gains.
- Cons: large regression surface and timeline risk; not aligned with immediate release gate.

## Chosen Architecture

1. Extend `tests/e2e/live-parent-full-chain.spec.ts` to verify:
   - authenticated settings nickname write path
   - home-guide dynamic rendering without degraded/fail markers
   - card-fullscreen tab data rendering without degraded/fail markers
2. Keep live test optional under `RUN_E2E_LIVE=1`, preserving CI portability.
3. Add a dedicated final-readiness/go-live document:
   - exact env keys
   - exact command order
   - route-by-route smoke criteria
   - rollback entrypoint
4. Add a frontend completeness audit checklist document for explicit sign-off.

## Verification Strategy

- TDD:
  - RED: extend/adjust e2e config + live spec assertions first
  - GREEN: implement minimal changes to satisfy those assertions
- Full evidence:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm test:e2e`
