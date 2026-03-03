import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import VoiceRecordPage from "./page";

const saveVoiceRecordMock = vi.fn();

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    selectedChildId: "child-1",
  }),
}));

vi.mock("@/lib/supabase/client", () => ({
  tryCreateBrowserSupabaseClient: () => ({ mocked: true }),
}));

vi.mock("@/lib/prototype/parent-data-access", () => ({
  saveVoiceRecord: (...args: unknown[]) => saveVoiceRecordMock(...args),
  listRecentVoiceRecords: async () => [],
}));

describe("VoiceRecordPage", () => {
  beforeEach(() => {
    saveVoiceRecordMock.mockReset();
  });

  it("saves note to life records and shows success state", async () => {
    saveVoiceRecordMock.mockResolvedValueOnce({ lifeRecordId: "life-1" });

    render(<VoiceRecordPage />);

    fireEvent.change(screen.getByLabelText("训练记录内容"), {
      target: { value: "今天在任务切换时出现哭闹，2分钟后恢复" },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存记录" }));

    await waitFor(() => expect(saveVoiceRecordMock).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/记录已保存/)).toBeInTheDocument();
  });
});
