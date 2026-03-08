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
    expect(source).toContain("last_verify_http_code");
    expect(source).toContain("last_verify_access_token");
    expect(source).toContain("x-sb-error-code");
    expect(source).toContain('if [ "${last_verify_http_code:-}" = "403" ]; then');
    expect(source).toContain("transport_error");
    expect(source).toContain('if [ "${last_verify_http_code:-}" = "unknown" ]; then');
    expect(source).toContain("diagnose_hook_unavailable");
    expect(source).toContain("Service currently unavailable due to hook");
    expect(source).toContain("provider_code=");
    expect(source).not.toContain('if live_access_token="$(verify_otp_for_access_token');
  });
});
