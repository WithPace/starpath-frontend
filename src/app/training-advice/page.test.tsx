import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TrainingAdvicePage from "./page";

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => null,
}));

describe("TrainingAdvicePage", () => {
  it("renders training advice actions and outbound links", () => {
    render(<TrainingAdvicePage />);

    expect(screen.getByRole("heading", { name: "训练建议", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI 生成训练建议" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "进入居家指导" })).toBeInTheDocument();
  });
});
