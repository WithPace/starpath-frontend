import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import TermsPage from "./page";

describe("TermsPage", () => {
  it("renders terms sections and back link", () => {
    render(<TermsPage />);

    expect(screen.getByRole("heading", { name: "用户协议", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("服务说明")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回设置" })).toHaveAttribute("href", "/settings");
  });
});
