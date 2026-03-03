import { describe, expect, it } from "vitest";

import { extractModuleOutcome } from "./module-outcome";

describe("extractModuleOutcome", () => {
  it("reads summary text, cards and done payload from stream events", () => {
    const outcome = extractModuleOutcome([
      {
        event: "delta",
        data: {
          text: "assessment done",
          cards: [{ card_type: "summary_card", title: "评估结论" }],
        },
      },
      {
        event: "done",
        data: {
          request_id: "req-1",
          module: "assessment",
          score: 12,
        },
      },
    ]);

    expect(outcome.summaryText).toBe("assessment done");
    expect(outcome.cards).toHaveLength(1);
    expect(outcome.done.module).toBe("assessment");
  });

  it("returns first error message when stream contains error event", () => {
    const outcome = extractModuleOutcome([
      {
        event: "error",
        data: {
          reason: "transport_error",
          message: "network reset",
        },
      },
    ]);

    expect(outcome.errorMessage).toBe("network reset");
  });
});
