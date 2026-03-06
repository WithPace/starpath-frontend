import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("live e2e interactive otp retry contract", () => {
  it("contains bounded verify attempts and resend-on-expired-token flow", () => {
    const scriptPath = resolve(process.cwd(), "scripts/ci/frontend_live_e2e_interactive.sh");
    const source = readFileSync(scriptPath, "utf8");

    expect(source).toContain("max_verify_attempts");
    expect(source).toContain("retryable verify failure");
    expect(source).toContain("request_otp_with_retry");
    expect(source).toContain("input latest 6-digit otp");
  });
});
