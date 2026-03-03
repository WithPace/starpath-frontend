import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("shows phase5 role entry links", () => {
    render(<Home />);

    expect(screen.getByText("StarPath Frontend")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/chat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/doctor/chat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/teacher/chat" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "/org-admin/members" })).toBeInTheDocument();
  });

  it("does not show phase4-only wording", () => {
    render(<Home />);

    expect(screen.queryByText("Phase 4 parent MVP routes:")).not.toBeInTheDocument();
  });
});
