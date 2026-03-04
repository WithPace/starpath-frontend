# StarPath Frontend

## Runtime Overview

This repo is the Phase 5 user-facing frontend for StarPath roles:

- parent: `/chat`, `/dashboard`, `/journey` (assessment -> training_advice -> training -> training_record)
- parent prototype routes:
  - `/welcome`
  - `/quick-menu`
  - `/settings`
  - `/create-child`
  - `/card-fullscreen`
  - `/assessment`
  - `/home-guide`
  - `/voice-record`
  - `/training-weekly`
  - `/analysis-report`
  - `/training-detail`
- doctor: `/doctor/chat`, `/doctor/dashboard`
- teacher: `/teacher/chat`, `/teacher/dashboard`
- org admin: `/org-admin/dashboard`, `/org-admin/members`
- auth/config: `/auth`

## Environment

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

If env is missing, pages degrade gracefully and show runtime warnings.

Go-live references:

- `docs/governance/FRONTEND-GO-LIVE-CHECKLIST.md`
- `docs/governance/FRONTEND-COMPLETENESS-AUDIT.md`
- `docs/governance/FRONTEND-ROLLBACK-RUNBOOK.md`

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Playwright MCP

This repo now includes local Playwright MCP integration.

1. Verify installation:

```bash
pnpm mcp:playwright:help
```

2. Start MCP server (stdio):

```bash
pnpm mcp:playwright
```

Client config can reference `.mcp.json` in repo root.

## Runtime Auth and Child Context

1. Open `/auth`.
2. Enter phone number, send SMS code, and complete OTP sign-in.
3. Optionally set manual runtime token + child_id for integration debugging.
4. Open role pages and verify runtime context panel shows login/child selection.

## Quality Gate

```bash
bash scripts/ci/frontend_final_gate.sh
```

Gate includes:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm playwright test`

## Optional Live Integration E2E (Real Supabase)

To execute authenticated live business-chain test (not mock-only), set these env keys:

- `RUN_E2E_LIVE=1`
- `E2E_LIVE_PARENT_CHILD_ID`
- auth mode A (OTP):
  - `E2E_LIVE_PHONE` (E.164 format, example: `+8613800138000`)
  - `E2E_LIVE_OTP` (fresh SMS code for this run)
- auth mode B (token):
  - `E2E_LIVE_ACCESS_TOKEN`
- optional: `E2E_LIVE_CHAT_MESSAGE`
- optional: `E2E_LIVE_PARENT_NICKNAME` (used for settings nickname save assertion)
- optional: `E2E_LIVE_TRIGGER_OTP_SEND` (`1` means test will click "发送验证码"; default `0`)

Run:

```bash
bash scripts/ci/frontend_live_e2e.sh
```

Interactive (recommended for OTP freshness):

```bash
bash scripts/ci/frontend_live_e2e_interactive.sh
```

Or run full gate with live stage:

```bash
RUN_E2E_LIVE=1 bash scripts/ci/frontend_final_gate.sh
```
