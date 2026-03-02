import { describe, expect, it, vi } from "vitest";

import { callOrchestrator } from "./orchestrator-client";

describe("callOrchestrator", () => {
  it("posts payload and parses sse response", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        [
          "event: delta",
          'data: {"request_id":"req-3","module":"training","cards":[{"card_type":"training_card"}],"text":"ok"}',
          "",
          "event: done",
          'data: {"request_id":"req-3","module":"training"}',
          "",
        ].join("\n"),
        { status: 200 },
      ),
    );

    const result = await callOrchestrator(
      {
        apiBaseUrl: "https://api.example.com/functions/v1/orchestrator",
        accessToken: "token-1",
      },
      {
        child_id: "child-1",
        message: "hello",
        module: "training",
        request_id: "req-3",
      },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/functions/v1/orchestrator",
      expect.objectContaining({
        method: "POST",
      }),
    );
    expect(result[0]).toMatchObject({
      event: "delta",
      data: {
        request_id: "req-3",
        module: "training",
      },
    });
    expect(result[1]).toMatchObject({
      event: "done",
      data: {
        request_id: "req-3",
        module: "training",
      },
    });
  });

  it("throws when response is not ok", async () => {
    const fetchMock = vi.fn(async () => new Response("bad", { status: 500 }));

    await expect(
      callOrchestrator(
        {
          apiBaseUrl: "https://api.example.com/functions/v1/orchestrator",
          accessToken: "token-1",
        },
        {
          child_id: "child-1",
          message: "hello",
          module: "training",
          request_id: "req-3",
        },
        fetchMock,
      ),
    ).rejects.toThrow("orchestrator request failed: 500");
  });
});
