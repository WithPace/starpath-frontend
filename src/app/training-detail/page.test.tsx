import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import TrainingDetailPage from "./page";

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => null,
}));

describe("TrainingDetailPage", () => {
  it("shows timeline and export action", () => {
    render(<TrainingDetailPage />);

    expect(screen.getByRole("heading", { name: "详细训练记录" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "导出 PDF" })).toBeInTheDocument();
  });
});
