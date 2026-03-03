import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsPage from "./page";

const getCurrentUserProfileMock = vi.fn();
const saveParentNicknameMock = vi.fn();

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    signOut: vi.fn(async () => {}),
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => ({ mocked: true }),
}));

vi.mock("@/lib/prototype/parent-data-access", () => ({
  getCurrentUserProfile: (...args: unknown[]) => getCurrentUserProfileMock(...args),
  saveParentNickname: (...args: unknown[]) => saveParentNicknameMock(...args),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    getCurrentUserProfileMock.mockReset();
    saveParentNicknameMock.mockReset();
    getCurrentUserProfileMock.mockResolvedValue({
      userId: "user-1",
      name: "乐乐妈妈",
      phone: "13800000000",
    });
  });

  it("saves nickname from account tab", async () => {
    saveParentNicknameMock.mockResolvedValue({ name: "新昵称" });

    render(<SettingsPage />);

    fireEvent.change(screen.getByLabelText("昵称"), { target: { value: "新昵称" } });
    fireEvent.click(screen.getByRole("button", { name: "保存昵称" }));

    await waitFor(() => expect(saveParentNicknameMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/昵称已更新/)).toBeInTheDocument();
  });
});
