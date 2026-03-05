import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AnalysisReportPage from "./page";

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => null,
}));

describe("AnalysisReportPage", () => {
  it("shows report structure and action buttons", () => {
    render(<AnalysisReportPage />);

    expect(screen.getByRole("heading", { name: "综合发展分析报告" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 生成干预建议" })).toBeInTheDocument();
  });
});
