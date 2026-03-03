# StarPath Frontend

## Runtime Overview

This repo is the Phase 5 user-facing frontend for StarPath roles:

- parent: `/chat`, `/dashboard`
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

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Runtime Auth and Child Context

1. Open `/auth`.
2. Sign in with Supabase email/password.
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
