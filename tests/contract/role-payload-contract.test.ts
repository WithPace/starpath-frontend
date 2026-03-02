import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("orchestrator role payload contract", () => {
  it("declares role in frontend orchestrator payload type", () => {
    const filePath = join(process.cwd(), "src/lib/api/orchestrator-client.ts");
    const source = readFileSync(filePath, "utf-8");

    expect(source).toContain("role?:");
    expect(source).toContain('"parent"');
    expect(source).toContain('"doctor"');
    expect(source).toContain('"teacher"');
    expect(source).toContain('"org_admin"');
  });
});
