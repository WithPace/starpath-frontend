# Parent Assessment + Voice Live Enrichment Design

## Context

- Parent prototype routes are delivered, and major data pages are already partially live.
- Two pages still have "demo-first" behavior and are not yet full business chain:
  - `/assessment`
  - `/voice-record`
- Supabase schema/RLS already supports core operations:
  - `assessments` (screening output)
  - `life_records` (parent life/behavior logging)

## Goal

- Upgrade both pages to production-like behavior:
  - assessment answers persist to `assessments`
  - voice/text training field notes persist to `life_records`
  - both pages show latest historical records for validation/traceability

## Non-goals

- No speech-to-text model integration in this pass.
- No backend migrations.
- No redesign of doctor/teacher/org-admin pages.

## Approaches

### A. Full custom backend workflow (Edge Function first)

- Pros: complex workflow flexibility.
- Cons: overkill for current MVP, slower delivery.

### B. Direct Supabase table write/read with typed access helpers (Chosen)

- Pros: fastest path to real business chain, aligned with existing parent runtime.
- Cons: limited orchestration sophistication for now.

### C. Keep demo pages, only improve wording

- Pros: lowest effort.
- Cons: still not "可上线业务链路" level.

## Chosen Architecture

1. Extend parent data access layer:
   - write assessment result rows to `assessments`
   - write voice note rows to `life_records`
2. Keep pure domain functions for deterministic logic:
   - score/risk derivation from answer set
3. Page integration:
   - consume runtime child context (`useRoleRuntime("parent")`)
   - support loading/error/empty states
   - render latest records list
4. Keep existing prototype shell/classes to avoid style regression.

## Data Flow

- Assessment page:
  - user answers each question
  - derive `total_score` + `risk_level`
  - insert record into `assessments` with `type="mchat_screening"`
  - refetch latest records and display
- Voice record page:
  - user enters transcript/note and optional emotion intensity
  - insert record into `life_records` with `type="behavior_event"`
  - refetch latest records and display

## Error Handling

- Missing Supabase client or selected child: display degraded mode notice.
- Insert failure: explicit error text and no fake success.
- Historical list failure: keep current page usable and surface warning.

## Verification

- TDD:
  - add failing tests for new data access helpers
  - add failing page tests for save success/error behavior
- then run:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm test:e2e`
