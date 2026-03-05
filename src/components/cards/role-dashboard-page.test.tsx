import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RoleDashboardPage } from "./role-dashboard-page";

const replace = vi.fn();
const setCards = vi.fn();
const setLoading = vi.fn();
const setError = vi.fn();

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
    loading: false,
    warning: null,
    isAuthenticated: false,
    sessionEmail: null,
    children: [],
    selectedChildId: null,
    accessToken: null,
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

describe("RoleDashboardPage", () => {
  beforeEach(() => {
    replace.mockReset();
    setCards.mockReset();
    setLoading.mockReset();
    setError.mockReset();
  });

  it("renders role business panel under dashboard section", () => {
    render(<RoleDashboardPage title="医生端看板" role="doctor" roleLabel="医生" />);

    expect(screen.getByRole("heading", { name: "风险分诊待办" })).toBeInTheDocument();
  });
});
