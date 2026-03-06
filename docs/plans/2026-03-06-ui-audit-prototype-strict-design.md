# UI Audit Prototype Strict Gate Design

## Context

Current UI audit script (`scripts/ci/frontend_ui_audit_screenshots.sh`) silently falls back to `current` screenshots when prototype references are missing. This weakens governance evidence because visual parity can appear green even when prototype sources are absent.

Current prototype assets in `../07-SPath/docs/prototype_v2` are HTML files (`00-welcome.html` ... `12-training-detail.html`), not PNG snapshots.

## Goal

Make prototype mapping a hard gate:

1. For each audited page, prototype source must exist.
2. Prefer source priority: `name.png` -> `name.html`.
3. Missing source fails the script by default.
4. Keep an explicit emergency escape hatch (off by default).

## Options Considered

1. PNG-only strict check
- Pros: simplest
- Cons: incompatible with existing HTML prototype source

2. Strict source with PNG/HTML support (recommended)
- Pros: compatible with current prototype assets, strong governance, no false green fallback
- Cons: small increase in script complexity

3. Keep fallback and only warn
- Pros: least friction
- Cons: governance signal remains weak, same false-positive risk

## Decision

Adopt option 2.

- Add strict source validation before artifact generation.
- Render HTML prototype files into screenshot artifacts when PNG is absent.
- Fail on missing sources unless `UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK=1` is explicitly set.

## Data/Control Flow

1. Build page list (existing 13 pages).
2. Validate prototype sources:
- if page has `<name>.png` or `<name>.html`: pass
- else: collect missing
3. If missing exists and fallback override is off: exit non-zero.
4. Generate current screenshots (existing flow; mock/non-mock).
5. Build prototype artifacts:
- copy PNG when present
- render HTML to PNG when present
- only fallback-copy current when override is on

## Risks & Mitigation

- Risk: strict mode may break existing local workflows.
- Mitigation: explicit override env `UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK=1`.

- Risk: HTML rendering may differ from original design display context.
- Mitigation: preserve deterministic viewport and include source path logs for review.

## Verification Plan

- Add failing governance test first for strict missing-source failure.
- Keep artifact generation contract test passing with complete prototype fixture.
- Run full frontend gate to ensure no regression.
