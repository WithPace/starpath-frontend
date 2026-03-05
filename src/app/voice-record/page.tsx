"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";
import {
  listRecentVoiceRecords,
  saveVoiceRecord,
  type VoiceHistoryRow,
} from "@/lib/prototype/parent-data-access";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";
import { tryCreateBrowserSupabaseClient } from "@/lib/supabase/client";

export default function VoiceRecordPage() {
  const runtime = useRoleRuntime("parent");
  const client = useMemo(() => tryCreateBrowserSupabaseClient(), []);

  const [recording, setRecording] = useState(false);
  const [note, setNote] = useState("");
  const [emotionIntensity, setEmotionIntensity] = useState("3");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [structuring, setStructuring] = useState(false);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [structuredResult, setStructuredResult] = useState<{
    observation: string;
    trigger: string;
    strategy: string;
    nextStep: string;
  } | null>(null);
  const [historyRows, setHistoryRows] = useState<VoiceHistoryRow[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const blockingReason = !client
    ? "缺少 Supabase 前端配置。"
    : !runtime.selectedChildId
      ? "未选择 child_id。"
      : null;

  const refreshHistory = useCallback(
    async (childId: string) => {
      if (!client) return;
      try {
        const rows = await listRecentVoiceRecords(client, childId, 5);
        setHistoryRows(rows);
        setHistoryError(null);
      } catch (error) {
        setHistoryError(error instanceof Error ? error.message : "历史记录读取失败。");
      }
    },
    [client],
  );

  useEffect(() => {
    const childId = runtime.selectedChildId;
    if (!client || !childId) return;
    void refreshHistory(childId);
  }, [client, refreshHistory, runtime.selectedChildId]);

  const structureNote = () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setStructureError("请先输入训练记录内容，再进行结构化。");
      setStructuredResult(null);
      return;
    }

    setStructuring(true);
    setStructureError(null);

    const observation = trimmed.split(/[。！？.!?]/).find((line) => line.trim().length > 0)?.trim() ?? trimmed;
    const trigger = /哭闹|崩溃|拒绝|抗拒/u.test(trimmed)
      ? "任务切换触发了情绪波动"
      : /分心|走神|离开/u.test(trimmed)
        ? "注意维持时长不足"
        : "常规任务节奏下出现波动";
    const strategy =
      Number.parseInt(emotionIntensity, 10) >= 4
        ? "先做 2 分钟情绪安抚，再切回单步指令，完成后即时强化。"
        : "先复述目标，再拆成 2 个可完成动作，完成后给出正反馈。";
    const nextStep =
      Number.parseInt(emotionIntensity, 10) >= 4
        ? "下一次训练先做低难度热身，再进入核心任务。"
        : "下一次训练可保持当前难度，增加 1 次场景泛化。";

    setStructuredResult({
      observation,
      trigger,
      strategy,
      nextStep,
    });
    setStructuring(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !runtime.selectedChildId) {
      setSaveError("缺少运行时上下文，无法保存记录。");
      setSaveMessage(null);
      return;
    }
    try {
      setSaving(true);
      setSaveError(null);
      const result = await saveVoiceRecord(client, {
        childId: runtime.selectedChildId,
        note,
        emotionIntensity: Number.parseInt(emotionIntensity, 10),
      });
      setSaveMessage(`记录已保存（id: ${result.lifeRecordId}）`);
      await refreshHistory(runtime.selectedChildId);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败。");
      setSaveMessage(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ParentShell title="语音记录" subtitle="长按录音，AI 自动结构化训练记录" activePath="/quick-menu">
      <section className="proto-panel">
        <p className="proto-kicker">09 · 语音记录</p>
        <h2>训练现场记录</h2>
        <p className="proto-muted">语音输入后将自动提取目标、行为观察、情绪强度和下一步建议。</p>
        <div className="proto-actions">
          <button
            type="button"
            className={recording ? "button-primary" : "button-secondary"}
            onClick={() => setRecording((prev) => !prev)}
          >
            {recording ? "结束录音" : "开始录音"}
          </button>
          <button type="button" className="button-primary" onClick={structureNote} disabled={structuring}>
            {structuring ? "结构化中..." : "AI 结构化记录"}
          </button>
        </div>
        <form className="proto-form" onSubmit={submit}>
          <label>
            训练记录内容
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="记录今天的训练观察、行为变化和处理方式"
              rows={4}
              required
            />
          </label>
          <label>
            情绪强度（1-5）
            <select value={emotionIntensity} onChange={(event) => setEmotionIntensity(event.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>
          <button type="submit" className="button-primary" disabled={saving}>
            {saving ? "保存中..." : "保存记录"}
          </button>
        </form>
        {structureError ? <p className="proto-muted">结构化失败：{structureError}</p> : null}
        {structuredResult ? (
          <section className="proto-panel proto-inset-panel" aria-label="voice-structured-result">
            <h3>结构化结果</h3>
            <ul className="proto-bullets">
              <li>观察：{structuredResult.observation}</li>
              <li>触发因素：{structuredResult.trigger}</li>
              <li>建议策略：{structuredResult.strategy}</li>
              <li>下一步：{structuredResult.nextStep}</li>
            </ul>
          </section>
        ) : null}
        {saveMessage ? <p className="proto-muted">{saveMessage}</p> : null}
        {saveError ? <p className="proto-muted">保存失败：{saveError}</p> : null}
        {blockingReason ? <p className="proto-muted">运行时降级：{blockingReason}</p> : null}
      </section>

      <section className="proto-panel">
        <h3>最近训练记录</h3>
        {historyError ? <p className="proto-muted">历史读取失败：{historyError}</p> : null}
        {historyRows.length === 0 ? (
          <p className="proto-muted">暂无历史训练记录。</p>
        ) : (
          <ul className="proto-bullets">
            {historyRows.map((row) => (
              <li key={row.id}>
                {row.occurred_at?.slice(0, 10) ?? "未知日期"} · {row.summary ?? "无摘要"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </ParentShell>
  );
}
