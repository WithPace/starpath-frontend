import { describe, expect, it } from "vitest";

import { useChatStore } from "./chat-store";

describe("useChatStore", () => {
  it("keeps messages isolated by role", () => {
    const store = useChatStore.getState();

    store.clear("parent");
    store.clear("doctor");

    store.addMessage("parent", {
      id: "p-1",
      role: "user",
      content: "parent message",
    });

    expect(store.getMessages("parent").some((message) => message.content === "parent message")).toBe(true);
    expect(store.getMessages("doctor").some((message) => message.content === "parent message")).toBe(false);
  });

  it("tracks pending state per role", () => {
    const store = useChatStore.getState();

    store.setPending("teacher", true);
    expect(store.isPending("teacher")).toBe(true);
    expect(store.isPending("parent")).toBe(false);
  });
});
