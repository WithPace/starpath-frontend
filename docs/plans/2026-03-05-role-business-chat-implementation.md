# Role Business Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Businessize doctor and teacher chat pages with role-specific operational guidance and prompt presets while keeping existing orchestrator flow stable.

**Architecture:** Keep `RoleChatPage` as shared runtime/auth/send shell. Add a small `RoleChatBusinessPanel` presentational component keyed by role and extend `ChatFlow` with optional role quick prompts. Add non-live E2E evidence by setting manual runtime in `/auth` and asserting role-specific panel headings on role chat routes.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Playwright, pnpm.

### Task 1: Add role chat business panel component via TDD (RED -> GREEN)

**Files:**
- Create: `src/components/chat/role-chat-business-panel.test.tsx`
- Create: `src/components/chat/role-chat-business-panel.tsx`

**Step 1: Write failing tests**

```tsx
expect(screen.getByRole("heading", { name: "医生对话执行重点" })).toBeInTheDocument();
expect(screen.getByRole("heading", { name: "教师对话执行重点" })).toBeInTheDocument();
```

**Step 2: Run test to confirm RED**

Run: `pnpm exec vitest src/components/chat/role-chat-business-panel.test.tsx`  
Expected: FAIL (module missing).

**Step 3: Implement minimal panel**

- export `RoleChatBusinessPanel({ role, pending })`
- render deterministic doctor/teacher checklists
- render neutral fallback for parent role

**Step 4: Run test to confirm GREEN**

Run: `pnpm exec vitest src/components/chat/role-chat-business-panel.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/chat/role-chat-business-panel.tsx src/components/chat/role-chat-business-panel.test.tsx
git commit -m "feat(role-chat): add role business chat panel"
```

### Task 2: Extend chat flow quick prompts and integrate in role chat page

**Files:**
- Modify: `src/components/chat/chat-flow.tsx`
- Modify: `src/components/chat/chat-flow.test.tsx`
- Modify: `src/components/chat/role-chat-page.tsx`

**Step 1: Add failing tests for prompt override**

```tsx
render(<ChatFlow quickPrompts={["A", "B"]} ... />);
expect(screen.getByRole("button", { name: "A" })).toBeInTheDocument();
```

**Step 2: Run test to confirm RED**

Run: `pnpm exec vitest src/components/chat/chat-flow.test.tsx`  
Expected: FAIL (prop unsupported).

**Step 3: Minimal implementation**

- Add optional `quickPrompts?: string[]` prop
- Default to existing prompt list when prop not provided
- In `RoleChatPage`, map role prompt presets and pass into `ChatFlow`
- Mount `RoleChatBusinessPanel` above chat flow

**Step 4: Run tests to confirm GREEN**

Run:
`pnpm exec vitest src/components/chat/chat-flow.test.tsx src/components/chat/role-chat-business-panel.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/chat/chat-flow.tsx src/components/chat/chat-flow.test.tsx src/components/chat/role-chat-page.tsx
git commit -m "feat(role-chat): add role prompt presets and panel integration"
```

### Task 3: Add non-live E2E evidence for role chat business panels

**Files:**
- Create: `tests/e2e/role-chat-business-panels.spec.ts`

**Step 1: Write E2E flow**

- go `/auth`
- fill manual token + child id
- save runtime config
- visit `/doctor/chat` and assert `医生对话执行重点`
- visit `/teacher/chat` and assert `教师对话执行重点`

**Step 2: Run E2E**

Run: `pnpm playwright test tests/e2e/role-chat-business-panels.spec.ts`  
Expected: PASS.

**Step 3: Commit**

```bash
git add tests/e2e/role-chat-business-panels.spec.ts
git commit -m "test(e2e): cover role chat business panels"
```

### Task 4: Governance sync and full verification

**Files:**
- Modify: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- Modify: `docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md`

**Step 1: Update governance docs**

- add role chat business evidence rows
- add doctor/teacher chat AI touchpoints in matrix

**Step 2: Run verification commands**

Run:

```bash
pnpm exec vitest src/components/chat/role-chat-business-panel.test.tsx src/components/chat/chat-flow.test.tsx
pnpm playwright test tests/e2e/role-chat-business-panels.spec.ts
pnpm exec tsc --noEmit
bash scripts/ci/frontend_final_gate.sh
```

Expected: all PASS.

**Step 3: Commit**

```bash
git add docs/governance/FRONTEND-COMPLETENESS-AUDIT.md docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md
git commit -m "docs(governance): add role chat business coverage evidence"
```
