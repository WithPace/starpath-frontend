import { describe, expect, it } from "vitest";

import { getLiveE2EConfig } from "./live-e2e-config";

describe("getLiveE2EConfig", () => {
  it("returns disabled config when live gate is off", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "0",
      E2E_LIVE_EMAIL: "",
      E2E_LIVE_PASSWORD: "",
      E2E_LIVE_PARENT_CHILD_ID: "",
    });

    expect(config.enabled).toBe(false);
    expect(config.missing).toEqual([]);
  });

  it("lists missing keys when live gate is on", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "1",
      E2E_LIVE_EMAIL: "",
      E2E_LIVE_PASSWORD: "",
      E2E_LIVE_PARENT_CHILD_ID: "",
    });

    expect(config.enabled).toBe(true);
    expect(config.missing).toEqual([
      "E2E_LIVE_EMAIL",
      "E2E_LIVE_PASSWORD",
      "E2E_LIVE_PARENT_CHILD_ID",
    ]);
  });

  it("returns normalized live credentials when all keys exist", () => {
    const config = getLiveE2EConfig({
      RUN_E2E_LIVE: "1",
      E2E_LIVE_EMAIL: " test@example.com ",
      E2E_LIVE_PASSWORD: " secret ",
      E2E_LIVE_PARENT_CHILD_ID: " 11111111-1111-1111-1111-111111111111 ",
      E2E_LIVE_CHAT_MESSAGE: " hello ",
    });

    expect(config.enabled).toBe(true);
    expect(config.missing).toEqual([]);
    expect(config.email).toBe("test@example.com");
    expect(config.password).toBe("secret");
    expect(config.parentChildId).toBe("11111111-1111-1111-1111-111111111111");
    expect(config.chatMessage).toBe("hello");
  });
});
