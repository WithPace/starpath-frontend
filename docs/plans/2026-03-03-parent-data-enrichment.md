# Parent Data Enrichment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert key parent prototype pages into real Supabase-backed business flows with robust fallback UX.

**Architecture:** Introduce focused parent data/domain helpers (transform + IO), then connect five parent pages to those helpers while preserving existing shell/navigation. Use strict TDD: failing tests first, then minimal implementation, then full verification.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase JS v2, Vitest.

### Task 1: Add failing tests for parent data domain helpers

**Files:**
- Create: `src/lib/prototype/parent-data.test.ts`
- Create: `src/lib/prototype/parent-data.ts`

**Step 1: Write failing tests**

- Cover:
  - weekly summary aggregation from training sessions
  - grouping sessions by day
  - six-domain score extraction from flexible `domain_levels` shapes

**Step 2: Run test to verify RED**

Run: `pnpm vitest run src/lib/prototype/parent-data.test.ts`  
Expected: FAIL (module/functions missing).

**Step 3: Write minimal implementation**

- Add pure functions with explicit types and safe defaults.

**Step 4: Run test to verify GREEN**

Run: `pnpm vitest run src/lib/prototype/parent-data.test.ts`  
Expected: PASS.

### Task 2: Add failing tests for create-child data workflow orchestration

**Files:**
- Create: `src/lib/prototype/parent-data-access.test.ts`
- Create: `src/lib/prototype/parent-data-access.ts`

**Step 1: Write failing tests**

- Cover:
  - no session -> fails with explicit auth error
  - success path -> users upsert + children insert + care_teams insert + optional children_medical insert
  - child insert failure -> fail fast and stop downstream writes

**Step 2: Run test to verify RED**

Run: `pnpm vitest run src/lib/prototype/parent-data-access.test.ts`  
Expected: FAIL.

**Step 3: Write minimal implementation**

- Implement create-child orchestration with Supabase query builder calls.

**Step 4: Run test to verify GREEN**

Run: `pnpm vitest run src/lib/prototype/parent-data-access.test.ts`  
Expected: PASS.

### Task 3: Connect `/create-child` page to real write flow

**Files:**
- Modify: `src/app/create-child/page.tsx`

**Step 1: Write failing page behavior test**

- Extend existing page-level tests (or add new) for:
  - submit disabled during save
  - success message after write
  - error message on failure

**Step 2: Run targeted tests to verify RED**

Run: `pnpm vitest run src/app/prototype-pages.test.tsx`  
Expected: FAIL for new expectations.

**Step 3: Implement minimal page integration**

- Wire form submit to `createChildProfile`.
- Keep current visual style, add loading/success/error signals.

**Step 4: Run targeted tests to verify GREEN**

Run: `pnpm vitest run src/app/prototype-pages.test.tsx`  
Expected: PASS.

### Task 4: Connect read pages to live data + fallback

**Files:**
- Modify: `src/app/quick-menu/page.tsx`
- Modify: `src/app/training-weekly/page.tsx`
- Modify: `src/app/training-detail/page.tsx`
- Modify: `src/app/analysis-report/page.tsx`
- Optionally modify: `src/app/globals.css`

**Step 1: Write failing tests for new deterministic helper outputs**

- Keep parser/summary tests in `parent-data.test.ts` as guardrail for displayed computed values.

**Step 2: Implement minimal page integration**

- Use runtime child context + Supabase reads.
- Render:
  - loading state
  - empty fallback state
  - computed live state

**Step 3: Run focused tests**

Run: `pnpm vitest run src/lib/prototype/parent-data.test.ts src/app/prototype-pages.test.tsx`  
Expected: PASS.

### Task 5: Full verification and release evidence

**Step 1: Run full gate**

Run:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

Expected: all pass.

**Step 2: Commit**

Run:
```bash
git add docs/plans src/app src/lib
git commit -m "feat(parent): enrich prototype pages with live supabase data flows"
```

**Step 3: Push**

Run: `git push origin main`
