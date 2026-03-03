import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import WelcomePage from "./welcome/page";
import QuickMenuPage from "./quick-menu/page";
import SettingsPage from "./settings/page";
import WeeklyPage from "./training-weekly/page";
import AnalysisReportPage from "./analysis-report/page";
import TrainingDetailPage from "./training-detail/page";

describe("prototype pages", () => {
  it("renders welcome/start page", () => {
    render(<WelcomePage />);

    expect(screen.getByRole("heading", { name: "星途AI" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "开始使用" })).toBeInTheDocument();
  });

  it("renders quick menu with 8 entries", () => {
    render(<QuickMenuPage />);

    expect(screen.getByRole("heading", { name: "快捷入口" })).toBeInTheDocument();
    expect(screen.getByText("孩子档案")).toBeInTheDocument();
    expect(screen.getByText("评估报告")).toBeInTheDocument();
    expect(screen.getByText("情绪日历")).toBeInTheDocument();
  });

  it("renders settings core groups", () => {
    render(<SettingsPage />);

    expect(screen.getByRole("heading", { name: "设置" })).toBeInTheDocument();
    expect(screen.getAllByText("账号信息").length).toBeGreaterThan(0);
    expect(screen.getByText("偏好设置")).toBeInTheDocument();
  });

  it("renders weekly report page", () => {
    render(<WeeklyPage />);

    expect(screen.getByRole("heading", { name: "一周训练记录", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看详细记录" })).toBeInTheDocument();
  });

  it("renders analysis report page", () => {
    render(<AnalysisReportPage />);

    expect(screen.getByRole("heading", { name: "综合发展分析报告" })).toBeInTheDocument();
    expect(screen.getByText("行为 ABC 分析")).toBeInTheDocument();
  });

  it("renders training detail page", () => {
    render(<TrainingDetailPage />);

    expect(screen.getByRole("heading", { name: "详细训练记录" })).toBeInTheDocument();
    expect(screen.getByText("周切换")).toBeInTheDocument();
  });
});
