# Phone OTP Auth Design

## Context

- PRD requires parent login via phone + SMS code.
- Current frontend auth page uses email/password and conflicts with PRD.
- Backend user identity model `users.id -> auth.users.id` remains valid and does not require schema rewrite.

## Decision

- Replace `/auth` flow with Supabase phone OTP:
  - Step 1: send SMS code with `signInWithOtp({ phone })`
  - Step 2: verify code with `verifyOtp({ phone, token, type: "sms" })`
- Keep existing manual runtime token + child_id panel for integration debugging.
- Update live E2E env contract and docs from email/password to phone/otp.

## Non-goals

- No fallback email/password login.
- No database schema migration in this change set.
- No provider-side SMS gateway setup automation (still configured in Supabase dashboard).

## Risks and Mitigations

- Risk: Supabase project SMS provider not configured -> Mitigation: clear runtime error message on send/verify.
- Risk: Live E2E flaky due OTP expiry -> Mitigation: require manual `E2E_LIVE_OTP` value at run time and keep test minimal.

## Verification

- Unit: auth page renders phone OTP controls.
- Unit: live e2e config parser validates new env keys.
- Build/lint/typecheck/test pass.
