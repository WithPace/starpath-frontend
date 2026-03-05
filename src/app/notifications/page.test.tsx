import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotificationsPage from "./page";

describe("NotificationsPage", () => {
  it("renders notification tabs and unread states", () => {
    render(<NotificationsPage />);

    expect(screen.getByRole("heading", { name: "通知中心", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "仅看未读" })).toBeInTheDocument();
  });
});
