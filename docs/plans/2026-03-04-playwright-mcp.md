# Playwright MCP Local Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add repo-local Playwright MCP integration with reproducible startup commands and usage docs.

**Architecture:** Install `@playwright/mcp` as a dev dependency, expose local launch scripts through `package.json`, and provide `.mcp.json` for MCP-capable clients. Keep existing Playwright E2E runner unchanged.

**Tech Stack:** Node.js, pnpm, Playwright, Playwright MCP, JSON config.

### Task 1: Add dependency and executable entrypoints

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Step 1: Write the failing test**
- Behavioral check: command `pnpm mcp:playwright:help` should exist and succeed.

**Step 2: Run test to verify it fails**
- Run: `pnpm mcp:playwright:help`
- Expected: script not found (before adding script/dependency).

**Step 3: Write minimal implementation**
- Add dev dependency: `@playwright/mcp`.
- Add scripts:
  - `mcp:playwright`: `pnpm exec playwright-mcp`
  - `mcp:playwright:help`: `pnpm exec playwright-mcp --help`

**Step 4: Run test to verify it passes**
- Run: `pnpm mcp:playwright:help`
- Expected: exits 0 and prints usage.

**Step 5: Commit**
- `git add package.json pnpm-lock.yaml`
- `git commit -m "chore(mcp): add local playwright mcp dependency and scripts"`

### Task 2: Add repository MCP config

**Files:**
- Create: `.mcp.json`

**Step 1: Write the failing test**
- Behavioral check: `.mcp.json` exists and contains `playwright` server command.

**Step 2: Run test to verify it fails**
- Run: `test -f .mcp.json`
- Expected: fail before file creation.

**Step 3: Write minimal implementation**
- Create `.mcp.json` with:
  - server name: `playwright`
  - command: `pnpm`
  - args: `exec`, `playwright-mcp`

**Step 4: Run test to verify it passes**
- Run: `cat .mcp.json`
- Expected: valid JSON and expected server block.

**Step 5: Commit**
- `git add .mcp.json`
- `git commit -m "chore(mcp): add repo mcp server config"`

### Task 3: Document usage and verify no regressions

**Files:**
- Modify: `README.md`

**Step 1: Write the failing test**
- Behavioral check: README should contain one section explaining MCP startup command.

**Step 2: Run test to verify it fails**
- Run: `rg -n "Playwright MCP|mcp:playwright" README.md`
- Expected: no match before docs update.

**Step 3: Write minimal implementation**
- Add concise README section:
  - install dependency
  - run `pnpm mcp:playwright:help`
  - run `pnpm mcp:playwright`

**Step 4: Run test to verify it passes**
- Run:
  - `pnpm mcp:playwright:help`
  - `pnpm lint`
  - `pnpm typecheck`
- Expected: all pass.

**Step 5: Commit**
- `git add README.md`
- `git commit -m "docs(mcp): add playwright mcp usage"`

