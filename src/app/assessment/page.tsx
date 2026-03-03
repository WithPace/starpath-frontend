"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

const questions = [
  "孩子会主动看向你指向的物体吗？",
  "孩子会用手指向想要的东西吗？",
  "孩子会模仿你的动作或表情吗？",
];

export default function AssessmentPage() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const completed = index >= questions.length;

  const answer = (value: string) => {
    setAnswers((prev) => [...prev, value]);
    setIndex((prev) => prev + 1);
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
              <button type="button" className="button-primary" onClick={() => answer("是")}>是</button>
              <button type="button" className="button-secondary" onClick={() => answer("否")}>否</button>
              <button type="button" className="button-secondary" onClick={() => answer("偶尔")}>偶尔</button>
            </div>
          </>
        ) : (
          <>
            <h2>评估完成</h2>
            <p className="proto-muted">已完成 {answers.length} 题，建议继续查看训练建议与居家指导。</p>
          </>
        )}
      </section>
    </ParentShell>
  );
}
