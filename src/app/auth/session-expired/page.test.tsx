import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import SessionExpiredPage from "./page";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
  useSearchParams: () =>
    new URLSearchParams({
      next: "/chat",
    }),
}));

describe("SessionExpiredPage", () => {
  it("renders session-expired recovery actions", () => {
    render(<SessionExpiredPage />);

    expect(screen.getByRole("heading", { name: "会话已过期" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "重新登录" }));
    expect(replace).toHaveBeenCalledWith("/auth?next=%2Fchat");
  });
});
