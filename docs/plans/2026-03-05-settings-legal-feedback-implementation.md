# Settings Legal Feedback Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver routable legal/feedback pages and wire settings entries to these routes for a complete settings execution chain.

**Architecture:** Keep existing `ParentShell` and route organization in App Router. Add three focused pages (`/legal/terms`, `/legal/privacy`, `/feedback`), then update `/settings` legal/other tabs to link to them. Add unit tests first and verify with full frontend gate.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, pnpm.

### Task 1: Add legal pages with TDD

**Files:**
- Create: `src/app/legal/terms/page.tsx`
- Create: `src/app/legal/privacy/page.tsx`
- Create: `src/app/legal/terms/page.test.tsx`
- Create: `src/app/legal/privacy/page.test.tsx`

**Step 1: Write failing tests**

```tsx
expect(screen.getByRole("heading", { name: "用户协议" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "隐私政策" })).toBeInTheDocument();
```

**Step 2: Run tests to confirm RED**

Run:
`pnpm exec vitest src/app/legal/terms/page.test.tsx src/app/legal/privacy/page.test.tsx`

Expected: FAIL (pages missing).

**Step 3: Implement minimal pages**

- render title + key clauses
- include return link to `/settings`

**Step 4: Re-run tests to GREEN**

Run:
`pnpm exec vitest src/app/legal/terms/page.test.tsx src/app/legal/privacy/page.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/legal/terms/page.tsx src/app/legal/privacy/page.tsx src/app/legal/terms/page.test.tsx src/app/legal/privacy/page.test.tsx
git commit -m "feat(settings): add legal policy routes"
```

### Task 2: Add feedback page with submit contract (TDD)

**Files:**
- Create: `src/app/feedback/page.tsx`
- Create: `src/app/feedback/page.test.tsx`

**Step 1: Write failing tests**

```tsx
expect(screen.getByRole("heading", { name: "意见反馈" })).toBeInTheDocument();
fireEvent.click(screen.getByRole("button", { name: "提交反馈" }));
expect(screen.getByText("反馈内容不能为空。"))
```

**Step 2: Run test in RED**

Run: `pnpm exec vitest src/app/feedback/page.test.tsx`  
Expected: FAIL.

**Step 3: Implement minimal page logic**

- controlled textarea + optional contact field
- submit validation and local success message

**Step 4: Re-run to GREEN**

Run: `pnpm exec vitest src/app/feedback/page.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/feedback/page.tsx src/app/feedback/page.test.tsx
git commit -m "feat(settings): add feedback route and submit flow"
```

### Task 3: Wire links from settings page

**Files:**
- Modify: `src/app/settings/page.tsx`
- Modify: `src/app/settings/page.test.tsx`

**Step 1: Add failing assertions**

```tsx
expect(screen.getByRole("link", { name: "用户协议" })).toHaveAttribute("href", "/legal/terms");
expect(screen.getByRole("link", { name: "隐私政策" })).toHaveAttribute("href", "/legal/privacy");
expect(screen.getByRole("link", { name: "意见反馈" })).toHaveAttribute("href", "/feedback");
```

**Step 2: Run test to confirm RED**

Run: `pnpm exec vitest src/app/settings/page.test.tsx`  
Expected: FAIL.

**Step 3: Implement minimal wiring**

- add `next/link` usage in settings legal and other tabs

**Step 4: Re-run test to GREEN**

Run: `pnpm exec vitest src/app/settings/page.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/app/settings/page.tsx src/app/settings/page.test.tsx
git commit -m "feat(settings): wire legal and feedback links"
```

### Task 4: Governance update + full verification

**Files:**
- Modify: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`

**Step 1: Update audit document**

- add legal/feedback routes to extended ops surfaces
- add evidence file paths

**Step 2: Run full verification**

Run:

```bash
pnpm exec vitest src/app/legal/terms/page.test.tsx src/app/legal/privacy/page.test.tsx src/app/feedback/page.test.tsx src/app/settings/page.test.tsx
pnpm exec tsc --noEmit
bash scripts/ci/frontend_final_gate.sh
```

Expected: all PASS.

**Step 3: Commit**

```bash
git add docs/governance/FRONTEND-COMPLETENESS-AUDIT.md
git commit -m "docs(governance): add legal and feedback route coverage"
```
