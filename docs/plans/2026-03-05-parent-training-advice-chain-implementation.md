# Parent Training Advice Chain Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the missing parent `/training-advice` page and close the assessment -> advice -> home-guide business execution chain with automated evidence.

**Architecture:** Keep current App Router and runtime guard model; add a new `training-advice` page that consumes existing parent data adapters and degrades safely when runtime context is missing. Extend assessment completion UI to route into advice, then verify chain continuity through one non-live Playwright spec.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Playwright, pnpm.

### Task 1: Add `training-advice` page contract tests first (TDD RED)

**Files:**
- Create: `src/app/training-advice/page.test.tsx`
- Create: `src/app/training-advice/page.tsx`

**Step 1: Write failing test for page structure**

```tsx
expect(screen.getByRole("heading", { name: "训练建议", level: 2 })).toBeInTheDocument();
expect(screen.getByRole("button", { name: "AI 生成训练建议" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "进入居家指导" })).toBeInTheDocument();
```

**Step 2: Run test to confirm RED**

Run: `pnpm exec vitest src/app/training-advice/page.test.tsx`  
Expected: FAIL (module/page missing).

**Step 3: Implement minimal page**

- Build page with:
  - `ParentShell`
  - runtime/client checks
  - advice card list
  - AI regenerate action button
  - CTA links to `/home-guide` and `/training-weekly`

**Step 4: Run test to confirm GREEN**

Run: `pnpm exec vitest src/app/training-advice/page.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/training-advice/page.tsx src/app/training-advice/page.test.tsx
git commit -m "feat(parent): add training-advice page with advice generation actions"
```

### Task 2: Wire assessment completion to training-advice (TDD RED->GREEN)

**Files:**
- Modify: `src/app/assessment/page.tsx`
- Modify: `src/app/assessment/page.test.tsx`

**Step 1: Add failing test assertion**

```tsx
expect(screen.getByRole("link", { name: "进入训练建议" })).toBeInTheDocument();
```

**Step 2: Run test in RED state**

Run: `pnpm exec vitest src/app/assessment/page.test.tsx`  
Expected: FAIL on missing CTA.

**Step 3: Implement minimal CTA**

- In completed assessment state, add link/button:
  - `/training-advice`
  - text: `进入训练建议`

**Step 4: Run test to GREEN**

Run: `pnpm exec vitest src/app/assessment/page.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/assessment/page.tsx src/app/assessment/page.test.tsx
git commit -m "feat(flow): add assessment-to-training-advice completion handoff"
```

### Task 3: Add non-live E2E chain coverage

**Files:**
- Create: `tests/e2e/parent-assessment-advice-home-guide.spec.ts`

**Step 1: Write E2E for chain continuity**

- save manual runtime in `/auth`
- complete 3 assessment questions
- enter `/training-advice`
- navigate to `/home-guide`

**Step 2: Run E2E (expect RED first if selectors/routes missing)**

Run:
`pnpm playwright test tests/e2e/parent-assessment-advice-home-guide.spec.ts`

Expected: initial FAIL before all selectors/links settle.

**Step 3: Minimal fixes (if needed)**

- stabilize headings/labels in page(s)
- ensure route text selectors are deterministic

**Step 4: Re-run E2E to GREEN**

Run:
`pnpm playwright test tests/e2e/parent-assessment-advice-home-guide.spec.ts`

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e/parent-assessment-advice-home-guide.spec.ts src/app/training-advice/page.tsx src/app/assessment/page.tsx
git commit -m "test(e2e): cover parent assessment-advice-home-guide chain"
```

### Task 4: Verification gate and governance sync

**Files:**
- Modify: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- Modify: `docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md`

**Step 1: Update governance mappings**

- add `/training-advice` route coverage row
- add AI touchpoint row for training advice

**Step 2: Execute full checks**

Run:

```bash
pnpm exec vitest src/app/training-advice/page.test.tsx src/app/assessment/page.test.tsx
pnpm playwright test tests/e2e/parent-assessment-advice-home-guide.spec.ts
pnpm exec tsc --noEmit
bash scripts/ci/frontend_final_gate.sh
```

Expected: all PASS.

**Step 3: Commit**

```bash
git add docs/governance/FRONTEND-COMPLETENESS-AUDIT.md docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md
git commit -m "docs(governance): add training-advice chain coverage evidence"
```

