# Live E2E OTP Retry Design

## Context

`frontend_live_e2e_interactive.sh` currently requests OTP once and verifies once in token mode. If user input is delayed or token expires, the script exits immediately, requiring a full rerun.

Observed repeated failures:
- `Token has expired or is invalid`

## Goal

Make interactive live E2E resilient to OTP expiry by auto-resending and re-prompting inside the same script run.

## Options

1. Keep current one-shot behavior.
- Pros: simple.
- Cons: high operator friction; repeated reruns.

2. Retry only Playwright run without re-verifying OTP.
- Pros: small change.
- Cons: does not solve expired OTP root cause.

3. Add verify-and-resend loop in interactive script (recommended).
- Pros: directly addresses expiry; fewer manual reruns.
- Cons: moderate shell flow complexity.

## Decision

Use option 3 for token mode in `frontend_live_e2e_interactive.sh`:

- Add bounded verify attempts (`max_verify_attempts`).
- On retryable verify failure (expired/invalid token), automatically send new OTP and re-prompt.
- On non-retryable failure, fail fast with clear message.

## Verification

- Contract test on script flow markers (loop + retry branch).
- Full frontend gate to ensure no side effects.
