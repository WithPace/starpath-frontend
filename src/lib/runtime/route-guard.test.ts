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
        hasActiveChild: true,
      }),
    ).toEqual({
      allow: true,
      redirectTo: null,
      reason: "ok",
    });
  });

  it("redirects authenticated user without child to /create-child on parent protected routes", () => {
    expect(
      getRouteGuardDecision({
        loading: false,
        accessToken: "jwt-token",
        hasActiveChild: false,
        currentPath: "/chat",
      }),
    ).toEqual({
      allow: false,
      redirectTo: "/create-child?next=%2Fchat",
      reason: "child_required",
    });
  });

  it("allows /create-child when user has no active child yet", () => {
    expect(
      getRouteGuardDecision({
        loading: false,
        accessToken: "jwt-token",
        hasActiveChild: false,
        currentPath: "/create-child",
      }),
    ).toEqual({
      allow: true,
      redirectTo: null,
      reason: "ok",
    });
  });
});
