import { describe, expect, it } from "vitest";

import { resolveAuthNextPath } from "./auth-next";

describe("resolveAuthNextPath", () => {
  it("returns safe in-app path", () => {
    expect(resolveAuthNextPath("/chat")).toBe("/chat");
    expect(resolveAuthNextPath("/journey")).toBe("/journey");
  });

  it("falls back to / when path is invalid or external", () => {
    expect(resolveAuthNextPath("https://evil.com")).toBe("/");
    expect(resolveAuthNextPath("javascript:alert(1)")).toBe("/");
    expect(resolveAuthNextPath("chat")).toBe("/");
    expect(resolveAuthNextPath("")).toBe("/");
    expect(resolveAuthNextPath(null)).toBe("/");
  });
});
