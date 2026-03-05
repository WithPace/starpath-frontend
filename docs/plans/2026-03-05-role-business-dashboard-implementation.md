# Role Business Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver businessized dashboard panels for doctor/teacher/org-admin routes so each role gets operational next actions beyond generic cards.

**Architecture:** Keep `RoleDashboardPage` as the shared runtime/data orchestration shell, add one deterministic `RoleBusinessPanel` presentational component keyed by role, and mount it under existing `DashboardCards` to avoid disturbing current fetch/store flow.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Playwright, pnpm.

### Task 1: Add role business panel component tests first (TDD RED)

**Files:**
- Create: `src/components/cards/role-business-panel.test.tsx`
- Create: `src/components/cards/role-business-panel.tsx`

**Step 1: Write failing tests for three role variants**

```tsx
expect(screen.getByRole("heading", { name: "风险分诊待办" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "课堂执行清单" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "机构运营快照" })).toBeInTheDocument();
```

**Step 2: Run tests to confirm RED**

Run: `pnpm exec vitest src/components/cards/role-business-panel.test.tsx`  
Expected: FAIL (`role-business-panel` not found).

**Step 3: Implement minimal role panel**

- Export `RoleBusinessPanel` accepting `{ role, cards, loading, error }`
- Render role-specific heading + action checklist for:
  - `doctor`: triage queue / follow-up actions
  - `teacher`: class execution / home-school sync actions
  - `org_admin`: operational metrics / governance actions
- Keep deterministic fallback content when cards are empty or failed

**Step 4: Run tests to confirm GREEN**

Run: `pnpm exec vitest src/components/cards/role-business-panel.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/cards/role-business-panel.tsx src/components/cards/role-business-panel.test.tsx
git commit -m "feat(role): add role business dashboard panel"
```

### Task 2: Integrate panel into shared role dashboard page (TDD RED -> GREEN)

**Files:**
- Modify: `src/components/cards/role-dashboard-page.tsx`
- Create: `src/components/cards/role-dashboard-page.test.tsx`

**Step 1: Add failing integration test**

```tsx
expect(screen.getByRole("heading", { name: "风险分诊待办" })).toBeInTheDocument();
```

**Step 2: Run test in RED state**

Run: `pnpm exec vitest src/components/cards/role-dashboard-page.test.tsx`  
Expected: FAIL (panel not rendered yet).

**Step 3: Wire the component**

- Import `RoleBusinessPanel` into `RoleDashboardPage`
- Render panel below `<DashboardCards ... />`
- Pass through `role`, `cards`, `loading`, `error`

**Step 4: Re-run to GREEN**

Run: `pnpm exec vitest src/components/cards/role-dashboard-page.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/cards/role-dashboard-page.tsx src/components/cards/role-dashboard-page.test.tsx
git commit -m "feat(role): integrate business panel in role dashboard page"
```

### Task 3: Add non-live route evidence via Playwright

**Files:**
- Create: `tests/e2e/role-dashboard-business-panels.spec.ts`

**Step 1: Write E2E spec using manual runtime auth setup**

- `/auth` fill manual token + child id
- visit `/doctor/dashboard` assert `风险分诊待办`
- visit `/teacher/dashboard` assert `课堂执行清单`
- visit `/org-admin/dashboard` assert `机构运营快照`

**Step 2: Run E2E and stabilize**

Run: `pnpm playwright test tests/e2e/role-dashboard-business-panels.spec.ts`  
Expected: PASS.

**Step 3: Commit**

```bash
git add tests/e2e/role-dashboard-business-panels.spec.ts
git commit -m "test(e2e): cover role dashboard business panels"
```

### Task 4: Governance sync + final verification

**Files:**
- Modify: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- Modify: `docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md`

**Step 1: Update governance docs**

- Add business panel coverage evidence for doctor/teacher/org-admin dashboards
- Update AI/business flow mapping rows for role dashboards

**Step 2: Run verification gates**

Run:

```bash
pnpm exec vitest src/components/cards/role-business-panel.test.tsx src/components/cards/role-dashboard-page.test.tsx
pnpm playwright test tests/e2e/role-dashboard-business-panels.spec.ts
pnpm exec tsc --noEmit
bash scripts/ci/frontend_final_gate.sh
```

Expected: all PASS.

**Step 3: Commit**

```bash
git add docs/governance/FRONTEND-COMPLETENESS-AUDIT.md docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md
git commit -m "docs(governance): add role dashboard business panel evidence"
```
