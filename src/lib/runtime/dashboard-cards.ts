import type { OrchestratorRole } from "@/lib/api/orchestrator-client";
import type { ParsedSseEvent } from "@/lib/sse/parse-events";
import type { DashboardCard } from "@/stores/dashboard-store";

const FALLBACK_DASHBOARD_CARDS: Record<OrchestratorRole, DashboardCard[]> = {
  parent: [
    {
      card_type: "summary_card",
      title: "今日家庭训练重点",
      focus: "2个高价值动作",
      priority: "高",
    },
    {
      card_type: "metric_card",
      title: "本周执行率",
      value: "等待实时数据",
      trend: "稳定",
    },
  ],
  doctor: [
    {
      card_type: "summary_card",
      title: "风险分诊默认视图",
      focus: "先处理高风险个案",
      priority: "高",
    },
  ],
  teacher: [
    {
      card_type: "summary_card",
      title: "课堂执行默认视图",
      focus: "优先推进本周课堂动作",
      priority: "中",
    },
  ],
  org_admin: [
    {
      card_type: "summary_card",
      title: "机构运营默认视图",
      focus: "跟踪成员执行与异常工单",
      priority: "中",
    },
  ],
};

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

export function applyDashboardCardFallback(cards: DashboardCard[], role: OrchestratorRole): DashboardCard[] {
  if (cards.length > 0) {
    return cards;
  }

  return FALLBACK_DASHBOARD_CARDS[role].map((card) => ({ ...card }));
}
