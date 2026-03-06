# Next Config Dev Warnings Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate repeat Next.js dev warnings in frontend CI/e2e by setting explicit `allowedDevOrigins` and `turbopack.root`.

**Architecture:** Keep change surface minimal by touching only `next.config.ts` and adding one contract test. Verify by running contract + targeted e2e + full gate.

**Tech Stack:** Next.js 16 config, Vitest contract tests, Playwright e2e, pnpm scripts.

### Task 1: RED contract for next config

**Files:**
- Create: `tests/contract/next-config-dev-warnings-contract.test.ts`

**Step 1: Write failing test**
- Assert `next.config.ts` contains `allowedDevOrigins` and `turbopack.root` configuration.

**Step 2: Run test to verify it fails**
Run: `pnpm exec vitest run tests/contract/next-config-dev-warnings-contract.test.ts`
Expected: FAIL (current config is placeholder only).

### Task 2: Minimal next config implementation

**Files:**
- Modify: `next.config.ts`

**Step 1: Add config fields**
- `allowedDevOrigins`: local host variants with wildcard ports.
- `turbopack.root`: absolute root from config directory.

**Step 2: Re-run contract test (GREEN)**
Run: `pnpm exec vitest run tests/contract/next-config-dev-warnings-contract.test.ts`
Expected: PASS.

### Task 3: Regression checks

**Files:**
- Modify: none (verification only)

**Step 1: Targeted non-live e2e**
Run: `pnpm playwright test tests/e2e/parent-dashboard-followup.spec.ts`
Expected: PASS.

**Step 2: Full gate**
Run: `bash scripts/ci/frontend_final_gate.sh`
Expected: PASS.

### Task 4: Commit and merge prep

**Files:**
- Modify: `docs/governance/FRONTEND-UX-DELTA-2026-03-05.md`

**Step 1: Update governance delta evidence**
- Add one line for dev warning hardening.

**Step 2: Commit**
```bash
git add next.config.ts tests/contract/next-config-dev-warnings-contract.test.ts \
  docs/governance/FRONTEND-UX-DELTA-2026-03-05.md \
  docs/plans/2026-03-06-next-config-dev-warnings-design.md \
  docs/plans/2026-03-06-next-config-dev-warnings-implementation.md
git commit -m "chore(frontend): harden next dev config for local warnings"
```
