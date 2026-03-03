# Parent Assessment + Voice Live Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make parent `assessment` and `voice-record` pages fully connected to Supabase read/write workflows with reliable UX states.

**Architecture:** Reuse the existing prototype data-access module and add two focused write chains (`assessments`, `life_records`) plus page wiring to runtime child context. Keep pure computation in testable functions and page logic minimal.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase JS v2, Vitest, Testing Library.

### Task 1: Add failing tests for assessment and voice data-access logic

**Files:**
- Modify: `src/lib/prototype/parent-data-access.test.ts`
- Modify: `src/lib/prototype/parent-data-access.ts`

**Step 1: Write the failing test**

- Add tests for:
  - `summarizeAssessmentAnswers` (score/risk derivation)
  - `saveAssessmentWithGateway` success/failure path
  - `saveVoiceRecordWithGateway` success path

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/lib/prototype/parent-data-access.test.ts`  
Expected: FAIL with missing exports/functions.

**Step 3: Write minimal implementation**

- Add typed helper functions and gateway-based writers.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/lib/prototype/parent-data-access.test.ts`  
Expected: PASS.

### Task 2: Add failing page tests for assessment/voice save behavior

**Files:**
- Create: `src/app/assessment/page.test.tsx`
- Create: `src/app/voice-record/page.test.tsx`
- Modify: `src/app/assessment/page.tsx`
- Modify: `src/app/voice-record/page.tsx`

**Step 1: Write the failing test**

- `assessment`:
  - answer all questions -> triggers save call -> show "评估已保存"
- `voice-record`:
  - submit note -> triggers save call -> show "记录已保存"

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/app/assessment/page.test.tsx src/app/voice-record/page.test.tsx`  
Expected: FAIL against current demo implementation.

**Step 3: Write minimal implementation**

- Wire both pages to Supabase via parent data-access helpers.
- Add loading/success/error indicators.

**Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/assessment/page.test.tsx src/app/voice-record/page.test.tsx`  
Expected: PASS.

### Task 3: Integrate latest record history rendering

**Files:**
- Modify: `src/app/assessment/page.tsx`
- Modify: `src/app/voice-record/page.tsx`

**Step 1: Write/extend failing expectations**

- assessment renders at least one historical result row when available.
- voice page renders latest note list/fallback copy.

**Step 2: Implement minimal history reads**

- `assessments` latest rows by `created_at desc`
- `life_records` latest rows by `occurred_at desc`

**Step 3: Verify focused tests**

Run: `pnpm vitest run src/app/assessment/page.test.tsx src/app/voice-record/page.test.tsx src/app/prototype-pages.test.tsx`  
Expected: PASS.

### Task 4: Full verification and delivery

**Step 1: Run quality gates**

Run:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

Expected: PASS.

**Step 2: Commit and push**

Run:
```bash
git add docs/plans src/app src/lib
git commit -m "feat(parent): connect assessment and voice pages to live data"
git push origin main
```
