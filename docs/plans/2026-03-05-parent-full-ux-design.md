# 2026-03-05 Parent Full UX Design

## 1. Context

This design is for the next frontend refactor wave under Harness Engineering governance:

- Visual baseline: **strictly align with `docs/prototype_v2`** (13 parent pages).
- Delivery scope priority:
  1. complete parent business chain (main + key exceptions),
  2. then expand to phase-3 full-role operations.
- Evidence source: Playwright screenshot audit generated on 2026-03-05.

Audit artifacts:

- Current UI: `artifacts/ui-audit/2026-03-05/current`
- Prototype reference: `artifacts/ui-audit/2026-03-05/prototype`

## 2. Goals and Non-Goals

### Goals

1. Make parent flow production-usable for key business chain:
   - auth/register -> create child -> assessment -> training advice -> record -> dashboard/report.
2. Enforce runtime governance before page access:
   - unauthenticated and no-child states must be guarded consistently.
3. Align page structure and interaction patterns with prototype_v2.
4. Add missing high-value pages not in prototype:
   - `/children`, `/children/[id]/edit`, `/auth/session-expired`, `/sync-center`, `/notifications`, `/data-consent`.

### Non-Goals (this phase)

1. Full redesign of information architecture.
2. New backend domain models.
3. Advanced personalization/recommendation ranking.

## 3. Runtime State Model and Route Governance

Define shared runtime states for all parent pages:

- `S0`: not authenticated.
- `S1`: authenticated but no active child profile.
- `S2`: authenticated with active child profile.

### Guard matrix

- If `S0`: protected pages redirect to `/auth`.
- If `S1`: protected business pages redirect to `/create-child`.
- If `S2`: access granted.

Protected business pages:

- `/chat`
- `/dashboard`
- `/journey`
- `/assessment`
- `/training-advice`
- `/voice-record`
- `/home-guide`
- `/card-fullscreen`
- `/training-weekly`
- `/analysis-report`
- `/training-detail`

## 4. Prototype Alignment Decisions (13 pages)

### A. High-alignment (minor polish)

- `/quick-menu`
- `/settings`
- `/create-child`
- `/assessment`

Action: keep structure, adjust typography/spacing/status behavior where needed.

### B. Medium deviation (interaction/visual cleanup)

- `/welcome`
- `/auth`
- `/chat`

Action:

- strengthen first-screen hierarchy,
- reduce debug/secondary distractions in default flow,
- re-balance chat quick actions and composer zones.

### C. Large deviation (rebuild to prototype behavior)

- `/home-guide`
- `/voice-record`
- `/training-weekly`
- `/analysis-report`
- `/training-detail`
- `/card-fullscreen`

Action:

- rebuild as prototype-first layouts,
- preserve existing AI/data hooks,
- add clear loading/error/empty recovery states.

## 5. Missing Pages to Add (Full Package)

1. `/children`
   - child list, active child switch, create-child entry.
2. `/children/[id]/edit`
   - editable profile + diagnosis/intervention fields.
3. `/auth/session-expired`
   - unified 401/session expiry recovery.
4. `/sync-center`
   - failed task retry center (assessment/record/nickname/AI calls).
5. `/notifications`
   - training reminders, assessment reminders, collaboration messages.
6. `/data-consent`
   - data purpose, permission scope, revoke entry.

## 6. Business Chain Definition (Parent)

Primary chain:

1. OTP login/register (`/auth`)
2. child profile creation (`/create-child`)
3. assessment submission (`/assessment`)
4. AI training advice (`/training-advice`)
5. training/behavior record (`/voice-record`)
6. dashboard and reports (`/dashboard`, `/analysis-report`, `/training-detail`)

Required transition guarantees:

- each step has success state and next action CTA,
- each step has in-page failure reason + retry,
- each step has clear back-navigation.

## 7. Exception Handling Contract (Key Exceptions)

Must be implemented and testable:

1. OTP expired/invalid.
2. auth session expired.
3. missing/invalid child context.
4. orchestrator timeout.
5. db write failure.
6. permission denied.

For every exception:

- user-facing Chinese error message,
- retry button,
- fallback navigation target.

## 8. AI Integration Contract (No Regression)

Keep existing module contracts:

- `chat_casual`
- `assessment`
- `training_advice`
- `training_record`
- `dashboard`

Do not remove current fallback behavior:

- chat/dashboard model timeout fallback in edge functions,
- page-level fallback messaging for token/context failures.

## 9. Verification and Evidence

### Automated checks

1. Unit/component tests for new guard and page state transitions.
2. Playwright E2E for:
   - parent main chain,
   - session-expired recovery,
   - sync-center retry success,
   - multi-child switch consistency.
3. Visual evidence run:
   - regenerate screenshot pair set (`current` vs `prototype`) before sign-off.

### Sign-off output

- Updated coverage matrix + completeness audit.
- Updated release record with parent UX wave evidence.

## 10. Rollout Strategy

1. Wave 1: parent chain completion + prototype parity + missing pages.
2. Wave 2: phase-3 full-role expansion (doctor/teacher/org-admin parity).

Gate condition to enter Wave 2:

- Wave 1 E2E green,
- key exception cases green,
- manual product sign-off complete.

