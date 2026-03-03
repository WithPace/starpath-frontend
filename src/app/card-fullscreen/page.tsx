"use client";

import { useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import { extractDomainScores, summarizeTrainingTrend } from "@/lib/prototype/parent-data";
import {
  listLatestChildProfile,
  listRecentAssessments,
  listRecentTrainingSessions,
  type AssessmentHistoryRow,
  type LatestChildProfile,
  type TrainingSessionRecord,
} from "@/lib/prototype/parent-data-access";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

type CardTab = "trend" | "radar" | "assessment";

export default function CardFullscreenPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [tab, setTab] = useState<CardTab>("trend");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TrainingSessionRecord[]>([]);
  const [profile, setProfile] = useState<LatestChildProfile | null>(null);
  const [assessments, setAssessments] = useState<AssessmentHistoryRow[]>([]);

  const blockingReason = !client
    ? "缺少 Supabase 前端配置，展示默认卡片。"
    : !runtime.selectedChildId
      ? "未选择 child_id，展示默认卡片。"
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
        const [nextSessions, nextProfile, nextAssessments] = await Promise.all([
          listRecentTrainingSessions(activeClient, childId, 80),
          listLatestChildProfile(activeClient, childId),
          listRecentAssessments(activeClient, childId, 6),
        ]);
        setSessions(nextSessions);
        setProfile(nextProfile);
        setAssessments(nextAssessments);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "卡片数据读取失败。");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [blockingReason, client, runtime.selectedChildId]);

  const trend = summarizeTrainingTrend(sessions);
  const domainScores = extractDomainScores(profile?.domain_levels ?? null);
  const latestAssessment = assessments[0];

  return (
    <ParentShell title="卡片全屏" subtitle="缩略卡片展开后的沉浸视图" activePath="/quick-menu" hideBottomNav>
      <section className="proto-panel">
        <div className="proto-chip-row">
          <button type="button" className={tab === "trend" ? "chip-button active" : "chip-button"} onClick={() => setTab("trend")}>
            训练趋势
          </button>
          <button type="button" className={tab === "radar" ? "chip-button active" : "chip-button"} onClick={() => setTab("radar")}>
            能力画像
          </button>
          <button type="button" className={tab === "assessment" ? "chip-button active" : "chip-button"} onClick={() => setTab("assessment")}>
            评估报告
          </button>
        </div>
      </section>

      <section className="proto-panel proto-chart-panel">
        {loading ? <p className="proto-muted">卡片数据加载中...</p> : null}
        {blockingReason || errorText ? (
          <p className="proto-muted">卡片降级：{blockingReason ?? errorText}</p>
        ) : null}

        {tab === "trend" ? (
          <>
            <h2>近30天训练概览</h2>
            <ul className="proto-bullets">
              <li>训练次数：{trend.last30DaysSessions}</li>
              <li>近7天训练：{trend.last7DaysSessions}</li>
              <li>总时长：{trend.totalMinutes} 分钟</li>
              <li>平均成功率：{trend.averageSuccessRate ?? "--"}%</li>
            </ul>
          </>
        ) : null}

        {tab === "radar" ? (
          <>
            <h2>六领域能力画像（动态）</h2>
            <ul className="proto-bullets">
              {domainScores.map((item) => (
                <li key={item.key}>
                  {item.label}：{item.score ?? "--"}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {tab === "assessment" ? (
          <>
            <h2>最近评估记录（动态）</h2>
            {latestAssessment ? (
              <ul className="proto-bullets">
                {assessments.map((item) => {
                  const score =
                    item.result && typeof item.result.score === "number" ? item.result.score : "--";
                  return (
                    <li key={item.id}>
                      {item.created_at?.slice(0, 10) ?? "未知日期"} · 风险 {item.risk_level ?? "--"} · 评分 {score}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="proto-muted">暂无评估记录。</p>
            )}
          </>
        ) : null}
      </section>
    </ParentShell>
  );
}
