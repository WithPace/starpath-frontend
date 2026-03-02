import type { DashboardCard } from "@/stores/dashboard-store";

type DashboardCardsProps = {
  cards: DashboardCard[];
  loading: boolean;
  error: string | null;
};

export function DashboardCards({ cards, loading, error }: DashboardCardsProps) {
  if (loading) {
    return <p>看板加载中...</p>;
  }

  if (error) {
    return <p>看板加载失败：{error}</p>;
  }

  if (cards.length === 0) {
    return <p>暂无看板数据</p>;
  }

  return (
    <section aria-label="dashboard-cards">
      {cards.map((card, index) => (
        <article key={`${card.card_type}-${index}`}>
          <h3>{card.title}</h3>
          <p>类型：{card.card_type}</p>
        </article>
      ))}
    </section>
  );
}
