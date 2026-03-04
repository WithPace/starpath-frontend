# Playwright MCP Local Integration Design

**Context**
- Current repo uses Playwright test runner (`@playwright/test`) but has no MCP server integration.
- Goal is local, repo-scoped Playwright MCP setup that can be started consistently by any collaborator.

**Goal**
- Add a deterministic Playwright MCP entrypoint in this repository, with minimal configuration and verification commands.

**Scope**
- In scope:
  - Add `@playwright/mcp` as dev dependency.
  - Add repository MCP config file for tool clients.
  - Add npm/pnpm scripts for starting and validating MCP server.
  - Document usage in README.
- Out of scope:
  - Editing external client app configs outside this repo.
  - Reworking existing Playwright E2E specs.

**Architecture**
- Runtime binary comes from local dependency (`node_modules/.bin/playwright-mcp`).
- `.mcp.json` defines one server (`playwright`) using local bin via `pnpm exec playwright-mcp`.
- Developer and CI-like validation can run `pnpm mcp:playwright:help` to confirm executable + wiring.

**Data/Execution Flow**
1. MCP client reads `.mcp.json` in repo.
2. Client launches `pnpm exec playwright-mcp`.
3. `playwright-mcp` exposes tools over stdio.
4. Existing Playwright config/specs remain unchanged.

**Error Handling**
- If dependency missing: `pnpm mcp:playwright` fails fast.
- If browser prerequisites missing, MCP startup still validated via `--help`; deeper browser checks remain in existing E2E commands.

**Security and Safety**
- No secrets added.
- No environment variables with credentials introduced.
- Uses local dependency lockfile for repeatability.

**Verification**
- `pnpm install` updates lockfile with `@playwright/mcp`.
- `pnpm mcp:playwright:help` exits 0 and prints usage.
- `pnpm lint` and `pnpm typecheck` still pass.

