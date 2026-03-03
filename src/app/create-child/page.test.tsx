import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CreateChildPage from "./page";

const createChildProfileMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => ({ mocked: true }),
}));

vi.mock("@/lib/prototype/parent-data-access", () => ({
  createChildProfile: (...args: unknown[]) => createChildProfileMock(...args),
}));

describe("CreateChildPage", () => {
  beforeEach(() => {
    createChildProfileMock.mockReset();
  });

  it("submits to createChildProfile and shows success state", async () => {
    createChildProfileMock.mockResolvedValueOnce({ childId: "child-1", warnings: [] });
    render(<CreateChildPage />);

    fireEvent.change(screen.getByLabelText("昵称"), { target: { value: "乐乐" } });
    fireEvent.change(screen.getByLabelText("年龄"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "保存并生成档案" }));

    await waitFor(() => expect(createChildProfileMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText("档案已保存")).toBeInTheDocument();
  });

  it("shows error state when createChildProfile fails", async () => {
    createChildProfileMock.mockRejectedValueOnce(new Error("写入失败"));
    render(<CreateChildPage />);

    fireEvent.change(screen.getByLabelText("昵称"), { target: { value: "乐乐" } });
    fireEvent.change(screen.getByLabelText("年龄"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "保存并生成档案" }));

    await waitFor(() => expect(createChildProfileMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText("写入失败")).toBeInTheDocument();
  });
});
