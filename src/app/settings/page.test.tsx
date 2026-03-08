import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SettingsPage from "./page";

const getCurrentUserProfileMock = vi.fn();
const saveParentNicknameMock = vi.fn();
const signOutMock = vi.fn(async () => {});

let runtimeState = {
  accessToken: null as string | null,
  isAuthenticated: true,
  loading: false,
};

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    ...runtimeState,
    signOut: signOutMock,
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
    signOutMock.mockReset();
    getCurrentUserProfileMock.mockReset();
    saveParentNicknameMock.mockReset();
    runtimeState = {
      accessToken: null,
      isAuthenticated: true,
      loading: false,
    };
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

  it("creates manual session nickname path when no auth session exists", async () => {
    runtimeState = {
      accessToken: "manual-token",
      isAuthenticated: false,
      loading: false,
    };
    getCurrentUserProfileMock.mockResolvedValue(null);
    saveParentNicknameMock.mockRejectedValue(new Error("请先登录后再修改昵称。"));

    render(<SettingsPage />);

    fireEvent.change(screen.getByLabelText("昵称"), { target: { value: "手动会话昵称" } });
    fireEvent.click(screen.getByRole("button", { name: "保存昵称" }));

    await waitFor(() => {
      expect(screen.getByText("昵称已更新：手动会话昵称")).toBeInTheDocument();
    });
    expect(saveParentNicknameMock).not.toHaveBeenCalled();
  });

  it("shows legal and feedback route links", async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByRole("button", { name: "法律信息" }));
    expect(screen.getByRole("link", { name: "用户协议" })).toHaveAttribute("href", "/legal/terms");
    expect(screen.getByRole("link", { name: "隐私政策" })).toHaveAttribute("href", "/legal/privacy");

    fireEvent.click(screen.getByRole("button", { name: "其他" }));
    expect(screen.getByRole("link", { name: "关于星途" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "意见反馈" })).toHaveAttribute("href", "/feedback");
    expect(screen.getByRole("link", { name: "升级 VIP" })).toHaveAttribute("href", "/vip");
    expect(screen.getByRole("link", { name: "注销账号" })).toHaveAttribute("href", "/account-close");
  });
});
