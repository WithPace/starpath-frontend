# OTP First Login Registration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ensure first phone OTP login explicitly performs registration initialization and onboarding redirect.

**Architecture:** Keep Supabase OTP login flow unchanged; add a post-login registration handshake in frontend data-access + auth page control flow.

**Tech Stack:** Next.js App Router, TypeScript, Supabase JS v2, Vitest.

### Task 1: TDD registration helper

**Files:**
- Modify: `src/lib/prototype/parent-data-access.test.ts`
- Modify: `src/lib/prototype/parent-data-access.ts`

**Step 1: Add failing tests**
- missing session user should throw
- zero parent links should mark first login
- existing parent links should mark returning login

**Step 2: Run RED**

Run:
```bash
pnpm vitest run src/lib/prototype/parent-data-access.test.ts
```

**Step 3: Minimal implementation**
- add registration gateway/result types
- add `ensureParentRegistrationWithGateway`
- add client gateway + public wrapper

**Step 4: Run GREEN**

Run:
```bash
pnpm vitest run src/lib/prototype/parent-data-access.test.ts
```

### Task 2: Connect auth flow

**Files:**
- Modify: `src/app/auth/page.tsx`

**Step 1: Integrate post-OTP registration**
- call registration helper after `verifyOtp` success
- first login -> redirect `/create-child`
- returning login -> keep existing `next` redirect

**Step 2: Verify auth render tests unaffected**

Run:
```bash
pnpm vitest run src/app/auth/page.test.tsx
```

### Task 3: Verification

Run:
```bash
pnpm lint
pnpm typecheck
pnpm test
```
