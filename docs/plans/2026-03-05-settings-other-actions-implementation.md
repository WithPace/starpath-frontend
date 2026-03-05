# Settings Other Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete settings other-actions chain by delivering `/about`, `/vip`, `/account-close` routes and wiring them from settings.

**Architecture:** Reuse `ParentShell` for consistency with parent experience. Add three focused pages with deterministic static/action states, then update settings links and unit tests. Keep account closure as local request confirmation in this wave.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, pnpm.

### Task 1: Add about/vip routes with tests (TDD)

**Files:**
- Create: `src/app/about/page.tsx`
- Create: `src/app/about/page.test.tsx`
- Create: `src/app/vip/page.tsx`
- Create: `src/app/vip/page.test.tsx`

**Step 1: Write failing tests**

```tsx
expect(screen.getByRole("heading", { name: "关于星途", level: 1 })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "升级 VIP", level: 1 })).toBeInTheDocument();
```

**Step 2: Run RED**

Run: `pnpm exec vitest src/app/about/page.test.tsx src/app/vip/page.test.tsx`

Expected: FAIL.

**Step 3: Minimal implementation**

- static sections + return link `/settings`
- VIP page has upgrade CTA feedback message

**Step 4: Run GREEN**

Run: `pnpm exec vitest src/app/about/page.test.tsx src/app/vip/page.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/about/page.tsx src/app/about/page.test.tsx src/app/vip/page.tsx src/app/vip/page.test.tsx
git commit -m "feat(settings): add about and vip routes"
```

### Task 2: Add account-close route with confirmation flow (TDD)

**Files:**
- Create: `src/app/account-close/page.tsx`
- Create: `src/app/account-close/page.test.tsx`

**Step 1: Write failing test**

```tsx
fireEvent.click(screen.getByRole("button", { name: "提交注销申请" }));
expect(screen.getByText("请先勾选确认项。"));
```

**Step 2: Run RED**

Run: `pnpm exec vitest src/app/account-close/page.test.tsx`

Expected: FAIL.

**Step 3: Minimal implementation**

- confirm checkbox
- submit button
- success message on valid submit

**Step 4: Run GREEN**

Run: `pnpm exec vitest src/app/account-close/page.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/account-close/page.tsx src/app/account-close/page.test.tsx
git commit -m "feat(settings): add account-close request flow"
```

### Task 3: Wire settings other-tab links

**Files:**
- Modify: `src/app/settings/page.tsx`
- Modify: `src/app/settings/page.test.tsx`

**Step 1: Add failing assertions**

```tsx
expect(screen.getByRole("link", { name: "关于星途" })).toHaveAttribute("href", "/about");
expect(screen.getByRole("link", { name: "升级 VIP" })).toHaveAttribute("href", "/vip");
expect(screen.getByRole("link", { name: "注销账号" })).toHaveAttribute("href", "/account-close");
```

**Step 2: Run RED**

Run: `pnpm exec vitest src/app/settings/page.test.tsx`

Expected: FAIL.

**Step 3: Minimal wiring**

- replace static list text with `Link` entries

**Step 4: Run GREEN**

Run: `pnpm exec vitest src/app/settings/page.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/settings/page.tsx src/app/settings/page.test.tsx
git commit -m "feat(settings): wire about vip and account-close links"
```

### Task 4: Governance + full verification

**Files:**
- Modify: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`

**Step 1: Update audit evidence**

- add about/vip/account-close routes under extended parent surfaces

**Step 2: Run final verification**

Run:

```bash
pnpm exec vitest src/app/about/page.test.tsx src/app/vip/page.test.tsx src/app/account-close/page.test.tsx src/app/settings/page.test.tsx
pnpm exec tsc --noEmit
bash scripts/ci/frontend_final_gate.sh
```

Expected: all PASS.

**Step 3: Commit**

```bash
git add docs/governance/FRONTEND-COMPLETENESS-AUDIT.md
git commit -m "docs(governance): add settings other-actions route coverage"
```
