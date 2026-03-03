import type { ParsedSseEvent } from "@/lib/sse/parse-events";
import type { DashboardCard } from "@/stores/dashboard-store";

function readCards(value: unknown): DashboardCard[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((card): card is DashboardCard => {
      if (!card || typeof card !== "object") return false;
      if (!("card_type" in card) || !("title" in card)) return false;
      return typeof card.card_type === "string" && typeof card.title === "string";
    })
    .map((card) => ({ ...card }));
}

export function extractDashboardCards(events: ParsedSseEvent[]): DashboardCard[] {
  const delta = events.find((event) => event.event === "delta");
  const deltaCards = readCards(delta?.data.cards);
  if (deltaCards.length > 0) return deltaCards;

  const done = events.find((event) => event.event === "done");
  return readCards(done?.data.cards);
}
