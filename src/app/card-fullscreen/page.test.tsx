import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CardFullscreenPage from "./page";

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

describe("CardFullscreenPage", () => {
  it("renders trend summary panel title", () => {
    render(<CardFullscreenPage />);

    expect(screen.getByRole("heading", { name: "近30天训练概览" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存到成长卡片" })).toBeInTheDocument();
  });
});
