import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardCards } from "./dashboard-cards";

describe("DashboardCards", () => {
  it("renders cards from payload", () => {
    render(
      <DashboardCards
        cards={[
          { card_type: "summary_card", title: "本周训练概览" },
          { card_type: "metric_card", title: "最新评估风险" },
        ]}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("本周训练概览")).toBeInTheDocument();
    expect(screen.getByText("最新评估风险")).toBeInTheDocument();
  });

  it("shows empty state when cards are missing", () => {
    render(<DashboardCards cards={[]} loading={false} error={null} />);

    expect(screen.getByText("暂无看板数据")).toBeInTheDocument();
  });
});
