# Live E2E OTP Retry Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reduce live E2E operator friction by handling OTP expiry in one interactive script run.

**Architecture:** Extend `scripts/ci/frontend_live_e2e_interactive.sh` with a bounded verification loop and retryable-error detection. Keep existing request retry behavior and auth-mode branching intact.

**Tech Stack:** Bash + curl + node JSON parsing + existing frontend live e2e scripts.

### Task 1: RED contract test

**Files:**
- Create: `tests/contract/live-e2e-interactive-otp-retry-contract.test.ts`

**Step 1: Write failing test**
- Assert interactive script includes:
  - `max_verify_attempts`
  - retryable verify failure branch
  - OTP resend + prompt loop

**Step 2: Run RED**
Run: `pnpm exec vitest run tests/contract/live-e2e-interactive-otp-retry-contract.test.ts`
Expected: FAIL.

### Task 2: Implement retry loop

**Files:**
- Modify: `scripts/ci/frontend_live_e2e_interactive.sh`

**Step 1: Add helper(s)**
- parse verify response error message/code
- classify retryable expiry/invalid-token cases

**Step 2: Add bounded loop in token mode**
- on retryable failure: resend OTP and re-prompt
- on success: continue to `frontend_live_e2e.sh`
- on max attempts: fail with actionable message

**Step 3: Run GREEN contract**
Run: `pnpm exec vitest run tests/contract/live-e2e-interactive-otp-retry-contract.test.ts`
Expected: PASS.

### Task 3: Governance delta + gate

**Files:**
- Modify: `docs/governance/FRONTEND-UX-DELTA-2026-03-05.md`

**Step 1: Add one-line evidence update**
- mention OTP expiry recovery in interactive live script.

**Step 2: Run full gate**
Run: `bash scripts/ci/frontend_final_gate.sh`
Expected: PASS.
