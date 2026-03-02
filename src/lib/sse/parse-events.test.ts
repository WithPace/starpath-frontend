import { describe, expect, it } from "vitest";

import { parseSseEvents } from "./parse-events";

describe("parseSseEvents", () => {
  it("parses delta/done/error events and preserves critical fields", () => {
    const raw = [
      "event: delta",
      'data: {"request_id":"req-1","module":"dashboard","cards":[{"card_type":"summary_card"}],"text":"hello"}',
      "",
      "event: done",
      'data: {"request_id":"req-1","module":"dashboard","card_count":1}',
      "",
      "event: error",
      'data: {"request_id":"req-1","reason":"transport_error","message":"network reset"}',
      "",
    ].join("\n");

    const events = parseSseEvents(raw);

    expect(events).toHaveLength(3);
    expect(events[0]).toMatchObject({
      event: "delta",
      data: {
        request_id: "req-1",
        module: "dashboard",
        cards: [{ card_type: "summary_card" }],
      },
    });
    expect(events[1]).toMatchObject({
      event: "done",
      data: {
        request_id: "req-1",
        module: "dashboard",
      },
    });
    expect(events[2]).toMatchObject({
      event: "error",
      data: {
        request_id: "req-1",
        reason: "transport_error",
      },
    });
  });

  it("ignores malformed frames", () => {
    const raw = [
      "event: delta",
      "data: {bad json}",
      "",
      "event: done",
      'data: {"request_id":"req-2"}',
      "",
    ].join("\n");

    const events = parseSseEvents(raw);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      event: "done",
      data: { request_id: "req-2" },
    });
  });
});
