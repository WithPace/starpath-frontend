import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("live parent settings token mode contract", () => {
  it("keeps nickname-save success assertion in settings even with manual token mode", () => {
    const specPath = resolve(process.cwd(), "tests/e2e/live-parent-full-chain.spec.ts");
    const source = readFileSync(specPath, "utf8");

    expect(source).toContain("if (config.accessToken)");
    expect(source).toContain("昵称已更新：");
    expect(source).not.toContain("请先登录后再修改昵称。");
  });
});
