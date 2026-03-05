import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DataConsentPage from "./page";

describe("DataConsentPage", () => {
  it("renders consent scope and revoke action", () => {
    render(<DataConsentPage />);

    expect(screen.getByRole("heading", { name: "数据授权管理", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "撤回授权" })).toBeInTheDocument();
  });
});
