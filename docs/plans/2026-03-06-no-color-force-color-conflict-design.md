# CI No-Color Conflict Warning Design

## Context

Current non-live gate runs still emit repeated Node warnings:

`Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.`

This warning appears across Playwright web server and worker processes, adding log noise and diluting debugging signal.

## Goal

Keep colorized Playwright output while eliminating NO_COLOR/FORCE_COLOR conflict warnings in CI scripts.

## Options

1. Ignore warning (no change).
- Pros: zero risk.
- Cons: noisy logs remain.

2. Disable `FORCE_COLOR` globally.
- Pros: removes warning.
- Cons: loses useful colored output.

3. Keep `FORCE_COLOR`, unset `NO_COLOR` only when both are set (recommended).
- Pros: minimal change, preserves color output, removes warning.
- Cons: small script-level env branching.

## Decision

Use option 3 in CI entry scripts that launch Playwright:

- `scripts/ci/frontend_final_gate.sh`
- `scripts/ci/frontend_live_e2e.sh`

Add contract tests to prevent regression.
