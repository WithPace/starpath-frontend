import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("frontend final gate contract", () => {
  it("cleans .next before type/lint gates to avoid stale route validators", () => {
    const scriptPath = resolve(process.cwd(), "scripts/ci/frontend_final_gate.sh");
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain("rm -rf .next");
  });
});
