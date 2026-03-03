# OTP First Login Registration Design

## Context

- Parent auth flow already uses phone OTP via Supabase.
- Current gap: "首次验证码登录 = 注册" behavior was implicit (only auth session), not explicit in product logic.
- This caused inconsistent onboarding state when first-time users had no `public.users` row yet.

## Goal

- Make first OTP login explicitly complete registration initialization:
  - ensure `public.users` upsert for current session user
  - detect whether user has active parent-child links
  - route first-login users to child creation flow

## Non-goals

- No schema migration.
- No role-matrix expansion in this pass.
- No change to SMS provider wiring (Alibaba Cloud SMS stays as Supabase Auth SMS channel).

## Approaches

### A. Backend trigger registration
- Pros: fully centralized.
- Cons: requires DB-level trigger/governance change.

### B. Frontend post-OTP registration handshake (Chosen)
- Pros: fastest, explicit, testable in current architecture.
- Cons: relies on frontend path execution after OTP verify.

### C. Lazy registration only when creating child
- Pros: minimal changes.
- Cons: does not satisfy "first login equals registration".

## Chosen Design

1. Add registration helper in `parent-data-access`:
   - read current session user
   - upsert `public.users`
   - count active parent links from `care_teams`
2. In `/auth` OTP verify success path:
   - run registration helper
   - if first login, redirect to `/create-child`
   - if returning user, continue normal `next` route
3. Add unit tests for registration helper edge cases.
