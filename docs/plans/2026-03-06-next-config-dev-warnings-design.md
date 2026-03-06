# Next Config Dev Warnings Design

## Context

Current frontend gate logs show recurring Next.js dev warnings:

1. Cross-origin warning from `127.0.0.1` to `/_next/*` suggesting `allowedDevOrigins` config.
2. Workspace root inference warning due multiple lockfiles when running from git worktrees, suggesting `turbopack.root` config.

These warnings increase signal noise in CI/e2e diagnostics and can hide real runtime regressions.

## Goal

Stabilize development and e2e runtime logs by explicitly configuring:

- `allowedDevOrigins` for local host variants.
- `turbopack.root` to project root.

## Options

1. Ignore warnings.
- Pros: zero code change.
- Cons: noisy logs remain; harder incident triage.

2. Set only `allowedDevOrigins`.
- Pros: removes one warning class.
- Cons: lockfile/root warning remains.

3. Set both `allowedDevOrigins` and `turbopack.root` (recommended).
- Pros: removes both known warning classes with minimal config.
- Cons: small config coupling to local root path.

## Decision

Use option 3 with minimal explicit config in `next.config.ts`.

- `allowedDevOrigins` includes localhost + 127.0.0.1 with wildcard ports.
- `turbopack.root` uses absolute project root via `__dirname`.

## Verification

- Add a contract test asserting config includes both fields.
- Run targeted e2e route test to confirm no config regression.
- Run full frontend gate before merge.
