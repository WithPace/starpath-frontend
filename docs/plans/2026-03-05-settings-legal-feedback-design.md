# Settings Legal Feedback Design

## Context

- Date: 2026-03-05
- Scope: complete settings sub-routes for legal information and feedback loop
- Current gap:
  - `/settings` shows legal/feedback entries as plain list items, not navigable pages.
  - user-facing policy and feedback surfaces are not routable in frontend route map.

## Goal

1. Make legal and feedback entries in settings actionable.
2. Add production-ready static legal pages and a lightweight feedback submission page.
3. Keep parent app style consistent with existing `ParentShell` design language.

## Approaches

### A. Add dedicated routes + link from settings (Recommended)

- Create `/legal/terms`, `/legal/privacy`, `/feedback` pages.
- Replace settings list text with route links.

Trade-offs:
- Pros: explicit IA, testable routes, low coupling.
- Cons: adds three new files/routes.

### B. Keep single settings page and expand inline sections

- Render legal text and feedback form directly in settings tabs.

Trade-offs:
- Pros: fewer routes.
- Cons: settings page becomes heavy; hard to deep-link and test.

### C. External links only

- Link legal/feedback to external placeholders.

Trade-offs:
- Pros: fastest.
- Cons: poor in-app continuity, not suitable for productized MVP.

## Chosen Design (A)

### 1. New pages

- `src/app/legal/terms/page.tsx`
- `src/app/legal/privacy/page.tsx`
- `src/app/feedback/page.tsx`

Each page uses `ParentShell` with clear heading, concise sections, and back navigation to `/settings`.

### 2. Settings linkage

- Update legal tab entries to clickable links:
  - 用户协议 -> `/legal/terms`
  - 隐私政策 -> `/legal/privacy`
- Update other tab entries to include:
  - 意见反馈 -> `/feedback`

### 3. Feedback behavior

- Minimal local submission flow:
  - input text area
  - optional contact input
  - submit button
  - visible success/failure message contract
- no backend persistence in this wave (explicitly labeled as MVP local confirmation).

### 4. Verification

- Unit tests for each new page rendering and submission result.
- Update `settings` page test to assert legal/feedback links exist.
- Optional non-live E2E can be added in next wave; this wave keeps unit-level evidence + full gate.

## Risks & Mitigation

- Risk: legal content overlong impacts maintainability.
- Mitigation: keep concise summary sections; extract to markdown in future wave if needed.

- Risk: users expect persisted feedback.
- Mitigation: UI message explicitly states “已记录本地确认，后台接入待下一阶段”.

## Acceptance

1. `/legal/terms`, `/legal/privacy`, `/feedback` routes render correctly.
2. `/settings` has clickable links to those routes.
3. Feedback page supports submit action with user-visible confirmation.
4. Unit tests + `frontend_final_gate.sh` pass.
