# Parent Full UX (Prototype-Aligned) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver a complete parent-side business chain with prototype_v2 visual parity, strict runtime governance, key exception recovery, and full-page coverage (including missing pages).

**Architecture:** Keep existing Next.js App Router structure and current Supabase/orchestrator integration, but introduce a single runtime-state guard layer (`S0/S1/S2`) and refactor page shells to prototype-first UI patterns. Large-deviation pages are rebuilt component-first while preserving existing domain adapters and AI contracts. New missing pages are added with the same runtime contract and consistent error/retry UX.

**Tech Stack:** Next.js 16 + React 19 + TypeScript + Zustand + Supabase JS + Playwright + Vitest.

**Execution Rules:**

- Use `@superpowers:test-driven-development` on every task.
- Use `@superpowers:verification-before-completion` before marking each task done.
- Keep commits small and isolated (one task, one commit).

---

### Task 1: Runtime State Model and Guard Matrix

**Files:**
- Modify: `src/lib/runtime/route-guard.ts`
- Modify: `src/lib/runtime/route-guard.test.ts`
- Modify: `src/lib/runtime/use-role-runtime.ts`
- Modify: `src/lib/runtime/role-runtime.ts`

**Step 1: Write failing tests for `S1` child-required redirect**

```ts
it("redirects authenticated user without child to /create-child for protected routes", () => {
  expect(getRouteGuardDecision({
    loading: false,
    accessToken: "jwt",
    hasActiveChild: false,
    currentPath: "/chat",
  })).toEqual({
    allow: false,
    redirectTo: "/create-child?next=%2Fchat",
    reason: "child_required",
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest src/lib/runtime/route-guard.test.ts`
Expected: FAIL with missing `hasActiveChild` / wrong redirect behavior.

**Step 3: Implement minimal guard changes**

```ts
if (input.accessToken && input.hasActiveChild === false && requiresChild(input.currentPath)) {
  return { allow: false, redirectTo: `/create-child?next=${next}`, reason: "child_required" };
}
```

**Step 4: Re-run test suite for guard**

Run: `pnpm vitest src/lib/runtime/route-guard.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/runtime/route-guard.ts src/lib/runtime/route-guard.test.ts src/lib/runtime/use-role-runtime.ts src/lib/runtime/role-runtime.ts
git commit -m "feat(runtime): enforce child-required guard matrix for parent flow"
```

---

### Task 2: Auth/Create-Child Transition Contract

**Files:**
- Modify: `src/app/auth/page.tsx`
- Modify: `src/app/auth/page.test.tsx`
- Modify: `src/app/create-child/page.tsx`
- Modify: `src/app/create-child/page.test.tsx`

**Step 1: Write failing tests for transition routing**

```ts
it("redirects first-login user to /create-child", async () => {
  // verifyOtp success + ensureParentRegistration => isFirstLogin true
  // expect router.replace("/create-child")
});

it("redirects returning user to next path", async () => {
  // isFirstLogin false
  // expect router.replace("/chat")
});
```

**Step 2: Run tests to verify failures**

Run: `pnpm vitest src/app/auth/page.test.tsx src/app/create-child/page.test.tsx`
Expected: FAIL on routing/CTA assertions.

**Step 3: Minimal implementation**

- Keep OTP-first registration behavior.
- Ensure successful child creation updates runtime child context and redirects to `/assessment` by default.

**Step 4: Re-run tests**

Run: `pnpm vitest src/app/auth/page.test.tsx src/app/create-child/page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/auth/page.tsx src/app/auth/page.test.tsx src/app/create-child/page.tsx src/app/create-child/page.test.tsx
git commit -m "feat(flow): lock auth-to-create-child-to-assessment transition contract"
```

---

### Task 3: Prototype-First Rebuild for `/home-guide` and `/voice-record`

**Files:**
- Modify: `src/app/home-guide/page.tsx`
- Modify: `src/app/home-guide/page.test.tsx`
- Modify: `src/app/voice-record/page.tsx`
- Modify: `src/app/voice-record/page.test.tsx`
- Modify: `src/app/globals.css`

**Step 1: Write failing UI structure tests**

```ts
it("renders home-guide task card layout per prototype sections", () => {
  expect(screen.getByRole("heading", { name: "今日执行重点（动态）" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "AI 生成今日计划" })).toBeInTheDocument();
});

it("renders voice-record as structured form + result cards", () => {
  expect(screen.getByLabelText("训练记录内容")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "AI 结构化记录" })).toBeInTheDocument();
});
```

**Step 2: Run tests to see failures**

Run: `pnpm vitest src/app/home-guide/page.test.tsx src/app/voice-record/page.test.tsx`
Expected: FAIL due to missing prototype sections/classes.

**Step 3: Implement minimal prototype-conformant shells**

- Re-layout sections in prototype order.
- Preserve current AI trigger handlers and fallback messages.

**Step 4: Re-run tests**

Run: `pnpm vitest src/app/home-guide/page.test.tsx src/app/voice-record/page.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/home-guide/page.tsx src/app/home-guide/page.test.tsx src/app/voice-record/page.tsx src/app/voice-record/page.test.tsx src/app/globals.css
git commit -m "feat(ui): rebuild home-guide and voice-record to prototype-first layouts"
```

---

### Task 4: Prototype-First Rebuild for Weekly/Report/Detail/Card Fullscreen

**Files:**
- Modify: `src/app/training-weekly/page.tsx`
- Modify: `src/app/training-weekly/page.test.tsx`
- Modify: `src/app/analysis-report/page.tsx`
- Modify: `src/app/analysis-report/page.test.tsx`
- Modify: `src/app/training-detail/page.tsx`
- Modify: `src/app/training-detail/page.test.tsx`
- Modify: `src/app/card-fullscreen/page.tsx`
- Modify: `src/app/card-fullscreen/page.test.tsx`
- Modify: `src/app/globals.css`

**Step 1: Add failing tests for prototype interaction model**

```ts
it("shows weekly report card with AI interpretation actions", () => {
  expect(screen.getByRole("button", { name: "AI 解读周报" })).toBeInTheDocument();
});

it("shows analysis report sections and action buttons", () => {
  expect(screen.getByText("综合发展分析报告")).toBeInTheDocument();
});

it("shows training detail timeline + export actions", () => {
  expect(screen.getByRole("button", { name: "导出 PDF" })).toBeInTheDocument();
});
```

**Step 2: Run tests and confirm red**

Run: `pnpm vitest src/app/training-weekly/page.test.tsx src/app/analysis-report/page.test.tsx src/app/training-detail/page.test.tsx src/app/card-fullscreen/page.test.tsx`
Expected: FAIL on structure/interaction expectations.

**Step 3: Implement minimal page refactors**

- Keep existing data fetch & AI calls.
- Replace visual/container hierarchy to prototype behavior.

**Step 4: Re-run tests**

Same command.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/training-weekly/page.tsx src/app/training-weekly/page.test.tsx src/app/analysis-report/page.tsx src/app/analysis-report/page.test.tsx src/app/training-detail/page.tsx src/app/training-detail/page.test.tsx src/app/card-fullscreen/page.tsx src/app/card-fullscreen/page.test.tsx src/app/globals.css
git commit -m "feat(ui): align weekly report and detail pages with prototype interactions"
```

---

### Task 5: Add Missing Core Pages (Part 1)

**Files:**
- Create: `src/app/children/page.tsx`
- Create: `src/app/children/page.test.tsx`
- Create: `src/app/children/[id]/edit/page.tsx`
- Create: `src/app/children/[id]/edit/page.test.tsx`
- Create: `src/app/auth/session-expired/page.tsx`
- Create: `src/app/auth/session-expired/page.test.tsx`

**Step 1: Write failing route page tests**

```ts
it("renders child list and active switch actions", () => {});
it("renders child edit form and save CTA", () => {});
it("renders session-expired recovery actions", () => {});
```

**Step 2: Run tests to confirm missing routes fail**

Run: `pnpm vitest src/app/children/page.test.tsx src/app/children/[id]/edit/page.test.tsx src/app/auth/session-expired/page.test.tsx`
Expected: FAIL (file/module missing).

**Step 3: Implement minimal pages with guard and recovery UX**

- Child pages require `S2` or redirect.
- Session expired page routes to `/auth` and keeps `next`.

**Step 4: Re-run tests**

Same command.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/children src/app/auth/session-expired
git commit -m "feat(pages): add children management and session-expired recovery pages"
```

---

### Task 6: Add Missing Core Pages (Part 2)

**Files:**
- Create: `src/app/sync-center/page.tsx`
- Create: `src/app/sync-center/page.test.tsx`
- Create: `src/app/notifications/page.tsx`
- Create: `src/app/notifications/page.test.tsx`
- Create: `src/app/data-consent/page.tsx`
- Create: `src/app/data-consent/page.test.tsx`

**Step 1: Write failing tests for page contracts**

```ts
it("renders failed task retry list in sync-center", () => {});
it("renders notification tabs and unread states", () => {});
it("renders consent scope and revoke action", () => {});
```

**Step 2: Run tests to verify red**

Run: `pnpm vitest src/app/sync-center/page.test.tsx src/app/notifications/page.test.tsx src/app/data-consent/page.test.tsx`
Expected: FAIL (missing modules).

**Step 3: Implement minimal pages with shared shell styles**

- Reuse existing style tokens.
- Keep data adapters injectable/stub-friendly for tests.

**Step 4: Re-run tests**

Same command.
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/sync-center src/app/notifications src/app/data-consent
git commit -m "feat(pages): add sync center notifications and data consent surfaces"
```

---

### Task 7: Parent E2E Scenarios (Main + Exceptions)

**Files:**
- Modify: `tests/e2e/live-parent-full-chain.spec.ts`
- Create: `tests/e2e/parent-session-expired-recovery.spec.ts`
- Create: `tests/e2e/parent-sync-center-retry.spec.ts`
- Create: `tests/e2e/parent-child-switch.spec.ts`
- Modify: `scripts/ci/frontend_final_gate.sh`

**Step 1: Write failing E2E specs first**

- session-expired recovery path.
- sync-center retry from failed request to success.
- multi-child switch consistency across chat/dashboard.

**Step 2: Run only new specs and confirm failures**

Run:

```bash
pnpm playwright test tests/e2e/parent-session-expired-recovery.spec.ts tests/e2e/parent-sync-center-retry.spec.ts tests/e2e/parent-child-switch.spec.ts
```

Expected: FAIL before implementation completion.

**Step 3: Minimal app/test harness updates to make specs pass**

- add needed selectors and stable labels,
- ensure deterministic fallback behavior in tests.

**Step 4: Re-run spec set**

Same command.
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e scripts/ci/frontend_final_gate.sh
git commit -m "test(e2e): add parent exception recovery and child switch coverage"
```

---

### Task 8: Visual Audit Automation and Governance Update

**Files:**
- Create: `scripts/ci/frontend_ui_audit_screenshots.sh`
- Modify: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- Modify: `docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md`
- Create: `docs/governance/FRONTEND-UX-DELTA-2026-03-05.md`

**Step 1: Write failing check script test contract**

- Add a shell test that asserts screenshot artifacts are generated for 13 prototype pages.

**Step 2: Run contract test and verify failure**

Run: `bash tests/governance/test_frontend_ui_audit_artifacts.sh`
Expected: FAIL before script exists.

**Step 3: Implement screenshot audit script**

- Capture `current` and `prototype` directories,
- emit comparable filenames.

**Step 4: Run contract + final gate**

Run:

```bash
bash tests/governance/test_frontend_ui_audit_artifacts.sh
bash scripts/ci/frontend_final_gate.sh
```

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/ci/frontend_ui_audit_screenshots.sh docs/governance/FRONTEND-COMPLETENESS-AUDIT.md docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md docs/governance/FRONTEND-UX-DELTA-2026-03-05.md tests/governance/test_frontend_ui_audit_artifacts.sh
git commit -m "chore(governance): add repeatable frontend visual audit and delta record"
```

---

## Final Verification Gate (after Task 8)

Run all:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm playwright test --grep-invert @live
E2E_LIVE_PHONE=+8613800138000 E2E_LIVE_OTP=123456 E2E_LIVE_PARENT_CHILD_ID=eb8c4b39-bfd3-496b-b604-1d1ea76cd424 bash scripts/ci/frontend_live_e2e_interactive.sh
```

Expected:

- no lint/type/test failures,
- non-live E2E green,
- live parent chain green,
- visual audit artifacts regenerated.

