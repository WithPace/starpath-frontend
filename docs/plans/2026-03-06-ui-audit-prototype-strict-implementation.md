# UI Audit Prototype Strict Gate Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enforce strict prototype-source mapping in frontend UI audit and eliminate silent fallback false positives.

**Architecture:** Enhance shell CI script with explicit source validation plus prototype rendering pipeline (PNG copy or HTML screenshot render). Keep compatibility via an explicit override env and validate behavior with governance shell tests.

**Tech Stack:** Bash, Node.js (Playwright runtime), Next.js repo governance shell tests.

### Task 1: Add RED governance test for strict missing mapping

**Files:**
- Create: `tests/governance/test_frontend_ui_audit_strict_mapping.sh`

**Step 1: Write the failing test**
- Create a temp prototype source dir with one page intentionally missing.
- Run script in mock mode with strict enabled.
- Assert command fails and output contains `missing prototype source mapping`.

**Step 2: Run test to verify it fails**
Run: `bash tests/governance/test_frontend_ui_audit_strict_mapping.sh`
Expected: FAIL because current script does not enforce strict mapping in mock mode.

**Step 3: Commit**
```bash
git add tests/governance/test_frontend_ui_audit_strict_mapping.sh
git commit -m "test(governance): add strict prototype mapping red test"
```

### Task 2: Implement strict mapping + HTML prototype rendering

**Files:**
- Modify: `scripts/ci/frontend_ui_audit_screenshots.sh`

**Step 1: Minimal implementation**
- Add envs:
  - `UI_AUDIT_STRICT_PROTOTYPE` (default `1`)
  - `UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK` (default `0`)
- Add validation function over page list (`.png` or `.html` exists).
- Add Node renderer for prototype HTML -> PNG.
- Update copy phase to:
  - copy PNG if exists
  - render HTML if exists
  - fallback copy only when override enabled
  - otherwise fail (defensive)

**Step 2: Run RED test to GREEN**
Run: `bash tests/governance/test_frontend_ui_audit_strict_mapping.sh`
Expected: PASS.

### Task 3: Update existing artifact contract test fixture

**Files:**
- Modify: `tests/governance/test_frontend_ui_audit_artifacts.sh`

**Step 1: Adapt fixture**
- Provide temp prototype source dir with all 13 html files.
- Execute script in mock mode with strict enabled and provided source dir.

**Step 2: Verify test passes**
Run: `bash tests/governance/test_frontend_ui_audit_artifacts.sh`
Expected: PASS.

### Task 4: Governance docs update

**Files:**
- Modify: `docs/governance/FRONTEND-UX-DELTA-2026-03-05.md`
- Modify: `docs/governance/FRONTEND-GO-LIVE-CHECKLIST.md`

**Step 1: Document behavior**
- Remove outdated known-gap statement about silent fallback.
- Add strict mapping requirement and override env semantics.

**Step 2: Validate docs render and references are accurate**
Run: `rg -n "UI_AUDIT_STRICT_PROTOTYPE|UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK|prototype source" docs/governance -S`
Expected: references present and consistent.

### Task 5: Full verification and merge prep

**Files:**
- Modify (if needed): none

**Step 1: Run focused governance tests**
Run:
```bash
bash tests/governance/test_frontend_ui_audit_artifacts.sh
bash tests/governance/test_frontend_ui_audit_strict_mapping.sh
```
Expected: PASS.

**Step 2: Run full frontend gate**
Run: `bash scripts/ci/frontend_final_gate.sh`
Expected: PASS.

**Step 3: Commit implementation batch**
```bash
git add scripts/ci/frontend_ui_audit_screenshots.sh \
  tests/governance/test_frontend_ui_audit_artifacts.sh \
  tests/governance/test_frontend_ui_audit_strict_mapping.sh \
  docs/governance/FRONTEND-UX-DELTA-2026-03-05.md \
  docs/governance/FRONTEND-GO-LIVE-CHECKLIST.md \
  docs/plans/2026-03-06-ui-audit-prototype-strict-design.md \
  docs/plans/2026-03-06-ui-audit-prototype-strict-implementation.md
git commit -m "fix(governance): enforce strict prototype mapping in ui audit"
```
