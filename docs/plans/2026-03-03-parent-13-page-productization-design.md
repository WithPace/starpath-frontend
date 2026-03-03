# Parent 13-Page Productization Design

## Context

- Current frontend (`starpath-frontend`) is governance-first multi-role delivery baseline, not a full realization of prototype_v2 visual/interaction spec.
- Source-of-truth product prototype requires 13 parent pages (00-12) with coherent navigation and richer interaction patterns.
- Existing production chain (Supabase auth + orchestrator runtime + role routes + gates) must remain valid.

## Goals

- Deliver a productized parent experience aligned to prototype_v2 page matrix:
  - welcome, login, chat, quick menu, settings, create child, card fullscreen, assessment, home guide, voice record, weekly report, analysis report, training detail
- Keep current backend integration routes (`/chat`, `/dashboard`, `/journey`) usable.
- Preserve Harness governance quality gates and evidence-first workflow.

## Non-goals

- No backend schema change in this work package.
- No doctor/teacher/org_admin redesign in this iteration.
- No native Expo migration in this iteration (keep Next.js web implementation).

## Approaches

### Approach A: Replace existing role pages with prototype pages directly

- Pros: direct UX alignment for parent.
- Cons: high risk of breaking existing role-gate tests and runtime flows.

### Approach B (Chosen): Add full prototype route set + integrate with existing runtime/auth chain

- Pros: preserves current governance and contracts while adding product pages; can iterate page-by-page.
- Cons: temporary dual route surface exists.

### Approach C: Standalone prototype app under `/prototype/*`

- Pros: zero disruption to existing flows.
- Cons: product routes disconnected from real app entry; lower delivery value.

## Chosen Architecture

- Add a parent prototype route group with production paths:
  - `/welcome`, `/quick-menu`, `/settings`, `/create-child`, `/card-fullscreen`,
    `/assessment`, `/home-guide`, `/voice-record`, `/training-weekly`,
    `/analysis-report`, `/training-detail`
- Keep `/auth` as login page (already phone OTP), but upgrade visual/interaction fidelity.
- Upgrade `/chat` parent page to prototype-style layout while keeping runtime integration.
- Introduce shared parent prototype shell/components to avoid per-page duplication.
- Add a page registry and conformance tests to lock the 13-page matrix.

## Data and Interaction Strategy

- Use deterministic fixture-style local view models for prototype-heavy pages (report/detail/voice).
- Keep live integration only where necessary:
  - auth state
  - chat orchestrator request path
  - selected child context
- Add explicit "demo data" labeling in views where data is mocked.

## Verification Strategy

- Unit tests:
  - route registry includes required 13 pages
  - key pages render mandatory sections/controls
- Existing unit/e2e gates remain green.
- Build/lint/typecheck/test/e2e pass before completion claims.

## Risks and Controls

- Risk: CSS regressions across existing role pages.
  - Control: namespace prototype classes and keep legacy classes intact.
- Risk: route confusion with old launchboard.
  - Control: add clear prototype CTA and consistent cross-page nav.
- Risk: scope blow-up.
  - Control: prioritize parent 13 pages; defer non-parent redesign.
