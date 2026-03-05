import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AuthPage from "./page";

const replace = vi.fn();
const ensureParentRegistration = vi.fn();
let mockClient: {
  auth: {
    getSession: ReturnType<typeof vi.fn>;
    signInWithOtp: ReturnType<typeof vi.fn>;
    verifyOtp: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
  };
} | null = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => mockClient,
}));

vi.mock("@/lib/prototype/parent-data-access", () => ({
  ensureParentRegistration: (...args: unknown[]) => ensureParentRegistration(...args),
}));

describe("AuthPage", () => {
  beforeEach(() => {
    replace.mockReset();
    ensureParentRegistration.mockReset();
    mockClient = null;
  });

  it("renders phone otp auth controls", () => {
    render(<AuthPage />);

    expect(screen.getByRole("heading", { name: "认证与运行时配置" })).toBeInTheDocument();
    expect(screen.getByLabelText("手机号")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发送验证码" })).toBeInTheDocument();
    expect(screen.getByLabelText("验证码")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "验证码登录" })).toBeInTheDocument();
  });

  it("starts resend cooldown after otp is sent", async () => {
    const signInWithOtp = vi.fn(async () => ({ error: null }));
    mockClient = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        signInWithOtp,
        verifyOtp: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => undefined),
      },
    };

    render(<AuthPage />);

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "+8613800138000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "发送验证码" }));

    await waitFor(() => expect(signInWithOtp).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("验证码已发送，请查收短信。")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /重新发送\(\d+s\)/ })).toBeDisabled();
  });

  it("redirects first-login user to /create-child after otp verify", async () => {
    ensureParentRegistration.mockResolvedValue({ isFirstLogin: true, userId: "user-1" });
    mockClient = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        signInWithOtp: vi.fn(async () => ({ error: null })),
        verifyOtp: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => undefined),
      },
    };

    render(<AuthPage />);

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "+8613800138000" },
    });
    fireEvent.change(screen.getByLabelText("验证码"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "验证码登录" }));

    await waitFor(() => expect(ensureParentRegistration).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/create-child"));
  });

  it("redirects returning user to next path after otp verify", async () => {
    ensureParentRegistration.mockResolvedValue({ isFirstLogin: false, userId: "user-1" });
    mockClient = {
      auth: {
        getSession: vi.fn(async () => ({ data: { session: null } })),
        signInWithOtp: vi.fn(async () => ({ error: null })),
        verifyOtp: vi.fn(async () => ({ error: null })),
        signOut: vi.fn(async () => undefined),
      },
    };

    window.history.pushState({}, "", "/auth?next=%2Fchat");
    render(<AuthPage />);

    fireEvent.change(screen.getByLabelText("手机号"), {
      target: { value: "+8613800138000" },
    });
    fireEvent.change(screen.getByLabelText("验证码"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "验证码登录" }));

    await waitFor(() => expect(ensureParentRegistration).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/chat"));
  });
});
