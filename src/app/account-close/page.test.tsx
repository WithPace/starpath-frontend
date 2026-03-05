import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccountClosePage from "./page";

describe("AccountClosePage", () => {
  it("requires confirmation before submitting closure request", () => {
    render(<AccountClosePage />);

    expect(screen.getByRole("heading", { name: "注销账号", level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "提交注销申请" }));
    expect(screen.getByText("请先勾选确认项。")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("我已知晓注销后将无法恢复历史数据"));
    fireEvent.click(screen.getByRole("button", { name: "提交注销申请" }));
    expect(screen.getByText("注销申请已提交，我们将在 1-3 个工作日内联系确认。"))
      .toBeInTheDocument();
  });
});
