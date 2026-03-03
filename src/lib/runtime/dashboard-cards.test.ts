import { describe, expect, it } from "vitest";

import { extractDashboardCards } from "./dashboard-cards";

describe("extractDashboardCards", () => {
  it("prefers delta cards payload", () => {
    const cards = extractDashboardCards([
      { event: "delta", data: { cards: [{ card_type: "summary_card", title: "A" }] } },
      { event: "done", data: { cards: [{ card_type: "summary_card", title: "B" }] } },
    ]);

    expect(cards).toEqual([{ card_type: "summary_card", title: "A" }]);
  });

  it("falls back to done cards payload", () => {
    const cards = extractDashboardCards([
      { event: "done", data: { cards: [{ card_type: "metric_card", title: "B" }] } },
    ]);

    expect(cards).toEqual([{ card_type: "metric_card", title: "B" }]);
  });

  it("returns empty array when cards payload is missing", () => {
    const cards = extractDashboardCards([{ event: "done", data: { module: "dashboard" } }]);

    expect(cards).toEqual([]);
  });
});
