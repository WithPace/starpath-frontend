import { describe, expect, it } from "vitest";

import {
  OTP_RESEND_SECONDS,
  buildOtpResendCooldownUntilMs,
  getOtpResendRemainingSeconds,
} from "./otp-resend";

describe("otp resend cooldown", () => {
  it("uses 60 seconds as default resend window", () => {
    expect(OTP_RESEND_SECONDS).toBe(60);
  });

  it("builds cooldown deadline with provided start time", () => {
    const deadline = buildOtpResendCooldownUntilMs(1_000);
    expect(deadline).toBe(61_000);
  });

  it("returns remaining seconds with ceil strategy", () => {
    expect(getOtpResendRemainingSeconds(61_000, 1_000)).toBe(60);
    expect(getOtpResendRemainingSeconds(61_000, 1_001)).toBe(60);
    expect(getOtpResendRemainingSeconds(61_000, 60_001)).toBe(1);
    expect(getOtpResendRemainingSeconds(61_000, 61_000)).toBe(0);
  });

  it("returns zero when cooldown not set", () => {
    expect(getOtpResendRemainingSeconds(null, 10_000)).toBe(0);
  });
});
