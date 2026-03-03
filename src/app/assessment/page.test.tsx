import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AssessmentPage from "./page";

const saveAssessmentMock = vi.fn();

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => ({ mocked: true }),
}));

vi.mock("@/lib/prototype/parent-data-access", () => ({
  saveAssessment: (...args: unknown[]) => saveAssessmentMock(...args),
  listRecentAssessments: async () => [],
}));

describe("AssessmentPage", () => {
  beforeEach(() => {
    saveAssessmentMock.mockReset();
  });

  it("answers all questions and persists assessment", async () => {
    saveAssessmentMock.mockResolvedValueOnce({
      assessmentId: "assessment-1",
      score: 33,
      riskLevel: "medium",
    });

    render(<AssessmentPage />);

    fireEvent.click(screen.getByRole("button", { name: "是" }));
    fireEvent.click(screen.getByRole("button", { name: "否" }));
    fireEvent.click(screen.getByRole("button", { name: "偶尔" }));

    await waitFor(() => expect(saveAssessmentMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/评估已保存/)).toBeInTheDocument();
  });
});
