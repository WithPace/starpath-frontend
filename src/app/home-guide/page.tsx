"use client";

import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import {
  buildHomeGuideSteps,
  extractDomainScores,
  summarizeTrainingTrend,
} from "@/lib/prototype/parent-data";
import {
  listLatestChildProfile,
  listRecentAssessments,
  listRecentTrainingSessions,
} from "@/lib/prototype/parent-data-access";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

export default function HomeGuidePage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([
    "共同注意：吹泡泡 + 指向跟随（10 分钟）",
    "语言仿说：双词短句练习（8 分钟）",
    "生活适应：独立收纳玩具（6 分钟）",
  ]);
  const [tips, setTips] = useState<string[]>([
    "一次只给一个指令，配合手势提示。",
    "完成后立即强化（拥抱/贴纸/口头鼓励）。",
    "情绪波动时先做安抚，再回到任务。",
  ]);
  const [planDigest, setPlanDigest] = useState("建议在晚饭前完成前两项训练，睡前做复盘。");
  const [planVersion, setPlanVersion] = useState(1);

  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认指导。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认指导。"
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
          listRecentAssessments(activeClient, childId, 1),
        ]);

        const domainScores = extractDomainScores(profile?.domain_levels ?? null);
        const trend = summarizeTrainingTrend(sessions);
        const riskLevel = assessments[0]?.risk_level ?? null;

        const nextSteps = buildHomeGuideSteps({
          domainScores,
          riskLevel,
          last7DaysSessions: trend.last7DaysSessions,
        });

        const nextTips = [
          trend.last7DaysSessions < 4
            ? "本周训练频次偏低，建议固定每天 1 个短时训练窗口。"
            : "保持训练节奏，并在不同场景做同技能泛化。",
          riskLevel === "high"
            ? "先安抚再训练，避免连续高负荷任务切换。"
            : "训练前先说明目标，降低任务切换阻力。",
          profile?.overall_summary
            ? `画像摘要：${profile.overall_summary}`
            : "每次训练后写 1 条复盘，便于 AI 持续优化建议。",
        ];
        const digest = `近 7 天训练 ${trend.last7DaysSessions} 次，建议今日总训练 ${
          trend.last7DaysSessions < 4 ? "25" : "35"
        } 分钟，重点先做薄弱项。`;

        setSteps(nextSteps);
        setTips(nextTips);
        setPlanDigest(digest);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "居家指导读取失败。");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId]);

  const regeneratePlan = () => {
    setGenerating(true);
    setErrorText(null);

    setSteps((previous) => {
      if (previous.length < 3) return previous;
      const [first, second, third, ...rest] = previous;
      return [second, first, third, ...rest];
    });
    setTips((previous) => {
      if (previous.length === 0) return previous;
      return [...previous.slice(1), previous[0]];
    });
    setPlanVersion((previous) => previous + 1);
    setPlanDigest((previous) =>
      previous.includes("优先")
        ? "建议按低负荷到高负荷顺序执行，晚间只保留巩固环节。"
        : "建议优先完成目标 1/2，目标 3 根据孩子状态弹性调整。",
    );

    setGenerating(false);
  };

  return (
    <ParentShell title="居家指导" subtitle="按场景拆分的可执行训练建议" activePath="/quick-menu">
      <section className="proto-panel">
        <p className="proto-kicker">08 · 居家指导</p>
        <div className="proto-section-header">
          <h2>今日执行重点（动态）</h2>
          <button type="button" className="button-primary" onClick={regeneratePlan} disabled={generating}>
            {generating ? "生成中..." : "AI 生成今日计划"}
          </button>
        </div>
        <p className="proto-muted">
          版本 V{planVersion} · {planDigest}
        </p>
        {loading ? <p className="proto-muted">指导生成中...</p> : null}
        {blockingReason || errorText ? (
          <p className="proto-muted">指导降级：{blockingReason ?? errorText}</p>
        ) : null}
        <ol className="proto-ordered">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="proto-panel">
        <h3>家庭执行提示</h3>
        <ul className="proto-bullets">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}
