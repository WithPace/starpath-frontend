import type { DashboardCard } from "@/stores/dashboard-store";

type DashboardCardsProps = {
  cards: DashboardCard[];
  loading: boolean;
  error: string | null;
};

export function DashboardCards({ cards, loading, error }: DashboardCardsProps) {
  if (loading) {
    return <p className="muted-text">看板加载中...</p>;
  }

  if (error) {
    return <p className="runtime-panel__warning">看板加载失败：{error}</p>;
  }

  if (cards.length === 0) {
    return <p className="muted-text">暂无看板数据</p>;
  }

  return (
    <section aria-label="dashboard-cards" className="dashboard-grid">
      {cards.map((card, index) => (
        <article key={`${card.card_type}-${index}`} className="dashboard-card">
          <header>
            <p className="dashboard-card__type">{card.card_type}</p>
            <h3>{card.title}</h3>
          </header>
          <ul>
            {Object.entries(card)
              .filter(([key]) => key !== "card_type" && key !== "title")
              .slice(0, 4)
              .map(([key, value]) => (
                <li key={key}>
                  <span>{key}</span>
                  <strong>{typeof value === "string" || typeof value === "number" ? String(value) : "..."}</strong>
                </li>
              ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
