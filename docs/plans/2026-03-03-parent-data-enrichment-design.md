# Parent Data Enrichment Design (Phase 4 Deepening)

## Context

- Parent 13-page routes are already online in `starpath-frontend`.
- Several core pages are still static/demo-heavy and do not fully reflect live business data:
  - `/create-child`
  - `/quick-menu`
  - `/training-weekly`
  - `/training-detail`
  - `/analysis-report`
- Backend schema and RLS are available in Supabase for these flows (`children`, `care_teams`, `children_medical`, `training_sessions`, `life_records`, `children_profiles`).

## Goal

- Upgrade key parent pages from "static prototype" to "production-like data workflow":
  - real child creation write path
  - real training/life/profile reads
  - safe fallback content when no data or permission limits exist
- Keep current governance-first constraints and avoid breaking existing routes/tests.

## Non-goals

- No backend schema migration in this frontend pass.
- No redesign of doctor/teacher/org-admin pages.
- No change to login method policy in this pass.

## Approaches Considered

### A. Full live-only rewrite

- Pros: no demo fallback, pure production data.
- Cons: brittle when early accounts lack complete records; weaker UX during cold-start.

### B. Hybrid live-data + graceful fallback (Chosen)

- Pros: keeps product stable for first-time users and incomplete datasets; practical rollout.
- Cons: requires clear separation between "live summary" and "fallback summary".

### C. Keep static pages and only polish visuals

- Pros: fastest.
- Cons: does not satisfy "可上线程度的业务执行链路" expectations.

## Chosen Design

1. Add data transformation utilities for parent pages:
   - training stats aggregation
   - day-grouping for session details
   - domain-level extraction from `children_profiles.domain_levels`
2. Add data-access helpers for parent pages:
   - `create child` multi-step write:
     - ensure `users` row exists
     - insert into `children`
     - insert self-member row into `care_teams` as `parent`
     - optional initialize `children_medical`
   - read helpers for weekly/detail/report/quick summary
3. Keep page-level UX explicit:
   - loading state
   - error state (with reason text)
   - empty state fallback copy
4. Keep current visual shell and route structure unchanged to reduce regression risk.

## Data Contracts

- `children` write uses: `nickname`, optional `birth_date`, `created_by`.
- `care_teams` write uses: `user_id`, `child_id`, `role=parent`, `status=active`.
- `children_medical` write uses: `child_id`, optional `diagnosis_level`.
- `training_sessions` read fields: `session_date`, `target_skill`, `duration_minutes`, `success_rate`, `notes`.
- `life_records` read fields: `type`, `summary`, `occurred_at`.
- `children_profiles` read fields: `domain_levels`, `overall_summary`, `assessed_at`.

## Error and Safety Handling

- Missing Supabase env/client: show downgraded warning and fallback content.
- Unauthenticated user: block writes and display actionable hint.
- Child not selected: keep read pages usable with fallback guidance.
- DB write partial failure: surface error, do not fake success.

## Verification Strategy

- TDD first for utility behavior and parsing.
- Targeted integration-like unit tests for create flow orchestration.
- Keep existing prototype rendering tests green.
- Run full frontend gate before completion:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm test:e2e`
