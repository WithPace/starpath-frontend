import type { OrchestratorRole } from "@/lib/api/orchestrator-client";

type RoleChatBusinessPanelProps = {
  role: OrchestratorRole;
  pending: boolean;
};

type ChatBusinessCopy = {
  heading: string;
  lead: string;
  checklist: string[];
};

const CHAT_BUSINESS_COPY: Record<OrchestratorRole, ChatBusinessCopy> = {
  parent: {
    heading: "家长对话执行重点",
    lead: "围绕家庭可执行动作提问，确保建议可落地到今日训练。",
    checklist: ["确认今天训练时间", "聚焦一个核心目标", "记录执行反馈与困难"],
  },
  doctor: {
    heading: "医生对话执行重点",
    lead: "优先输出可直接执行的分诊结论与随访建议。",
    checklist: ["确认高风险行为变化", "明确复诊与干预建议", "同步家长沟通要点"],
  },
  teacher: {
    heading: "教师对话执行重点",
    lead: "把对话结果转成课堂可执行步骤并明确回写节奏。",
    checklist: ["明确课堂干预目标", "给出家庭协同动作", "形成每周反馈模板"],
  },
  org_admin: {
    heading: "机构管理对话执行重点",
    lead: "聚焦治理策略与协同执行，不输出个案医疗建议。",
    checklist: ["明确责任人和时限", "同步质检与督导项", "沉淀可复用流程模板"],
  },
};

export function RoleChatBusinessPanel({ role, pending }: RoleChatBusinessPanelProps) {
  const copy = CHAT_BUSINESS_COPY[role];

  return (
    <section aria-label={`${role}-chat-business-panel`} className="chat-business-panel">
      <header className="chat-business-panel__header">
        <p className="role-kicker">业务执行</p>
        <h2>{copy.heading}</h2>
        <p className="muted-text">{copy.lead}</p>
      </header>
      <p className="chat-business-panel__hint">
        {pending ? "正在生成本轮建议，请准备记录关键结论。" : "建议按清单逐项确认，再进入下一轮追问。"}
      </p>
      <ul className="chat-business-panel__list">
        {copy.checklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
