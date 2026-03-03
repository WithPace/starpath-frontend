# Phone OTP Auth Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align frontend authentication with PRD by replacing email/password with phone OTP login.

**Architecture:** The `/auth` page performs two explicit actions: send OTP and verify OTP using Supabase auth APIs. Live E2E config and docs are updated to the same phone-based contract to keep CI and operator steps consistent.

**Tech Stack:** Next.js App Router, React, Supabase JS v2, Vitest, Playwright.

### Task 1: Lock expected UI/auth contract via tests

**Files:**
- Create: `src/app/auth/page.test.tsx`
- Modify: `src/lib/runtime/live-e2e-config.test.ts`

**Step 1: Write failing tests**
- Assert `/auth` exposes `手机号`, `验证码`, `发送验证码`, `验证码登录`.
- Assert live env keys are `E2E_LIVE_PHONE`, `E2E_LIVE_OTP`, `E2E_LIVE_PARENT_CHILD_ID`.

**Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run src/app/auth/page.test.tsx src/lib/runtime/live-e2e-config.test.ts
```

Expected: FAIL because current implementation is still email/password.

### Task 2: Implement phone OTP auth flow

**Files:**
- Modify: `src/app/auth/page.tsx`

**Step 1: Replace auth state**
- Replace email/password state with phone/otp state.
- Track session user phone where available.

**Step 2: Implement send/verify handlers**
- Send code: `client.auth.signInWithOtp({ phone })`.
- Verify code: `client.auth.verifyOtp({ phone, token: otp, type: "sms" })`.
- Keep sign-out and manual runtime credential flows intact.

**Step 3: Update auth form copy/controls**
- Remove email/password/signup buttons.
- Add phone input + OTP input + send/verify buttons.

### Task 3: Update live E2E runtime contract and docs

**Files:**
- Modify: `src/lib/runtime/live-e2e-config.ts`
- Modify: `tests/e2e/live-parent-full-chain.spec.ts`
- Modify: `.env.example`
- Modify: `README.md`

**Step 1: Change env parser**
- Use `phone` and `otp` fields, with new required keys.

**Step 2: Change live e2e flow**
- Fill phone, click send code, fill OTP, click verify login.

**Step 3: Sync operator docs**
- Update env variable names and auth instructions to phone OTP.

### Task 4: Verify green and commit

**Files:**
- Modify: none (verification only)

**Step 1: Run focused tests**

```bash
pnpm vitest run src/app/auth/page.test.tsx src/lib/runtime/live-e2e-config.test.ts
```

Expected: PASS.

**Step 2: Run quality gate**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all pass.

**Step 3: Commit**

```bash
git add src/app/auth/page.tsx src/app/auth/page.test.tsx src/lib/runtime/live-e2e-config.ts src/lib/runtime/live-e2e-config.test.ts tests/e2e/live-parent-full-chain.spec.ts .env.example README.md docs/plans/2026-03-03-phone-otp-auth-design.md docs/plans/2026-03-03-phone-otp-auth-implementation.md
git commit -m "feat(auth): switch parent login flow to phone otp"
```
