# Frontend Final Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add executable live-path evidence and operator-ready release docs so frontend can pass go-live checks with clear smoke/rollback procedures.

**Architecture:** Keep current route/component architecture unchanged. Strengthen only three layers: live E2E assertions, readiness/go-live documentation, and explicit completeness checklist artifacts.

**Tech Stack:** Next.js App Router, TypeScript, Playwright, Vitest, pnpm.

### Task 1: Expand live parent full-chain E2E (TDD)

**Files:**
- Modify: `tests/e2e/live-parent-full-chain.spec.ts`
- Modify: `src/lib/runtime/live-e2e-config.ts`
- Modify: `src/lib/runtime/live-e2e-config.test.ts`

**Step 1: Write failing tests**

- Add config contract test for `E2E_LIVE_PARENT_NICKNAME`.
- Extend live spec with assertions for:
  - settings nickname save success text
  - home-guide visible dynamic section and no degrade/fail markers
  - card-fullscreen tab rendering and no degrade/fail markers

**Step 2: Run RED checks**

Run:
```bash
pnpm vitest run src/lib/runtime/live-e2e-config.test.ts
```
Expected: FAIL for missing new field contract.

**Step 3: Implement minimal production changes**

- Support new optional env field in live config reader.
- Update live E2E flow to use nickname fallback and new route smoke checks.

**Step 4: Re-run GREEN checks**

Run:
```bash
pnpm vitest run src/lib/runtime/live-e2e-config.test.ts
```
Expected: PASS.

### Task 2: Add go-live readiness documentation artifacts

**Files:**
- Create: `docs/governance/FRONTEND-GO-LIVE-CHECKLIST.md`
- Create: `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- Modify: `README.md`

**Step 1: Write docs**

- Checklist doc:
  - env keys and source-of-truth notes
  - command-by-command release sequence
  - per-route smoke pass criteria
  - rollback pointer
- Completeness audit:
  - parent 13-page mapping
  - core role routes mapping
  - test evidence mapping
- README:
  - link checklist/audit and updated live e2e env key list

**Step 2: Verify docs references**

Run:
```bash
rg "FRONTEND-GO-LIVE-CHECKLIST|FRONTEND-COMPLETENESS-AUDIT|E2E_LIVE_PARENT_NICKNAME" README.md docs/governance
```
Expected: references present.

### Task 3: Full verification gate

**Step 1: Execute full checks**

Run:
```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Expected: all commands pass (live suite skipped unless `RUN_E2E_LIVE=1`).

**Step 2: Commit**

Run:
```bash
git add docs README.md src/lib/runtime tests/e2e
git commit -m "feat(frontend): harden final go-live readiness and live-e2e coverage"
git push origin main
```
