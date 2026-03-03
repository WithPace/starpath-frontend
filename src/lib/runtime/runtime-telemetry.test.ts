import { describe, expect, it, vi } from "vitest";

import { buildTelemetryRecord, reportRuntimeError } from "./runtime-telemetry";

describe("runtime telemetry", () => {
  it("builds structured record", () => {
    expect(
      buildTelemetryRecord({
        scope: "role_chat",
        message: "request failed",
        context: { role: "doctor", route: "/doctor/chat" },
      }),
    ).toMatchObject({
      scope: "role_chat",
      message: "request failed",
      context: { role: "doctor", route: "/doctor/chat" },
    });
  });

  it("reports error through sink", () => {
    const sink = vi.fn();

    reportRuntimeError(
      {
        scope: "org_members",
        message: "permission denied",
        context: { orgId: "org-1" },
      },
      sink,
    );

    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink.mock.calls[0][0]).toMatchObject({ scope: "org_members", message: "permission denied" });
  });
});
