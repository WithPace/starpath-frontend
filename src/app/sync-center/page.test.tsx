import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SyncCenterPage from "./page";

describe("SyncCenterPage", () => {
  it("renders failed task retry list", () => {
    render(<SyncCenterPage />);

    expect(screen.getByRole("heading", { name: "同步中心", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "重试失败任务" })).toBeInTheDocument();
  });
});
