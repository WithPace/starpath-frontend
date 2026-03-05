import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AboutPage from "./page";

describe("AboutPage", () => {
  it("renders mission summary and settings backlink", () => {
    render(<AboutPage />);

    expect(screen.getByRole("heading", { name: "关于星途", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("产品愿景")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回设置" })).toHaveAttribute("href", "/settings");
  });
});
