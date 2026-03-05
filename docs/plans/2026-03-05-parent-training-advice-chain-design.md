# Parent Training Advice Chain Design

## Context

- Date: 2026-03-05
- Scope: Parent main business chain completion (assessment -> training-advice -> home-guide)
- Constraint: Keep current architecture (Next.js App Router + Supabase adapters + runtime guard matrix), avoid high-risk rewrites.

## Objective

1. Add missing parent core page: `/training-advice`.
2. Close chain continuity from completed assessment to training execution guidance.
3. Keep behavior robust in both full-runtime and degraded-runtime modes.
4. Add automated evidence (unit tests + non-live E2E) for this chain.

## Architecture

### Route and page

- Create `src/app/training-advice/page.tsx`.
- Use existing shell/runtime stack:
  - `ParentShell`
  - `useRoleRuntime("parent")`
  - `tryCreateBrowserSupabaseClient()`
- Read available data with existing adapters:
  - `listRecentTrainingSessions`
  - `listRecentAssessments`
  - `listLatestChildProfile`

### Advice generation model (frontend deterministic AI proxy)

- Build 3 advice cards from:
  - risk level (`assessments`)
  - weak domains (`children_profiles.domain_levels`)
  - recent training trend (`training_sessions`)
- Preserve fallback cards when runtime is missing/incomplete.
- Add user action:
  - `AI 生成训练建议` (reorder/regenerate card priorities locally, with visible state feedback)

### Business chain links

- `assessment` completed state:
  - add CTA button/link: `进入训练建议` -> `/training-advice`
- `training-advice` actions:
  - `进入居家指导` -> `/home-guide`
  - `查看训练周报` -> `/training-weekly`
- Optional discoverability:
  - add `/training-advice` entry in quick menu.

## Runtime and error handling

- Reuse current guard behavior:
  - no token -> `/auth?next=...`
  - token but no child -> `/create-child?next=...`
- Page-level degraded messaging:
  - no Supabase client: show default advice + explicit degraded reason
  - no child selected: show default advice + explicit degraded reason
  - query failure: show degraded reason and keep usable fallback cards

## Testing design

### Unit/component

1. New: `src/app/training-advice/page.test.tsx`
   - renders core heading + AI action + outbound CTA
2. Update: `src/app/assessment/page.test.tsx`
   - completed state includes `进入训练建议` CTA

### E2E (non-live)

- New: `tests/e2e/parent-assessment-advice-home-guide.spec.ts`
- Flow:
  1. save manual runtime token/child in `/auth`
  2. complete `/assessment` minimal questionnaire
  3. navigate to `/training-advice`
  4. navigate to `/home-guide`
- Purpose: assert chain continuity independent of live OTP/SMS.

## Verification

1. `pnpm exec vitest src/app/assessment/page.test.tsx src/app/training-advice/page.test.tsx`
2. `pnpm playwright test tests/e2e/parent-assessment-advice-home-guide.spec.ts`
3. `pnpm exec tsc --noEmit`
4. `bash scripts/ci/frontend_final_gate.sh`

## Risk and mitigation

- Risk: degraded runtime in CI may hide data-fetch regressions.
  - Mitigation: assert both UI structure and degraded markers absence/presence in tests.
- Risk: assessment save failures could block chain progression.
  - Mitigation: CTA shown on completion state independent of save success, preserving continuity.
