import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ParentShell } from "./parent-shell";

describe("ParentShell", () => {
  it("renders title, capsule controls and bottom navigation", () => {
    render(
      <ParentShell title="星途AI" subtitle="原型页面">
        <div>body</div>
      </ParentShell>,
    );

    expect(screen.getByRole("heading", { name: "星途AI" })).toBeInTheDocument();
    expect(screen.getByLabelText("胶囊菜单")).toBeInTheDocument();
    expect(screen.getByLabelText("关闭页面")).toBeInTheDocument();
    expect(screen.getByLabelText("parent-bottom-nav")).toBeInTheDocument();
  });
});
