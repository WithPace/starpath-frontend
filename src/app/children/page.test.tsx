import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ChildrenPage from "./page";

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    loading: false,
    accessToken: "token",
    children: [
      { id: "child-1", label: "小星" },
      { id: "child-2", label: "小辰" },
    ],
    selectedChildId: "child-1",
    setSelectedChildId: vi.fn(),
  }),
}));

describe("ChildrenPage", () => {
  it("renders child list and active switch actions", () => {
    render(<ChildrenPage />);

    expect(screen.getByRole("heading", { name: "孩子管理", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "设为当前孩子" })).toBeInTheDocument();
  });
});
