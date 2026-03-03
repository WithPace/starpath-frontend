# Parent Home Guide + Settings + Card Live Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make parent `home-guide`, `settings`, and `card-fullscreen` pages production-ready with real data chains and durable UX states.

**Architecture:** Add pure domain helpers for recommendation/trend logic and extend Supabase data-access helpers for account and child analytics reads/writes. Integrate each page with `useRoleRuntime("parent")` and preserve fallback states.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase JS v2, Vitest, Testing Library.

### Task 1: Add failing tests for new helper/data-access behavior

**Files:**
- Modify: `src/lib/prototype/parent-data.test.ts`
- Modify: `src/lib/prototype/parent-data-access.test.ts`
- Modify: `src/lib/prototype/parent-data.ts`
- Modify: `src/lib/prototype/parent-data-access.ts`

**Step 1: Write failing tests**

- `parent-data`:
  - trend summary from session list
  - home-guide step generation from scores/risk/trend
- `parent-data-access`:
  - nickname update write chain via gateway

**Step 2: Run tests for RED**

Run: `pnpm vitest run src/lib/prototype/parent-data.test.ts src/lib/prototype/parent-data-access.test.ts`  
Expected: FAIL with missing exports/functions.

**Step 3: Implement minimal helpers**

- add deterministic trend + guide functions
- add nickname save gateway path

**Step 4: Re-run to GREEN**

Run: `pnpm vitest run src/lib/prototype/parent-data.test.ts src/lib/prototype/parent-data-access.test.ts`  
Expected: PASS.

### Task 2: Add failing page tests for settings/home-guide/card

**Files:**
- Create: `src/app/settings/page.test.tsx`
- Create: `src/app/home-guide/page.test.tsx`
- Create: `src/app/card-fullscreen/page.test.tsx`

**Step 1: Write failing tests**

- settings:
  - can edit nickname and trigger save
- home-guide:
  - shows dynamic guidance section label
- card-fullscreen:
  - trend tab shows dynamic summary label

**Step 2: Run RED**

Run: `pnpm vitest run src/app/settings/page.test.tsx src/app/home-guide/page.test.tsx src/app/card-fullscreen/page.test.tsx`  
Expected: FAIL on current static pages.

### Task 3: Implement page integrations

**Files:**
- Modify: `src/app/settings/page.tsx`
- Modify: `src/app/home-guide/page.tsx`
- Modify: `src/app/card-fullscreen/page.tsx`

**Step 1: Implement settings live path**

- load profile (session + users)
- save nickname to users
- persist preference settings in local storage

**Step 2: Implement home-guide live path**

- read recent sessions/profile/assessments
- render 3 dynamic recommended steps

**Step 3: Implement card-fullscreen live path**

- trend/radar/assessment tabs driven by live reads

**Step 4: Re-run focused tests**

Run: `pnpm vitest run src/app/settings/page.test.tsx src/app/home-guide/page.test.tsx src/app/card-fullscreen/page.test.tsx src/app/prototype-pages.test.tsx`  
Expected: PASS.

### Task 4: Full verification and delivery

**Step 1: Run full gate**

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
git commit -m "feat(parent): live-enable home guide settings and card pages"
git push origin main
```
