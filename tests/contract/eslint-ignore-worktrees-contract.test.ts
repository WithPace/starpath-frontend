import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("eslint ignore contract", () => {
  it("ignores nested worktree outputs to keep lint gate bounded", () => {
    const configPath = resolve(process.cwd(), "eslint.config.mjs");
    const source = readFileSync(configPath, "utf8");

    expect(source).toContain(".worktrees/**");
  });
});
