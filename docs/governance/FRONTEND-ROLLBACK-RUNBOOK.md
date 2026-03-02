# Frontend Rollback Runbook

## Trigger Conditions

- frontend final gate regression (`bash scripts/ci/frontend_final_gate.sh` fails)
- parent e2e journey regression in staging-like environment
- critical production UI outage after deployment

## Rollback Procedure

1. Identify last known good frontend commit SHA.
2. Redeploy frontend with last known good revision.
3. Re-run strict checks:
   - `bash scripts/ci/frontend_final_gate.sh`
   - `pnpm playwright test tests/e2e/parent-weekly-journey.spec.ts tests/e2e/parent-dashboard-followup.spec.ts`
4. Update `docs/governance/FRONTEND-RELEASE-RECORD.md` with rollback evidence.
5. Notify backend release owner for cross-repo handshake revalidation.

## Ownership

| role | owner |
|---|---|
| frontend engineering | 叶明君 |
| operations | 叶明君 |
| product | 叶明君 |
