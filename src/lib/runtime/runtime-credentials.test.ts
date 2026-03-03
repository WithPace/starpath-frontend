import { describe, expect, it } from "vitest";

import {
  normalizeManualChildId,
  readManualRuntimeCredentials,
} from "./runtime-credentials";

describe("runtime credentials", () => {
  it("normalizes manual child id and rejects placeholder", () => {
    expect(normalizeManualChildId(" child-1 ")).toBe("child-1");
    expect(normalizeManualChildId("placeholder-child-id")).toBeNull();
    expect(normalizeManualChildId(" ")).toBeNull();
  });

  it("reads manual runtime credentials from storage", () => {
    const storage: Storage = {
      length: 0,
      clear() {},
      key() {
        return null;
      },
      getItem(key: string) {
        if (key === "sp_access_token") return " manual-token ";
        if (key === "sp_child_id") return " child-1 ";
        return null;
      },
      removeItem() {},
      setItem() {},
    };

    const result = readManualRuntimeCredentials(storage);
    expect(result).toEqual({
      manualAccessToken: "manual-token",
      manualChildId: "child-1",
    });
  });
});
