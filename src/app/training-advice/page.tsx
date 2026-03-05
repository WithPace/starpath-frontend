"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import { extractDomainScores, summarizeTrainingTrend } from "@/lib/prototype/parent-data";
import {
  listLatestChildProfile,
  listRecentAssessments,
  listRecentTrainingSessions,
} from "@/lib/prototype/parent-data-access";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

type AdviceCard = {
  id: string;
  title: string;
  detail: string;
};

const fallbackCards: AdviceCard[] = [
  {
    id: "focus",
    title: "今日优先目标",
    detail: "优先做共同注意与双向回应练习，每次 8-10 分钟。",
  },
  {
    id: "rhythm",
    title: "训练节奏建议",
    detail: "建议今天完成 2 次短时训练，晚上做一次复盘记录。",
  },
  {
    id: "family",
    title: "家庭协同建议",
    detail: "训练前先说明任务步骤，完成后立即给口头强化。",
  },
];

export default function TrainingAdvicePage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [cards, setCards] = useState<AdviceCard[]>(fallbackCards);
  const [version, setVersion] = useState(1);

  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认训练建议。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认训练建议。"
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
      try {
        const [sessions, profile, assessments] = await Promise.all([
          listRecentTrainingSessions(activeClient, childId, 60),
          listLatestChildProfile(activeClient, childId),
          listRecentAssessments(activeClient, childId, 3),
        ]);

        const domainScores = extractDomainScores(profile?.domain_levels ?? null)
          .filter((item): item is typeof item & { score: number } => item.score !== null)
          .sort((a, b) => a.score - b.score);
        const trend = summarizeTrainingTrend(sessions);
        const weakDomain = domainScores[0]?.label ?? "语言沟通";
        const secondWeakDomain = domainScores[1]?.label ?? "社交互动";
        const riskLevel = assessments[0]?.risk_level ?? "medium";

        const nextCards: AdviceCard[] = [
          {
            id: "focus",
            title: "今日优先目标",
            detail:
              riskLevel === "high"
                ? `先做低负荷稳定训练，重点围绕 ${weakDomain} 和 ${secondWeakDomain}，每轮 6-8 分钟。`
                : `优先强化 ${weakDomain} 与 ${secondWeakDomain}，每轮 10 分钟并加入 1 次泛化。`,
          },
          {
            id: "rhythm",
            title: "训练节奏建议",
            detail:
              trend.last7DaysSessions < 4
                ? "近 7 天频次偏低，建议今天完成 2-3 轮短时训练并记录结果。"
                : "近 7 天节奏稳定，建议保持当前频次并增加一次跨场景练习。",
          },
          {
            id: "family",
            title: "家庭协同建议",
            detail: profile?.overall_summary
              ? `结合当前画像：${profile.overall_summary}`
              : "训练前后保持固定流程：预告任务 -> 执行 -> 立即强化 -> 复盘一句。",
          },
        ];

        setCards(nextCards);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "训练建议读取失败。");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId]);

  const regenerateAdvice = () => {
    setGenerating(true);
    setCards((prev) => {
      if (prev.length < 2) return prev;
      return [prev[1], prev[2], prev[0]];
    });
    setVersion((prev) => prev + 1);
    setGenerating(false);
  };

  return (
    <ParentShell title="训练建议" subtitle="把评估结果转成今天可执行的训练动作" activePath="/quick-menu">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>训练建议</h2>
          <button type="button" className="button-primary" onClick={regenerateAdvice} disabled={generating}>
            {generating ? "生成中..." : "AI 生成训练建议"}
          </button>
        </div>
        <p className="proto-muted">建议版本 V{version}</p>
        {loading ? <p className="proto-muted">建议生成中...</p> : null}
        {blockingReason || errorText ? (
          <p className="proto-muted">建议降级：{blockingReason ?? errorText}</p>
        ) : null}
      </section>

      <section className="proto-panel">
        <ul className="proto-bullets">
          {cards.map((card) => (
            <li key={card.id}>
              <strong>{card.title}</strong>
              <p className="proto-muted">{card.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="proto-panel">
        <div className="proto-actions">
          <Link href="/home-guide" className="button-primary">
            进入居家指导
          </Link>
          <Link href="/training-weekly" className="button-secondary">
            查看训练周报
          </Link>
        </div>
      </section>
    </ParentShell>
  );
}
