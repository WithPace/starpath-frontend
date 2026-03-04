import { describe, expect, it } from "vitest";

import { resolveOtpLoginWaitState } from "./otp-login-state";

describe("resolveOtpLoginWaitState", () => {
  it("returns ok when login already redirected away from /auth", () => {
    const state = resolveOtpLoginWaitState({
      currentUrl: "http://127.0.0.1:4173/",
      sessionStatusText: null,
      otpErrorText: null,
    });

    expect(state).toBe("ok");
  });

  it("returns pending when still on /auth and session remains unauthenticated", () => {
    const state = resolveOtpLoginWaitState({
      currentUrl: "http://127.0.0.1:4173/auth",
      sessionStatusText: "当前会话：未登录",
      otpErrorText: null,
    });

    expect(state).toBe("pending");
  });

  it("returns otp error text when login failed on /auth", () => {
    const state = resolveOtpLoginWaitState({
      currentUrl: "http://127.0.0.1:4173/auth",
      sessionStatusText: "当前会话：未登录",
      otpErrorText: "验证码登录失败：Token has expired or is invalid",
    });

    expect(state).toBe("验证码登录失败：Token has expired or is invalid");
  });
});
