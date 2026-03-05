import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import VipPage from "./page";

describe("VipPage", () => {
  it("renders vip page and upgrade feedback", () => {
    render(<VipPage />);

    expect(screen.getByRole("heading", { name: "升级 VIP", level: 1 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "立即升级" }));
    expect(screen.getByText("升级申请已记录，我们会尽快联系你。"))
      .toBeInTheDocument();
  });
});
