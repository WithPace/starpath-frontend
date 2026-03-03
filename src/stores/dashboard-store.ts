import { create } from "zustand";

import type { OrchestratorRole } from "@/lib/api/orchestrator-client";

export type DashboardCard = {
  card_type: string;
  title: string;
  [key: string]: unknown;
};

type RoleDashboardState = {
  cards: DashboardCard[];
  loading: boolean;
  error: string | null;
};

type DashboardState = {
  sessions: Record<OrchestratorRole, RoleDashboardState>;
  getCards: (role: OrchestratorRole) => DashboardCard[];
  isLoading: (role: OrchestratorRole) => boolean;
  getError: (role: OrchestratorRole) => string | null;
  setCards: (role: OrchestratorRole, cards: DashboardCard[]) => void;
  setLoading: (role: OrchestratorRole, loading: boolean) => void;
  setError: (role: OrchestratorRole, error: string | null) => void;
  reset: (role: OrchestratorRole) => void;
};

function createRoleDashboardState(): RoleDashboardState {
  return {
    cards: [],
    loading: false,
    error: null,
  };
}

function updateRoleState(
  sessions: Record<OrchestratorRole, RoleDashboardState>,
  role: OrchestratorRole,
  updater: (state: RoleDashboardState) => RoleDashboardState,
): Record<OrchestratorRole, RoleDashboardState> {
  return {
    ...sessions,
    [role]: updater(sessions[role]),
  };
}

const initialSessions: Record<OrchestratorRole, RoleDashboardState> = {
  parent: createRoleDashboardState(),
  doctor: createRoleDashboardState(),
  teacher: createRoleDashboardState(),
  org_admin: createRoleDashboardState(),
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  sessions: initialSessions,
  getCards: (role) => get().sessions[role].cards,
  isLoading: (role) => get().sessions[role].loading,
  getError: (role) => get().sessions[role].error,
  setCards: (role, cards) =>
    set((state) => ({
      sessions: updateRoleState(state.sessions, role, (roleState) => ({
        ...roleState,
        cards,
      })),
    })),
  setLoading: (role, loading) =>
    set((state) => ({
      sessions: updateRoleState(state.sessions, role, (roleState) => ({
        ...roleState,
        loading,
      })),
    })),
  setError: (role, error) =>
    set((state) => ({
      sessions: updateRoleState(state.sessions, role, (roleState) => ({
        ...roleState,
        error,
      })),
    })),
  reset: (role) =>
    set((state) => ({
      sessions: updateRoleState(state.sessions, role, () => createRoleDashboardState()),
    })),
}));
