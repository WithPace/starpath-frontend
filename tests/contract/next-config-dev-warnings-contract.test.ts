import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("next config dev warnings contract", () => {
  it("defines allowedDevOrigins for local playwright/dev host variants", () => {
    const configPath = resolve(process.cwd(), "next.config.ts");
    const source = readFileSync(configPath, "utf8");

    expect(source).toContain("allowedDevOrigins");
    expect(source).toContain("127.0.0.1");
  });

  it("defines turbopack.root to pin workspace root", () => {
    const configPath = resolve(process.cwd(), "next.config.ts");
    const source = readFileSync(configPath, "utf8");

    expect(source).toContain("turbopack");
    expect(source).toContain("root");
  });
});
