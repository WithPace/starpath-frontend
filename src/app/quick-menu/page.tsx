"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import { summarizeTrainingSessions, type TrainingSessionLite } from "@/lib/prototype/parent-data";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

const menuItems = [
  { name: "孩子档案", href: "/create-child", icon: "👶" },
  { name: "数据看板", href: "/dashboard", icon: "📊" },
  { name: "评估报告", href: "/assessment", icon: "🧪" },
  { name: "训练记录", href: "/training-weekly", icon: "📋" },
  { name: "情绪日历", href: "/analysis-report", icon: "😊" },
  { name: "生活记录", href: "/voice-record", icon: "📅" },
  { name: "照护团队", href: "/org-admin/members", icon: "👥" },
  { name: "成就墙", href: "/card-fullscreen", icon: "⭐" },
];

type LifeRecordLite = {
  type: string;
  summary: string | null;
  occurred_at: string | null;
};

function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export default function QuickMenuPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLines, setSummaryLines] = useState<string[]>([
    "训练暂无数据，先从对话生成训练计划。",
    "情绪暂无记录，建议每天记录 1 次。",
    "里程碑：待生成（完成首次训练后自动出现）。",
  ]);
  const fallbackLines = [
    "训练暂无数据，先从对话生成训练计划。",
    "情绪暂无记录，建议每天记录 1 次。",
    "里程碑：待生成（完成首次训练后自动出现）。",
  ];
  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认摘要。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认摘要。"
      : null;

  useEffect(() => {
    const activeClient = client;
    const childId = runtime.selectedChildId;
    if (blockingReason || !activeClient || !childId) {
      return;
    }

    const run = async () => {
      setLoadingSummary(true);
      setSummaryError(null);

      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);

      const [sessionsResp, emotionsResp] = await Promise.all([
        activeClient
          .from("training_sessions")
          .select("session_date,target_skill,duration_minutes,success_rate,notes")
          .eq("child_id", childId)
          .gte("session_date", toDateOnly(weekAgo))
          .order("session_date", { ascending: false })
          .limit(40),
        activeClient
          .from("life_records")
          .select("type,summary,occurred_at")
          .eq("child_id", childId)
          .eq("type", "emotion")
          .gte("occurred_at", weekAgo.toISOString())
          .order("occurred_at", { ascending: false })
          .limit(40),
      ]);

      if (sessionsResp.error || emotionsResp.error) {
        const message =
          sessionsResp.error?.message ?? emotionsResp.error?.message ?? "摘要读取失败";
        setSummaryError(message);
        setLoadingSummary(false);
        return;
      }

      const sessions = (sessionsResp.data as TrainingSessionLite[] | null) ?? [];
      const emotions = (emotionsResp.data as LifeRecordLite[] | null) ?? [];

      const summary = summarizeTrainingSessions(sessions);
      const latestSkill = sessions.find((row) => Boolean(row.target_skill))?.target_skill ?? "暂无";

      const line1 =
        summary.sessionCount > 0
          ? `训练 ${summary.sessionCount} 次 · ${summary.totalMinutes} 分钟 · 平均成功率 ${summary.averageSuccessRate ?? 0}%`
          : "训练暂无数据，先从对话生成训练计划。";
      const line2 =
        emotions.length > 0
          ? `情绪记录 ${emotions.length} 条 · 近 7 天持续追踪`
          : "情绪暂无记录，建议每天记录 1 次。";
      const line3 = `里程碑：最近重点技能 ${latestSkill}`;

      setSummaryLines([line1, line2, line3]);
      setLoadingSummary(false);
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId]);

  return (
    <ParentShell title="快捷菜单" subtitle="从对话快速跳转到关键能力页" activePath="/quick-menu">
      <section className="proto-panel">
        <header className="proto-section-header">
          <h2>快捷入口</h2>
          <Link href="/chat" className="button-link">返回对话</Link>
        </header>
        <div className="proto-grid-8">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href} className="proto-grid-item">
              <span className="proto-grid-icon">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="proto-panel">
        <h3>本周数据摘要</h3>
        {loadingSummary ? <p className="proto-muted">摘要加载中...</p> : null}
        {blockingReason || summaryError ? (
          <p className="proto-muted">摘要降级：{blockingReason ?? summaryError}</p>
        ) : null}
        <ul className="proto-bullets">
          {(blockingReason ? fallbackLines : summaryLines).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}
