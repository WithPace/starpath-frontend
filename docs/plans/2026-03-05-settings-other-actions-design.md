# Settings Other Actions Design

## Context

- Date: 2026-03-05
- Scope: productize remaining `settings -> other` entries
- Current gap:
  - `关于星途` / `升级 VIP` / `注销账号` are static bullet texts.
  - no dedicated route surfaces and no test evidence for this chain.

## Goal

1. Add routable pages for the three settings-other actions.
2. Link settings entries to these pages.
3. Provide clear user-visible action outcomes (especially account closure request).

## Approaches

### A. Dedicated routes with lightweight MVP actions (Recommended)

- Create `/about`, `/vip`, `/account-close` pages.
- Keep functionality MVP-level but actionable.

Pros:
- deep-linkable, testable, maintainable
- aligns with existing route-per-capability architecture

Cons:
- adds 3 routes/files and tests

### B. Keep inline settings tab, add modal actions

Pros:
- fewer routes

Cons:
- hard to test, poor navigation continuity

### C. Placeholder links to external pages

Pros:
- fastest

Cons:
- weak product closure; no in-app governance evidence

## Chosen Design (A)

### 1. Add 3 pages

- `/about`: product mission, capability summary, version info
- `/vip`: feature comparison + upgrade CTA feedback
- `/account-close`: risk reminder + two-step confirm + local confirmation message

All pages use `ParentShell` and include `返回设置` link.

### 2. Wire settings links

In `src/app/settings/page.tsx`, replace static list items with links:
- `关于星途` -> `/about`
- `升级 VIP` -> `/vip`
- `注销账号` -> `/account-close`

### 3. Verification

- Unit tests for each new page.
- Update settings page test for new links.
- Full `frontend_final_gate.sh` evidence.

## Risks & Mitigation

- Risk: users may interpret account close as immediate destructive action.
- Mitigation: copy explicitly marks as request flow and requires explicit confirm.

## Acceptance

1. three routes are accessible and render core sections.
2. settings other tab has the three links.
3. account-close flow requires confirmation and displays result.
4. full frontend gate passes.
