import { describe, expect, it } from "vitest";

import { buildInvitePayload, normalizeStatusPatch } from "./org-members";

describe("org member helpers", () => {
  it("builds invite payload with normalized values", () => {
    expect(
      buildInvitePayload({
        orgId: " org-1 ",
        userId: " user-1 ",
        orgRole: " teacher ",
      }),
    ).toEqual({
      org_id: "org-1",
      user_id: "user-1",
      org_role: "teacher",
      status: "active",
    });
  });

  it("throws when required invite fields are missing", () => {
    expect(() => buildInvitePayload({ orgId: "", userId: "u1", orgRole: "teacher" })).toThrow(
      "orgId is required",
    );
  });

  it("normalizes allowed status patch", () => {
    expect(normalizeStatusPatch(" inactive ")).toEqual({ status: "inactive" });
  });

  it("rejects unsupported status patch", () => {
    expect(() => normalizeStatusPatch("deleted")).toThrow("invalid status");
  });
});
