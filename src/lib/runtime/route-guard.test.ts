import { describe, expect, it } from "vitest";

import { getRouteGuardDecision } from "./route-guard";

describe("getRouteGuardDecision", () => {
  it("waits while runtime is loading", () => {
    expect(getRouteGuardDecision({ loading: true, accessToken: null })).toEqual({
      allow: false,
      redirectTo: null,
      reason: "loading",
    });
  });

  it("redirects to /auth when token is missing", () => {
    expect(
      getRouteGuardDecision({
        loading: false,
        accessToken: null,
        currentPath: "/doctor/chat",
      }),
    ).toEqual({
      allow: false,
      redirectTo: "/auth?next=%2Fdoctor%2Fchat",
      reason: "auth_required",
    });
  });

  it("allows when token is present", () => {
    expect(
      getRouteGuardDecision({
        loading: false,
        accessToken: "jwt-token",
        currentPath: "/dashboard",
      }),
    ).toEqual({
      allow: true,
      redirectTo: null,
      reason: "ok",
    });
  });
});
