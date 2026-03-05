"use client";

import { useState } from "react";

import { ParentShell } from "@/components/prototype/parent-shell";

type SyncTask = {
  id: string;
  title: string;
  status: "failed" | "pending" | "success";
  reason: string;
};

const seedTasks: SyncTask[] = [
  {
    id: "task-1",
    title: "训练记录写回",
    status: "failed",
    reason: "网络波动导致请求超时",
  },
  {
    id: "task-2",
    title: "评估快照同步",
    status: "pending",
    reason: "等待后台队列执行",
  },
  {
    id: "task-3",
    title: "成长卡片归档",
    status: "success",
    reason: "已完成",
  },
];

function statusLabel(status: SyncTask["status"]): string {
  if (status === "failed") return "失败";
  if (status === "pending") return "进行中";
  return "已完成";
}

export default function SyncCenterPage() {
  const [tasks, setTasks] = useState<SyncTask[]>(seedTasks);
  const [message, setMessage] = useState<string | null>(null);

  const retryFailedTasks = () => {
    const hasFailed = tasks.some((task) => task.status === "failed");
    if (!hasFailed) {
      setMessage("当前没有失败任务。");
      return;
    }

    setTasks((previous) =>
      previous.map((task) =>
        task.status === "failed"
          ? { ...task, status: "success", reason: "重试成功，已完成同步" }
          : task,
      ),
    );
    setMessage("失败任务已重试并恢复。");
  };

  return (
    <ParentShell title="同步中心" subtitle="查看失败任务并执行补偿重试" activePath="/quick-menu">
      <section className="proto-panel">
        <div className="proto-section-header">
          <h2>同步中心</h2>
          <button type="button" className="button-primary" onClick={retryFailedTasks}>
            重试失败任务
          </button>
        </div>
        {message ? <p className="proto-muted">{message}</p> : null}
        <ul className="proto-bullets">
          {tasks.map((task) => (
            <li key={task.id}>
              <div className="proto-row">
                <strong>{task.title}</strong>
                <span>{statusLabel(task.status)}</span>
              </div>
              <p className="proto-muted">{task.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </ParentShell>
  );
}
