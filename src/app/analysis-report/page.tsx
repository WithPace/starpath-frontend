"use client";

import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import { extractDomainScores, type DomainScore } from "@/lib/prototype/parent-data";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

type ProfileRow = {
  domain_levels: unknown;
  overall_summary: string | null;
  assessed_at: string | null;
};

function computeOverall(scores: DomainScore[]): number | null {
  const available = scores.map((item) => item.score).filter((value): value is number => value !== null);
  if (available.length === 0) return null;
  return Math.round(available.reduce((sum, value) => sum + value, 0) / available.length);
}

export default function AnalysisReportPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [scores, setScores] = useState<DomainScore[]>(extractDomainScores(null));
  const [overallText, setOverallText] = useState(
    "综合评分暂无，待生成首次能力画像后自动更新。",
  );
  const [abcText, setAbcText] = useState(
    "前因：任务切换/疲劳；行为：哭闹+逃避；结果：安抚后恢复，建议预告切换并提供视觉支持。",
  );
  const [suggestionText, setSuggestionText] = useState(
    "点击 AI 生成干预建议，系统会基于领域评分和行为记录生成家庭执行方案。",
  );
  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认分析。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认分析。"
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

      const profilesResp = await activeClient
        .from("children_profiles")
        .select("domain_levels,overall_summary,assessed_at")
        .eq("child_id", childId)
        .order("assessed_at", { ascending: false })
        .limit(2);

      const abcResp = await activeClient
        .from("life_records")
        .select("summary")
        .eq("child_id", childId)
        .eq("type", "behavior_event")
        .order("occurred_at", { ascending: false })
        .limit(1);

      if (profilesResp.error || abcResp.error) {
        const message = profilesResp.error?.message ?? abcResp.error?.message ?? "分析读取失败";
        setErrorText(message);
        setLoading(false);
        return;
      }

      const profileRows = (profilesResp.data as ProfileRow[] | null) ?? [];
      const latest = profileRows[0];
      const previous = profileRows[1];

      const latestScores = extractDomainScores(latest?.domain_levels ?? null);
      const currentOverall = computeOverall(latestScores);
      const previousOverall = computeOverall(extractDomainScores(previous?.domain_levels ?? null));

      let overview = "综合评分暂无，待生成首次能力画像后自动更新。";
      if (currentOverall !== null && previousOverall !== null) {
        overview = `综合评分 ${previousOverall} → ${currentOverall}，${latest?.overall_summary ?? "能力趋势持续更新中。"} `;
      } else if (currentOverall !== null) {
        overview = `综合评分 ${currentOverall}，${latest?.overall_summary ?? "已生成最新能力画像。"} `;
      }

      const abcRows = (abcResp.data as Array<{ summary: string | null }> | null) ?? [];
      const nextAbcText =
        abcRows[0]?.summary ??
        "前因：任务切换/疲劳；行为：哭闹+逃避；结果：安抚后恢复，建议预告切换并提供视觉支持。";

      setScores(latestScores);
      setOverallText(overview);
      setAbcText(nextAbcText);
      setLoading(false);
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId]);

  const generateIntervention = () => {
    setGenerating(true);
    const weakDomains = scores
      .filter((item): item is DomainScore & { score: number } => item.score !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, 2)
      .map((item) => item.label);
    const weakText = weakDomains.length > 0 ? weakDomains.join("、") : "训练基础能力";
    setSuggestionText(`建议优先强化 ${weakText}，每天 2 轮短训练（每轮 8-10 分钟），并保留 1 条 ABC 复盘。`);
    setGenerating(false);
  };

  return (
    <ParentShell title="分析报告" subtitle="近 3 个月综合发展变化" activePath="/quick-menu">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>综合发展分析报告</h2>
          <button
            type="button"
            className="button-primary"
            onClick={generateIntervention}
            disabled={generating}
          >
            {generating ? "生成中..." : "AI 生成干预建议"}
          </button>
        </div>
        <p className="proto-muted">{overallText}</p>
        <p className="proto-muted">{suggestionText}</p>
        {loading ? <p className="proto-muted">分析加载中...</p> : null}
        {blockingReason || errorText ? (
          <p className="proto-muted">分析降级：{blockingReason ?? errorText}</p>
        ) : null}
      </section>

      <section className="proto-panel">
        <h3>六大领域评分</h3>
        <ul className="proto-bullets">
          {scores.map((item) => (
            <li key={item.key}>
              {item.label}：{item.score ?? "--"}
            </li>
          ))}
        </ul>
      </section>

      <section className="proto-panel">
        <h3>行为 ABC 分析</h3>
        <p className="proto-muted">{abcText}</p>
      </section>
    </ParentShell>
  );
}
