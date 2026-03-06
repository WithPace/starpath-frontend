import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoleDashboardPage } from "./role-dashboard-page";
import { applyDashboardCardFallback } from "@/lib/runtime/dashboard-cards";

const replace = vi.fn();
const setCards = vi.fn();
const setLoading = vi.fn();
const setError = vi.fn();
const callOrchestrator = vi.fn();

let runtimeState = {
  loading: false,
  warning: null as string | null,
  isAuthenticated: false,
  sessionEmail: null as string | null,
  children: [] as Array<{ id: string; name: string }>,
  selectedChildId: null as string | null,
  accessToken: null as string | null,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
  }),
}));

vi.mock("@/lib/runtime/use-protected-route", () => ({
  useProtectedRoute: () => ({ allow: true }),
}));

vi.mock("@/lib/runtime/use-role-runtime", () => ({
  useRoleRuntime: () => ({
    ...runtimeState,
    setSelectedChildId: vi.fn(),
    refresh: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
  }),
}));

vi.mock("@/stores/dashboard-store", () => ({
  useDashboardStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      getCards: () => [],
      isLoading: () => false,
      getError: () => null,
      setCards,
      setLoading,
      setError,
    }),
}));

vi.mock("@/lib/api/orchestrator-client", () => ({
  callOrchestrator: (...args: unknown[]) => callOrchestrator(...args),
}));

vi.mock("@/lib/env", () => ({
  readFrontendEnv: () => ({ apiBaseUrl: "https://example.com/functions/v1/orchestrator" }),
}));

describe("RoleDashboardPage", () => {
  beforeEach(() => {
    replace.mockReset();
    setCards.mockReset();
    setLoading.mockReset();
    setError.mockReset();
    callOrchestrator.mockReset();

    runtimeState = {
      loading: false,
      warning: null,
      isAuthenticated: false,
      sessionEmail: null,
      children: [],
      selectedChildId: null,
      accessToken: null,
    };
  });

  it("renders role business panel under dashboard section", () => {
    render(<RoleDashboardPage title="医生端看板" role="doctor" roleLabel="医生" />);

    expect(screen.getByRole("heading", { name: "风险分诊待办" })).toBeInTheDocument();
  });

  it("uses deterministic fallback cards when dashboard request fails", async () => {
    runtimeState = {
      ...runtimeState,
      isAuthenticated: true,
      selectedChildId: "child-1",
      accessToken: "token-1",
    };
    callOrchestrator.mockRejectedValueOnce(new Error("network error"));

    render(<RoleDashboardPage title="家长端看板" role="parent" roleLabel="家长" />);

    await waitFor(() => {
      expect(setCards).toHaveBeenCalledWith("parent", applyDashboardCardFallback([], "parent"));
    });
  });
});
