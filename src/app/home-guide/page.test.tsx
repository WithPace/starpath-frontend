import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import HomeGuidePage from "./page";

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => ({ mocked: true }),
}));

vi.mock("@/lib/prototype/parent-data-access", () => ({
  listRecentTrainingSessions: async () => [],
  listLatestChildProfile: async () => null,
  listRecentAssessments: async () => [],
}));

describe("HomeGuidePage", () => {
  it("renders dynamic guide section", () => {
    render(<HomeGuidePage />);

    expect(screen.getByRole("heading", { name: "今日执行重点（动态）" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 生成今日计划" })).toBeInTheDocument();
  });
});
