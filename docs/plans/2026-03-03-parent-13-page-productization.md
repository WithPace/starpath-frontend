# Parent 13-Page Productization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a productized parent-facing frontend aligned to prototype_v2 13-page matrix while preserving current auth/runtime integration and release gates.

**Architecture:** Add missing parent prototype routes and shared UI shell/components, then upgrade existing `/chat` and `/auth` visual fidelity. Keep backend integration for auth/chat context, and use deterministic demo datasets for report/detail pages where live data contracts are not yet finalized.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS, Vitest, Testing Library, Playwright.

### Task 1: Lock prototype page matrix contract

**Files:**
- Create: `src/lib/prototype/parent-page-registry.ts`
- Create: `src/lib/prototype/parent-page-registry.test.ts`

**Step 1: Write failing test**

- Assert registry contains 13 page records (`00` to `12`) with required path/title keys.

**Step 2: Run test and verify RED**

```bash
pnpm vitest run src/lib/prototype/parent-page-registry.test.ts
```

Expected: FAIL before registry exists.

**Step 3: Implement minimal registry**

- Add typed page descriptor list mapping prototype IDs to routes.

**Step 4: Run test and verify GREEN**

```bash
pnpm vitest run src/lib/prototype/parent-page-registry.test.ts
```

Expected: PASS.

### Task 2: Build shared parent prototype shell and style tokens

**Files:**
- Create: `src/components/prototype/parent-shell.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/prototype/parent-shell.test.tsx`

**Step 1: Write failing test**

- Assert shell renders title, capsule actions, and bottom nav region.

**Step 2: Run test and verify RED**

```bash
pnpm vitest run src/components/prototype/parent-shell.test.tsx
```

Expected: FAIL.

**Step 3: Implement minimal shell**

- Add reusable top bar, content slot, and mobile-centered layout primitives.

**Step 4: Run test and verify GREEN**

```bash
pnpm vitest run src/components/prototype/parent-shell.test.tsx
```

Expected: PASS.

### Task 3: Add missing prototype routes (00/03/04/05/06/07/08/09/10/11/12)

**Files:**
- Create: `src/app/welcome/page.tsx`
- Create: `src/app/quick-menu/page.tsx`
- Create: `src/app/settings/page.tsx`
- Create: `src/app/create-child/page.tsx`
- Create: `src/app/card-fullscreen/page.tsx`
- Create: `src/app/assessment/page.tsx`
- Create: `src/app/home-guide/page.tsx`
- Create: `src/app/voice-record/page.tsx`
- Create: `src/app/training-weekly/page.tsx`
- Create: `src/app/analysis-report/page.tsx`
- Create: `src/app/training-detail/page.tsx`
- Create: `src/app/prototype-pages.test.tsx`

**Step 1: Write failing tests**

- Assert representative pages render required headings/controls:
  - welcome: brand + start CTA
  - quick-menu: 2x4 entry labels
  - settings: key groups and child pages trigger
  - weekly/report/detail pages: headline blocks and primary action

**Step 2: Run tests and verify RED**

```bash
pnpm vitest run src/app/prototype-pages.test.tsx
```

Expected: FAIL.

**Step 3: Implement minimal pages**

- Build each page with structured sections, prototype-consistent labels, and cross-links.
- Use demo data arrays for report/detail content.

**Step 4: Run tests and verify GREEN**

```bash
pnpm vitest run src/app/prototype-pages.test.tsx
```

Expected: PASS.

### Task 4: Upgrade `/chat` and launch entry to productized parent flow

**Files:**
- Modify: `src/components/chat/role-chat-page.tsx`
- Modify: `src/components/chat/chat-flow.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.test.tsx`

**Step 1: Write failing tests**

- Assert launch page includes parent prototype entry.
- Assert chat flow includes quick actions + richer input areas (voice/add/profile links).

**Step 2: Run tests and verify RED**

```bash
pnpm vitest run src/app/page.test.tsx src/components/chat/chat-flow.test.tsx
```

Expected: FAIL on new expectations.

**Step 3: Implement minimal productized upgrades**

- Add parent prototype CTA to launchboard.
- Enrich chat UI while keeping existing send behavior and auth/runtime guards.

**Step 4: Run tests and verify GREEN**

```bash
pnpm vitest run src/app/page.test.tsx src/components/chat/chat-flow.test.tsx
```

Expected: PASS.

### Task 5: Verify full quality gates

**Files:**
- Modify: `README.md` (routes overview update if needed)

**Step 1: Run focused tests**

```bash
pnpm vitest run src/lib/prototype/parent-page-registry.test.ts src/components/prototype/parent-shell.test.tsx src/app/prototype-pages.test.tsx src/app/page.test.tsx src/components/chat/chat-flow.test.tsx
```

Expected: PASS.

**Step 2: Run full project gate**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Expected: PASS (live suite can be skipped by gate flag).

### Task 6: Commit and push

**Step 1: Commit**

```bash
git add src/app src/components src/lib README.md docs/plans/2026-03-03-parent-13-page-productization-design.md docs/plans/2026-03-03-parent-13-page-productization.md
git commit -m "feat(parent-ui): productize prototype v2 13-page parent experience"
```

**Step 2: Push**

```bash
git push origin main
```
