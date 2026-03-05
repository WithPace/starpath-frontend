import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoleBusinessPanel } from "./role-business-panel";

describe("RoleBusinessPanel", () => {
  it("renders doctor business queue and actions", () => {
    render(
      <RoleBusinessPanel
        role="doctor"
        cards={[{ card_type: "summary_card", title: "今日高风险" }]}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "风险分诊待办" })).toBeInTheDocument();
    expect(screen.getByText("24h 内安排随访")).toBeInTheDocument();
  });

  it("renders teacher checklist panel", () => {
    render(<RoleBusinessPanel role="teacher" cards={[]} loading={false} error={null} />);

    expect(screen.getByRole("heading", { name: "课堂执行清单" })).toBeInTheDocument();
    expect(screen.getByText("今日课堂干预目标")).toBeInTheDocument();
  });

  it("renders org admin operations panel", () => {
    render(<RoleBusinessPanel role="org_admin" cards={[]} loading={false} error={null} />);

    expect(screen.getByRole("heading", { name: "机构运营快照" })).toBeInTheDocument();
    expect(screen.getByText("本周督导与质检")).toBeInTheDocument();
  });

  it("shows deterministic fallback hint when cards are unavailable", () => {
    render(<RoleBusinessPanel role="doctor" cards={[]} loading={false} error="boom" />);

    expect(screen.getByText("卡片数据暂不可用，已切换到标准业务待办。")).toBeInTheDocument();
  });
});
