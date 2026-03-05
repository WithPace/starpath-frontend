import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPage from "./page";

describe("PrivacyPage", () => {
  it("renders privacy sections and back link", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "隐私政策", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("数据范围")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回设置" })).toHaveAttribute("href", "/settings");
  });
});
