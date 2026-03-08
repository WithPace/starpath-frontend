import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("live parent settings token mode contract", () => {
  it("handles settings assertion differently when using manual access token mode", () => {
    const specPath = resolve(process.cwd(), "tests/e2e/live-parent-full-chain.spec.ts");
    const source = readFileSync(specPath, "utf8");

    expect(source).toContain("if (config.accessToken)");
    expect(source).toContain("请先登录后再修改昵称。");
    expect(source).toContain("昵称已更新：");
  });
});
