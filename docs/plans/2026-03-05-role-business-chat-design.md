# Role Business Chat Design

## Context

- Date: 2026-03-05
- Scope: `/doctor/chat` and `/teacher/chat` businessization (parent chat保持现有流程)
- Current gap:
  - `RoleChatPage` currently uses one generic `ChatFlow` copy and generic quick prompts.
  - Existing E2E for doctor/teacher only checks auth redirect, not in-route business behavior.
  - AI coverage matrix has no explicit doctor/teacher chat rows.

## Goal

1. Keep existing orchestrator chat request path and auth/child guard behavior unchanged.
2. Add role-specific business context to doctor/teacher chat UI.
3. Add deterministic non-live automation evidence for doctor/teacher chat business panels.

## Approaches

### A. Shared role business layer (Recommended)

- Add `RoleChatBusinessPanel` for doctor/teacher under shared `RoleChatPage`.
- Extend `ChatFlow` to accept role-specific quick prompts.
- Keep parent chat behavior backward compatible.

Trade-offs:
- Pros: minimal surface change, low regression risk, reusable architecture.
- Cons: less visual freedom than fully separated pages.

### B. Split doctor/teacher chat pages into independent implementations

- Build dedicated page component for each role.

Trade-offs:
- Pros: maximum customization for each role.
- Cons: duplicates runtime guard/send logic, higher maintenance.

### C. Prompt-only enhancement without business panel

- Keep current UI; only replace quick prompts by role.

Trade-offs:
- Pros: smallest code change.
- Cons: does not satisfy businessization target (insufficient operational guidance).

## Chosen Design (A)

### 1. Add role chat business panel component

- Create `src/components/chat/role-chat-business-panel.tsx`
- Props:
  - `role`
  - `pending`
- Render:
  - doctor panel: triage chat objectives + follow-up output checklist
  - teacher panel: classroom coaching objectives + home-school sync checklist
  - parent fallback: minimal neutral panel

### 2. Add role-aware quick prompts in chat flow

- Update `src/components/chat/chat-flow.tsx`
- New prop: `quickPrompts?: string[]`
- Existing behavior remains when prop not provided.
- In `RoleChatPage`, build role-specific quick prompt presets:
  - doctor: 风险分诊、复诊建议、家长沟通要点
  - teacher: 课堂目标、家庭作业建议、每周反馈总结
  - parent: keep existing prompts

### 3. Integrate in shared role chat page

- Update `src/components/chat/role-chat-page.tsx`
- Mount `<RoleChatBusinessPanel />` above `<ChatFlow />`
- Pass role quick prompts to `ChatFlow`.

### 4. Verification coverage

- Unit:
  - `src/components/chat/role-chat-business-panel.test.tsx`
  - `src/components/chat/chat-flow.test.tsx` (add role quick prompts assertion)
- E2E non-live:
  - `tests/e2e/role-chat-business-panels.spec.ts`
  - setup manual runtime in `/auth`, then verify doctor/teacher chat business panel headings.

### 5. Governance sync

- Update `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- Update `docs/governance/FRONTEND-AI-COVERAGE-MATRIX.md`

## Risks & Mitigation

- Risk: role chat and parent chat share component; changing prompt API may break parent tests.
- Mitigation: keep default `quickPrompts` fallback and add targeted unit test.

- Risk: role routes need child context; E2E may redirect if missing.
- Mitigation: use `/auth` manual token + child id pre-setup.

## Acceptance

1. `/doctor/chat` shows doctor business panel + doctor prompts.
2. `/teacher/chat` shows teacher business panel + teacher prompts.
3. Parent chat quick prompts and flow remain compatible.
4. Unit + non-live E2E + `frontend_final_gate.sh` pass.
