import type { OrchestratorRole } from "@/lib/api/orchestrator-client";
import type { DashboardCard } from "@/stores/dashboard-store";

type RoleBusinessPanelProps = {
  role: OrchestratorRole;
  cards: DashboardCard[];
  loading: boolean;
  error: string | null;
};

type BusinessRole = Exclude<OrchestratorRole, "parent">;

type PanelCopy = {
  heading: string;
  lead: string;
  actions: string[];
};

const PANEL_COPY: Record<BusinessRole, PanelCopy> = {
  doctor: {
    heading: "风险分诊待办",
    lead: "优先处理高风险个案，确保转诊与家长沟通闭环。",
    actions: ["24h 内安排随访", "补齐评估证据记录", "同步家庭训练频次"],
  },
  teacher: {
    heading: "课堂执行清单",
    lead: "把训练建议转成可执行课堂动作，并跟踪课堂完成度。",
    actions: ["今日课堂干预目标", "课后家庭协同提醒", "更新周执行反馈"],
  },
  org_admin: {
    heading: "机构运营快照",
    lead: "聚焦机构执行质量与成员治理，持续压降流程风险。",
    actions: ["本周督导与质检", "成员权限巡检", "升级异常个案工单"],
  },
};

function normalizeRole(role: OrchestratorRole): BusinessRole {
  if (role === "parent") {
    return "doctor";
  }

  return role;
}

export function RoleBusinessPanel({ role, cards, loading, error }: RoleBusinessPanelProps) {
  const businessRole = normalizeRole(role);
  const copy = PANEL_COPY[businessRole];
  const hasCards = cards.length > 0;

  return (
    <section aria-label={`${businessRole}-business-panel`} className="role-business-panel">
      <header className="role-business-panel__header">
        <p className="role-kicker">业务视图</p>
        <h2>{copy.heading}</h2>
        <p className="muted-text">{copy.lead}</p>
      </header>

      <p className="role-business-panel__hint">
        {loading
          ? "看板数据同步中，先按标准业务待办推进。"
          : hasCards
            ? `已同步 ${cards.length} 张看板卡片，可结合实时数据执行。`
            : "卡片数据暂不可用，已切换到标准业务待办。"}
      </p>
      {error ? <p className="runtime-panel__warning">看板异常：{error}</p> : null}

      <ul className="role-business-panel__list">
        {copy.actions.map((action) => (
          <li key={action}>{action}</li>
        ))}
      </ul>
    </section>
  );
}
