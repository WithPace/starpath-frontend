"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import {
  listRecentAssessments,
  saveAssessment,
  type AssessmentHistoryRow,
  type AssessmentRiskLevel,
} from "@/lib/prototype/parent-data-access";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

const questions = [
  "孩子会主动看向你指向的物体吗？",
  "孩子会用手指向想要的东西吗？",
  "孩子会模仿你的动作或表情吗？",
];

function toRiskLabel(value: AssessmentRiskLevel): string {
  if (value === "high") return "高风险";
  if (value === "medium") return "中风险";
  return "低风险";
}

export default function AssessmentPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveResult, setSaveResult] = useState<{
    assessmentId: string;
    riskLevel: AssessmentRiskLevel;
    score: number;
  } | null>(null);
  const [historyRows, setHistoryRows] = useState<AssessmentHistoryRow[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const completed = answers.length >= questions.length;
  const blockingReason = !client
    ? "缺少 Supabase 前端配置。"
    : !runtime.selectedChildId
      ? "未选择 child_id。"
      : null;

  const refreshHistory = useCallback(
    async (childId: string) => {
      if (!client) return;
      try {
        const rows = await listRecentAssessments(client, childId, 5);
        setHistoryRows(rows);
        setHistoryError(null);
      } catch (error) {
        setHistoryError(error instanceof Error ? error.message : "历史评估读取失败。");
      }
    },
    [client],
  );

  useEffect(() => {
    const childId = runtime.selectedChildId;
    if (!client || !childId) {
      return;
    }
    void refreshHistory(childId);
  }, [client, refreshHistory, runtime.selectedChildId]);

  const persistAssessment = async (nextAnswers: string[]) => {
    if (!client || !runtime.selectedChildId) {
      setSaveError("缺少运行时上下文，无法保存评估。");
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      const result = await saveAssessment(client, {
        childId: runtime.selectedChildId,
        answers: nextAnswers,
        questionSet: "mchat-lite-v1",
      });
      setSaveResult(result);
      await refreshHistory(runtime.selectedChildId);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "评估保存失败。");
    } finally {
      setSaving(false);
    }
  };

  const answer = (value: string) => {
    const nextAnswers = [...answers, value];
    setAnswers(nextAnswers);
    setIndex((prev) => prev + 1);
    if (nextAnswers.length === questions.length) {
      void persistAssessment(nextAnswers);
    }
  };

  return (
    <ParentShell title="M-CHAT 筛查" subtitle="对话式评估，逐题引导" activePath="/quick-menu">
      <section className="proto-panel">
        <p className="proto-kicker">07 · 评估页</p>
        {!completed ? (
          <>
            <h2>第 {index + 1} 题</h2>
            <p>{questions[index]}</p>
            <div className="proto-actions">
              <button type="button" className="button-primary" onClick={() => answer("是")} disabled={saving}>
                是
              </button>
              <button type="button" className="button-secondary" onClick={() => answer("否")} disabled={saving}>
                否
              </button>
              <button type="button" className="button-secondary" onClick={() => answer("偶尔")} disabled={saving}>
                偶尔
              </button>
            </div>
          </>
        ) : (
          <>
            <h2>评估完成</h2>
            <p className="proto-muted">已完成 {answers.length} 题，建议继续查看训练建议与居家指导。</p>
            {saving ? <p className="proto-muted">评估保存中...</p> : null}
            {saveResult ? (
              <p className="proto-muted">
                评估已保存：风险 {toRiskLabel(saveResult.riskLevel)} · 评分 {saveResult.score}
              </p>
            ) : null}
            {saveError ? <p className="proto-muted">保存失败：{saveError}</p> : null}
          </>
        )}
        {blockingReason ? <p className="proto-muted">运行时降级：{blockingReason}</p> : null}
      </section>

      <section className="proto-panel">
        <h3>最近评估记录</h3>
        {historyError ? <p className="proto-muted">历史读取失败：{historyError}</p> : null}
        {historyRows.length === 0 ? (
          <p className="proto-muted">暂无历史评估记录。</p>
        ) : (
          <ul className="proto-bullets">
            {historyRows.map((row) => {
              const score =
                row.result && typeof row.result.score === "number" ? row.result.score : "--";
              return (
                <li key={row.id}>
                  {row.created_at?.slice(0, 10) ?? "未知日期"} · 风险 {row.risk_level ?? "--"} · 评分 {score}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </ParentShell>
  );
}
