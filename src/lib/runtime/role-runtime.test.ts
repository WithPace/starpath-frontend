import { describe, expect, it } from "vitest";

import {
  buildChildOptions,
  pickRuntimeAccessToken,
  resolveSelectedChildId,
} from "./role-runtime";

describe("role runtime helpers", () => {
  it("prefers session token over manual token", () => {
    expect(
      pickRuntimeAccessToken({
        sessionAccessToken: "session-token",
        manualAccessToken: "manual-token",
      }),
    ).toBe("session-token");
  });

  it("returns null when tokens are missing or placeholder-like", () => {
    expect(
      pickRuntimeAccessToken({
        sessionAccessToken: "",
        manualAccessToken: "placeholder-token",
      }),
    ).toBeNull();
  });

  it("builds child options from children rows", () => {
    const options = buildChildOptions([
      { id: "c1", nickname: "小明", real_name: "张明" },
      { id: "c2", nickname: null, real_name: "李华" },
      { id: "c3", nickname: null, real_name: null },
    ]);

    expect(options).toEqual([
      { id: "c1", label: "小明" },
      { id: "c2", label: "李华" },
      { id: "c3", label: "c3" },
    ]);
  });

  it("resolves selected child id by preference or first option", () => {
    const options = [
      { id: "c1", label: "小明" },
      { id: "c2", label: "小红" },
    ];

    expect(resolveSelectedChildId(options, "c2")).toBe("c2");
    expect(resolveSelectedChildId(options, "missing")).toBe("c1");
    expect(resolveSelectedChildId([], "c1")).toBeNull();
  });
});
