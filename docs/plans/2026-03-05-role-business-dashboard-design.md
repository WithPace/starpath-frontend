# Role Business Dashboard Design

## Context

- Date: 2026-03-05
- Scope: Doctor / Teacher / Org Admin dashboard businessization
- Current issue: Three role dashboards reuse the same generic card rendering and lack role-specific operational view.

## Goal

1. Keep existing role dashboard architecture and orchestrator integration.
2. Add role-specific business panel per role with clear next actions.
3. Provide non-live automated evidence that these role business panels are visible and reachable.

## Design

### 1. Introduce role business panel component

- Add `src/components/cards/role-business-panel.tsx`
- Input:
  - `role`
  - current dashboard cards
  - loading/error states
- Output:
  - doctor panel: risk triage queue + recommended follow-up actions
  - teacher panel: classroom execution checklist + next class focus
  - org admin panel: operations snapshot + member governance CTA
- Fallback behavior:
  - when cards unavailable, show deterministic fallback business items (not blank).

### 2. Integrate into existing role dashboard page

- Modify `src/components/cards/role-dashboard-page.tsx`
- Keep existing `DashboardCards` unchanged.
- Render `RoleBusinessPanel` below generic cards.

### 3. Verification coverage

- Unit:
  - Add `src/components/cards/role-business-panel.test.tsx`
  - Verify each role displays its expected heading/action.
- E2E (non-live):
  - Add `tests/e2e/role-dashboard-business-panels.spec.ts`
  - Use `/auth` manual runtime setup then visit:
    - `/doctor/dashboard`
    - `/teacher/dashboard`
    - `/org-admin/dashboard`
  - Assert role business panel headings render.

## Risks

- Risk: role dashboards currently depend on runtime child context; missing child could hide downstream content.
- Mitigation: use manual runtime token + child id in E2E setup to keep route stable.

## Acceptance

1. All three role dashboards show role-specific business panel section.
2. Existing dashboard cards and runtime panel behavior do not regress.
3. Unit + E2E + `frontend_final_gate.sh` pass.
