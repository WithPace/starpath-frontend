"use client";

import { useEffect } from "react";

import { DashboardCards } from "@/components/cards/dashboard-cards";
import { useDashboardStore } from "@/stores/dashboard-store";

export default function TeacherDashboardPage() {
  const cards = useDashboardStore((state) => state.cards);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const setCards = useDashboardStore((state) => state.setCards);
  const setLoading = useDashboardStore((state) => state.setLoading);
  const setError = useDashboardStore((state) => state.setError);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCards([
      { card_type: "summary_card", title: "本周教学概览" },
      { card_type: "metric_card", title: "课堂执行提醒" },
    ]);
    setLoading(false);
  }, [setCards, setError, setLoading]);

  return (
    <main>
      <h1>教师端看板</h1>
      <DashboardCards cards={cards} loading={loading} error={error} />
    </main>
  );
}
