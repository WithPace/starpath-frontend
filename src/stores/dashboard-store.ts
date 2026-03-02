import { create } from "zustand";

export type DashboardCard = {
  card_type: string;
  title: string;
  [key: string]: unknown;
};

type DashboardState = {
  cards: DashboardCard[];
  loading: boolean;
  error: string | null;
  setCards: (cards: DashboardCard[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  cards: [],
  loading: false,
  error: null,
  setCards: (cards) => set({ cards }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
