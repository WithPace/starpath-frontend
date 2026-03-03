# Parent Home Guide + Settings + Card Live Design

## Context

- Parent pages now have live chains for:
  - create-child
  - quick-menu
  - training-weekly
  - training-detail
  - analysis-report
  - assessment
  - voice-record
- Remaining major parent pages still mostly static:
  - `/home-guide`
  - `/settings`
  - `/card-fullscreen`

## Goal

- Upgrade these three pages from static prototype display to production-like behavior:
  - home-guide becomes data-driven daily action guidance
  - settings supports real account profile update + persistent preferences
  - card-fullscreen shows real trend/radar/assessment details

## Non-goals

- No backend schema migration.
- No UI overhaul of non-parent routes.
- No payment/VIP workflow implementation in this pass.

## Approaches

### A. Full backend-first orchestration

- Pros: stronger domain centralization.
- Cons: slower; unnecessary for current phase.

### B. Client live-read/write + typed helper layer (Chosen)

- Pros: fastest end-to-end delivery under current schema/RLS; aligns with existing parent pages.
- Cons: some preferences remain local persistence due schema constraints.

### C. Pure static polish

- Pros: easy.
- Cons: does not satisfy "可上线业务链路" expectation.

## Chosen Architecture

1. Extend domain/helper layer:
   - training trend summary
   - home-guide recommendation generation
2. Extend data-access layer:
   - current user profile read
   - nickname update
   - recent sessions/profile/assessment reads for card and guide pages
3. Page integration:
   - `home-guide`: derive 3 executable steps from real child data
   - `settings`: load account data, update nickname, save preferences to local storage
   - `card-fullscreen`: render real trend/radar/assessment sections by tab
4. Keep existing shell classes and route structure stable to avoid regression.

## Data Flow

- Home Guide:
  - read latest profile + recent sessions + recent assessment
  - compute weakest domains and risk-aware steps
  - show fallback if data missing
- Settings:
  - read current user profile (`users` + auth session)
  - write nickname to `users`
  - save reminder/AI style to local storage
- Card Fullscreen:
  - trend tab: recent sessions summary
  - radar tab: latest profile domain scores
  - assessment tab: recent assessment history

## Verification

- TDD:
  - add failing tests for new helper and settings interaction
  - add failing tests for home-guide/card key rendered states
- then full gate:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm test:e2e`
