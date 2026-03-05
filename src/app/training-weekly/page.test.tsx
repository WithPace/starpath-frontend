import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TrainingWeeklyPage from "./page";

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => null,
}));

describe("TrainingWeeklyPage", () => {
  it("shows weekly card and ai interpretation action", () => {
    render(<TrainingWeeklyPage />);

    expect(screen.getByRole("heading", { name: "一周训练记录", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 解读周报" })).toBeInTheDocument();
  });
});
