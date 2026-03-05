import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RoleChatBusinessPanel } from "./role-chat-business-panel";

describe("RoleChatBusinessPanel", () => {
  it("renders doctor business checklist", () => {
    render(<RoleChatBusinessPanel role="doctor" pending={false} />);

    expect(screen.getByRole("heading", { name: "医生对话执行重点" })).toBeInTheDocument();
    expect(screen.getByText("确认高风险行为变化")).toBeInTheDocument();
  });

  it("renders teacher business checklist", () => {
    render(<RoleChatBusinessPanel role="teacher" pending={false} />);

    expect(screen.getByRole("heading", { name: "教师对话执行重点" })).toBeInTheDocument();
    expect(screen.getByText("明确课堂干预目标")).toBeInTheDocument();
  });

  it("shows pending hint when assistant is generating", () => {
    render(<RoleChatBusinessPanel role="doctor" pending />);

    expect(screen.getByText("正在生成本轮建议，请准备记录关键结论。"))
      .toBeInTheDocument();
  });
});
