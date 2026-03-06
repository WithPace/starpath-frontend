# No Color Conflict Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove `NO_COLOR`/`FORCE_COLOR` conflict warnings from frontend CI logs without losing color output.

**Architecture:** Add a tiny shell guard before Playwright invocation paths in CI scripts, plus a contract test that enforces the guard is present.

**Tech Stack:** Bash scripts, Vitest contract tests, pnpm CI gate.

### Task 1: RED contract test

**Files:**
- Create: `tests/contract/no-color-env-conflict-contract.test.ts`

**Step 1: Write failing test**
- Assert both `scripts/ci/frontend_final_gate.sh` and `scripts/ci/frontend_live_e2e.sh` contain guard:
  - detect both env vars set
  - `unset NO_COLOR`

**Step 2: Run RED test**
Run: `pnpm exec vitest run tests/contract/no-color-env-conflict-contract.test.ts`
Expected: FAIL.

### Task 2: Implement env conflict guard

**Files:**
- Modify: `scripts/ci/frontend_final_gate.sh`
- Modify: `scripts/ci/frontend_live_e2e.sh`

**Step 1: Add minimal guard**
```bash
if [ -n "${NO_COLOR:-}" ] && [ -n "${FORCE_COLOR:-}" ]; then
  unset NO_COLOR
fi
```

**Step 2: Re-run RED test (GREEN)**
Run: `pnpm exec vitest run tests/contract/no-color-env-conflict-contract.test.ts`
Expected: PASS.

### Task 3: Full verification and docs

**Files:**
- Modify: `docs/governance/FRONTEND-UX-DELTA-2026-03-05.md`

**Step 1: Update governance delta**
- Add line for CI log noise hardening.

**Step 2: Run full gate**
Run: `bash scripts/ci/frontend_final_gate.sh`
Expected: PASS.
