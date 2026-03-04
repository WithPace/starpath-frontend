import { describe, expect, it } from "vitest";

import { resolveChatSendWaitState } from "./chat-send-state";

describe("resolveChatSendWaitState", () => {
  it("returns pending while send button is disabled and no error appears", () => {
    const state = resolveChatSendWaitState({
      sendButtonDisabled: true,
      requestFailureText: null,
    });

    expect(state).toBe("pending");
  });

  it("returns request failure text when request failed", () => {
    const state = resolveChatSendWaitState({
      sendButtonDisabled: true,
      requestFailureText: "请求失败：Failed to fetch",
    });

    expect(state).toBe("请求失败：Failed to fetch");
  });

  it("returns ok when send button is re-enabled and no failure exists", () => {
    const state = resolveChatSendWaitState({
      sendButtonDisabled: false,
      requestFailureText: null,
    });

    expect(state).toBe("ok");
  });
});
