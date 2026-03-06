# Frontend Go-Live Checklist

## 0. Scope

- Repo: `starpath-frontend`
- Goal: verify frontend release readiness against current Supabase backend and runtime auth chain.

## 1. Required Environment

Create and fill `.env.local` from `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

UI audit strict mapping variables:

- `UI_AUDIT_PROTOTYPE_SOURCE_DIR` (default `../07-SPath/docs/prototype_v2`, must contain `00..12` prototype sources)
- `UI_AUDIT_STRICT_PROTOTYPE` (default `1`, missing prototype source will fail gate)
- `UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK` (default `0`, set `1` only for emergency bypass)

Optional live-E2E keys (only when running real-environment checks):

- `RUN_E2E_LIVE=1`
- `E2E_LIVE_PHONE` (E.164 phone, used by OTP login)
- `E2E_LIVE_OTP` (fresh OTP for current run)
- `E2E_LIVE_PARENT_CHILD_ID` (child UUID accessible by current phone user)
- `E2E_LIVE_CHAT_MESSAGE` (optional custom message)
- `E2E_LIVE_PARENT_NICKNAME` (optional nickname for settings save assertion)

## 2. Release Command Sequence

Run in repo root:

```bash
pnpm install
pnpm lint
pnpm typecheck
pnpm test
bash tests/governance/test_frontend_ui_audit_artifacts.sh
pnpm build
pnpm test:e2e
```

If live verification is required:

```bash
RUN_E2E_LIVE=1 pnpm playwright test tests/e2e/live-parent-full-chain.spec.ts
```

## 3. Route Smoke Criteria

Parent core:
- `/auth`: OTP login succeeds and runtime panel is authenticated.
- `/chat`: message send returns assistant content, no `请求失败：`.
- `/dashboard`: cards rendered, no `看板加载失败：`.
- `/journey`: module run buttons visible and execute without runtime crash.

Parent prototype 13-page coverage:
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
- `/chat`
- `/dashboard`

Other roles:
- `/doctor/chat`, `/doctor/dashboard`
- `/teacher/chat`, `/teacher/dashboard`
- `/org-admin/dashboard`, `/org-admin/members`

## 4. Pass/Fail Gate

Go-live can proceed only when:

1. All commands in section 2 pass.
2. No blocking errors appear in smoke criteria pages.
3. Release evidence updated in `docs/governance/FRONTEND-RELEASE-RECORD.md`.
4. UI 审计工件可复现（`scripts/ci/frontend_ui_audit_screenshots.sh`）。
5. 严格模式下无原型映射缺失（除非显式设置 `UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK=1`）。

## 5. Rollback

If any go-live check fails after deployment, execute rollback using:

- `docs/governance/FRONTEND-ROLLBACK-RUNBOOK.md`
