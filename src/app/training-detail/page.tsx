"use client";

import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import { groupSessionsByDay, type TrainingSessionLite } from "@/lib/prototype/parent-data";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

const weekOptions = ["本周", "上周", "上上周"] as const;

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function resolveRange(label: (typeof weekOptions)[number]): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);

  const weekOffset = label === "本周" ? 0 : label === "上周" ? 1 : 2;
  monday.setDate(monday.getDate() - weekOffset * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: toDateOnly(monday),
    end: toDateOnly(sunday),
  };
}

export default function TrainingDetailPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [week, setWeek] = useState<(typeof weekOptions)[number]>("本周");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TrainingSessionLite[]>([]);
  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认详情。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认详情。"
      : null;

  useEffect(() => {
    const activeClient = client;
    const childId = runtime.selectedChildId;
    if (blockingReason || !activeClient || !childId) {
      return;
    }

    const run = async () => {
      setLoading(true);
      setErrorText(null);

      const range = resolveRange(week);
      const resp = await activeClient
        .from("training_sessions")
        .select("session_date,target_skill,duration_minutes,success_rate,notes")
        .eq("child_id", childId)
        .gte("session_date", range.start)
        .lte("session_date", range.end)
        .order("session_date", { ascending: false })
        .limit(80);

      if (resp.error) {
        setErrorText(resp.error.message);
        setLoading(false);
        return;
      }

      setSessions((resp.data as TrainingSessionLite[] | null) ?? []);
      setLoading(false);
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId, week]);

  const dayGroups = groupSessionsByDay(sessions);
  const detailLines =
    dayGroups.length > 0
      ? dayGroups.map((group) => {
          const skills = group.sessions
            .map((session) => session.target_skill)
            .filter((value): value is string => Boolean(value));
          const skillText = skills.length > 0 ? skills.join(" / ") : "未标注技能";
          const scoreText = group.averageSuccessRate !== null ? `${group.averageSuccessRate}%` : "--";
          return `${group.date}：${skillText}（${group.totalMinutes} 分钟，成功率 ${scoreText}）`;
        })
      : ["周一：共同注意 + 吹泡泡游戏（15 分钟）", "周三：情绪识别 + 指令跟随（20 分钟）"];

  return (
    <ParentShell title="训练详情" subtitle="周切换 + 日期锚点导航" activePath="/quick-menu">
      <section className="proto-panel">
        <h2>详细训练记录</h2>
        <p className="proto-muted">周切换</p>
        <div className="proto-chip-row" aria-label="week-switch">
          {weekOptions.map((item) => (
            <button
              key={item}
              type="button"
              className={item === week ? "chip-button active" : "chip-button"}
              onClick={() => setWeek(item)}
            >
              {item}
            </button>
          ))}
        </div>
        {loading ? <p className="proto-muted">详情加载中...</p> : null}
        {blockingReason || errorText ? (
          <p className="proto-muted">详情降级：{blockingReason ?? errorText}</p>
        ) : null}
      </section>

      <section className="proto-panel">
        <h3>{week} · 日期锚点</h3>
        <ul className="proto-bullets">
          {detailLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}
