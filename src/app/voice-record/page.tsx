"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

export default function VoiceRecordPage() {
  const [recording, setRecording] = useState(false);

  return (
    <ParentShell title="语音记录" subtitle="长按录音，AI 自动结构化训练记录" activePath="/quick-menu">
      <section className="proto-panel">
        <p className="proto-kicker">09 · 语音记录</p>
        <h2>训练现场记录</h2>
        <p className="proto-muted">语音输入后将自动提取目标、行为观察、情绪强度和下一步建议。</p>
        <button
          type="button"
          className={recording ? "button-primary" : "button-secondary"}
          onClick={() => setRecording((prev) => !prev)}
        >
          {recording ? "结束录音" : "开始录音"}
        </button>
      </section>

      <section className="proto-panel">
        <h3>AI 结构化结果（示例）</h3>
        <ul className="proto-bullets">
          <li>训练目标：共同注意 + 情绪调节</li>
          <li>ABC 行为：前因=任务切换，行为=哭闹，结果=拥抱安抚后恢复</li>
          <li>情绪强度：3/5</li>
        </ul>
      </section>
    </ParentShell>
  );
}
