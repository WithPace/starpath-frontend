import { describe, expect, it } from "vitest";

import { getLiveE2EConfig } from "./live-e2e-config";

describe("getLiveE2EConfig", () => {
  it("returns disabled config when live gate is off", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "0",
      E2E_LIVE_PHONE: "",
      E2E_LIVE_OTP: "",
      E2E_LIVE_PARENT_CHILD_ID: "",
    });

    expect(config.enabled).toBe(false);
    expect(config.missing).toEqual([]);
    expect(config.triggerOtpSend).toBe(false);
    expect(config.accessToken).toBeNull();
  });

  it("lists missing keys when live gate is on", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "1",
      E2E_LIVE_PHONE: "",
      E2E_LIVE_OTP: "",
      E2E_LIVE_PARENT_CHILD_ID: "",
    });

    expect(config.enabled).toBe(true);
    expect(config.missing).toEqual([
      "E2E_LIVE_PARENT_CHILD_ID",
      "E2E_LIVE_PHONE",
      "E2E_LIVE_OTP",
    ]);
    expect(config.triggerOtpSend).toBe(false);
    expect(config.accessToken).toBeNull();
  });

  it("returns normalized live credentials when all keys exist", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "1",
      E2E_LIVE_PHONE: " +8613800138000 ",
      E2E_LIVE_OTP: " 123456 ",
      E2E_LIVE_PARENT_CHILD_ID: " 11111111-1111-1111-1111-111111111111 ",
      E2E_LIVE_CHAT_MESSAGE: " hello ",
      E2E_LIVE_PARENT_NICKNAME: " 星途家长 ",
      E2E_LIVE_TRIGGER_OTP_SEND: "1",
    });

    expect(config.enabled).toBe(true);
    expect(config.missing).toEqual([]);
    expect(config.phone).toBe("+8613800138000");
    expect(config.otp).toBe("123456");
    expect(config.accessToken).toBeNull();
    expect(config.parentChildId).toBe("11111111-1111-1111-1111-111111111111");
    expect(config.chatMessage).toBe("hello");
    expect(config.parentNickname).toBe("星途家长");
    expect(config.triggerOtpSend).toBe(true);
  });

  it("uses fallback nickname when live nickname is not provided", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "1",
      E2E_LIVE_PHONE: "+8613800138000",
      E2E_LIVE_OTP: "123456",
      E2E_LIVE_PARENT_CHILD_ID: "11111111-1111-1111-1111-111111111111",
    });

    expect(config.parentNickname).toBe("星途家长-自动化");
    expect(config.triggerOtpSend).toBe(false);
    expect(config.accessToken).toBeNull();
  });

  it("allows manual access token mode without phone otp", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "1",
      E2E_LIVE_ACCESS_TOKEN: "token-abc",
      E2E_LIVE_PARENT_CHILD_ID: "11111111-1111-1111-1111-111111111111",
    });

    expect(config.enabled).toBe(true);
    expect(config.missing).toEqual([]);
    expect(config.accessToken).toBe("token-abc");
  });
});
