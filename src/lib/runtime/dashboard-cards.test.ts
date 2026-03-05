import { describe, expect, it } from "vitest";

import { applyDashboardCardFallback, extractDashboardCards } from "./dashboard-cards";

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

  it("returns fallback cards when payload cards are missing", () => {
    const cards = applyDashboardCardFallback([], "parent");

    expect(cards.length).toBeGreaterThan(0);
    expect(cards[0]).toMatchObject({
      card_type: "summary_card",
    });
  });

  it("keeps payload cards when backend already returned cards", () => {
    const source = [{ card_type: "metric_card", title: "实时看板" }];
    const cards = applyDashboardCardFallback(source, "doctor");

    expect(cards).toEqual(source);
  });
});
