# Dashboard Live Resilience Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent live dashboard chain from stalling in loading state and ensure cards remain visible under transient backend failures.

**Architecture:** Adjust `RoleDashboardPage` request strategy with a shorter timeout and non-blocking fallback-card degradation path for non-permission errors. Keep permission-denied semantics unchanged.

**Tech Stack:** Next.js App Router, React, Zustand, Vitest, Playwright gates.

### Task 1: RED regression test

**Files:**
- Modify: `src/components/cards/role-dashboard-page.test.tsx`

**Step 1: Write failing test**
- Add test asserting when `callOrchestrator` rejects, `setCards("parent", applyDashboardCardFallback([], "parent"))` is called.

**Step 2: Verify RED**
Run: `pnpm vitest run src/components/cards/role-dashboard-page.test.tsx`
Expected: FAIL because current behavior sets empty cards.

### Task 2: GREEN minimal fix

**Files:**
- Modify: `src/components/cards/role-dashboard-page.tsx`

**Step 1: Add dashboard timeout constant**
- Introduce `DASHBOARD_REQUEST_TIMEOUT_MS = 12_000`.

**Step 2: Apply timeout in orchestrator call**
- Pass `timeoutMs: DASHBOARD_REQUEST_TIMEOUT_MS` in request config.

**Step 3: Implement error degradation policy**
- Keep permission denied branch unchanged (redirect + empty cards).
- For non-permission errors: telemetry already present; set `setError(role, null)` and apply fallback cards.

**Step 4: Verify GREEN**
Run: `pnpm vitest run src/components/cards/role-dashboard-page.test.tsx`
Expected: PASS.

### Task 3: Full verification and governance trace

**Files:**
- Modify: `docs/governance/FRONTEND-UX-DELTA-2026-03-05.md`

**Step 1: Add delivered delta item**
- Record timeout + fallback degradation change for dashboard live resilience.

**Step 2: Run final gate**
Run: `bash scripts/ci/frontend_final_gate.sh`
Expected: PASS.
