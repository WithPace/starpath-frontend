import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("ci no-color conflict guard contract", () => {
  it("frontend final gate script unsets NO_COLOR when variable is present", () => {
    const scriptPath = resolve(process.cwd(), "scripts/ci/frontend_final_gate.sh");
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain('if [ "${NO_COLOR+x}" = "x" ]; then');
    expect(source).toContain("unset NO_COLOR");
  });

  it("frontend live e2e script unsets NO_COLOR when variable is present", () => {
    const scriptPath = resolve(process.cwd(), "scripts/ci/frontend_live_e2e.sh");
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain('if [ "${NO_COLOR+x}" = "x" ]; then');
    expect(source).toContain("unset NO_COLOR");
  });
});
