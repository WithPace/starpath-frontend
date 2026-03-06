import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("playwright no-color guard contract", () => {
  it("clears NO_COLOR before playwright workers spawn", () => {
    const configPath = resolve(process.cwd(), "playwright.config.ts");
    const source = readFileSync(configPath, "utf8");

    expect(source).toContain("process.env.NO_COLOR");
    expect(source).toContain('"NO_COLOR" in process.env');
    expect(source).toContain("delete process.env.NO_COLOR");
  });
});
