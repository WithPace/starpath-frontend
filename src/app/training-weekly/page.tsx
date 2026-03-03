"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import { summarizeTrainingSessions, type TrainingSessionLite } from "@/lib/prototype/parent-data";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export default function TrainingWeeklyPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TrainingSessionLite[]>([]);
  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认周报。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认周报。"
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

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);

      const resp = await activeClient
        .from("training_sessions")
        .select("session_date,target_skill,duration_minutes,success_rate,notes")
        .eq("child_id", childId)
        .gte("session_date", toDateOnly(weekAgo))
        .order("session_date", { ascending: false })
        .limit(50);

      if (resp.error) {
        setErrorText(resp.error.message);
        setLoading(false);
        return;
      }

      setSessions((resp.data as TrainingSessionLite[] | null) ?? []);
      setLoading(false);
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId]);

  const summary = summarizeTrainingSessions(sessions);
  const listItems =
    sessions.length > 0
      ? sessions.map((item, index) => ({
          key: `${item.session_date ?? "unknown"}-${index}`,
          day: item.session_date ?? "未知日期",
          skill: item.target_skill ?? "未标注技能",
          score:
            typeof item.success_rate === "number"
              ? (Math.round((item.success_rate / 20) * 10) / 10).toFixed(1)
              : "--",
        }))
      : [
          { key: "fallback-1", day: "周一", skill: "共同注意", score: "--" },
          { key: "fallback-2", day: "周三", skill: "情绪识别", score: "--" },
        ];

  return (
    <ParentShell title="一周训练记录" subtitle="训练频次、完成度与领域进展" activePath="/quick-menu">
      <section className="proto-panel">
        <h2>一周训练记录</h2>
        <p className="proto-muted">
          训练天数 {summary.trainingDays} 天 · 完成项目 {summary.sessionCount} 项 · 平均评分{" "}
          {summary.averageScore5 ?? "--"}
        </p>
        {loading ? <p className="proto-muted">周报加载中...</p> : null}
        {blockingReason || errorText ? (
          <p className="proto-muted">周报降级：{blockingReason ?? errorText}</p>
        ) : null}
        <ul className="proto-bullets">
          {listItems.map((item) => (
            <li key={item.key}>
              {item.day} · {item.skill} · 评分 {item.score}
            </li>
          ))}
        </ul>
        <Link href="/training-detail" className="button-primary">
          查看详细记录
        </Link>
      </section>
    </ParentShell>
  );
}
