import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FeedbackPage from "./page";

describe("FeedbackPage", () => {
  it("validates empty content and supports local submit", () => {
    render(<FeedbackPage />);

    expect(screen.getByRole("heading", { name: "意见反馈", level: 1 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "提交反馈" }));
    expect(screen.getByText("反馈内容不能为空。")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("反馈内容"), {
      target: { value: "希望增加家庭任务完成率趋势图。" },
    });
    fireEvent.change(screen.getByLabelText("联系方式（可选）"), {
      target: { value: "18500001111" },
    });
    fireEvent.click(screen.getByRole("button", { name: "提交反馈" }));

    expect(screen.getByText("反馈已记录（本地确认），后台接入将在下一阶段完成。")).toBeInTheDocument();
  });
});
