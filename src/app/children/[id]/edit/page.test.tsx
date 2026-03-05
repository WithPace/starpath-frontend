import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChildEditPage from "./page";

vi.mock("next/navigation", () => ({
  useParams: () => ({
    id: "child-1",
  }),
}));

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    loading: false,
    accessToken: "token",
    children: [{ id: "child-1", label: "小星" }],
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => null,
}));

describe("ChildEditPage", () => {
  it("renders child edit form and save action", () => {
    render(<ChildEditPage />);

    expect(screen.getByRole("heading", { name: "编辑孩子档案", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存档案" })).toBeInTheDocument();
  });
});
