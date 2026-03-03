import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChatFlow } from "./chat-flow";

describe("ChatFlow", () => {
  it("renders existing timeline messages", () => {
    render(
      <ChatFlow
        messages={[
          { id: "m1", role: "assistant", content: "欢迎回来" },
          { id: "m2", role: "user", content: "给我训练建议" },
        ]}
        onSend={vi.fn()}
        pending={false}
      />,
    );

    expect(screen.getByText("欢迎回来")).toBeInTheDocument();
    expect(screen.getByText("给我训练建议")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "语音输入" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "添加媒体" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看档案" })).toBeInTheDocument();
  });

  it("submits user input through onSend", () => {
    const onSend = vi.fn();
    render(<ChatFlow messages={[]} onSend={onSend} pending={false} />);

    fireEvent.change(screen.getByPlaceholderText("输入你的问题..."), {
      target: { value: "今天训练怎么安排" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送" }));

    expect(onSend).toHaveBeenCalledWith("今天训练怎么安排");
  });
});
