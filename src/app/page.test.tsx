import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("Home", () => {
  it("shows multi-role launchboard", () => {
    render(<Home />);

    expect(screen.getByText("StarPath 多角色工作台")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "家长端 · 对话" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "家长端 · 业务链路" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "医生端 · 看板" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "特教老师端 · 对话" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "机构成员管理" })).toBeInTheDocument();
  });

  it("shows go-live checklist section", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { name: "上线前检查" })).toBeInTheDocument();
  });
});
