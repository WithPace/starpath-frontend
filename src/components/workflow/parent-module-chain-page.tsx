"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { callOrchestrator } from "@/lib/api/orchestrator-client";
import { DashboardCards } from "@/components/cards/dashboard-cards";
import { RoleRuntimePanel } from "@/components/runtime/role-runtime-panel";
import { readFrontendEnv } from "@/lib/env";
import { extractModuleOutcome } from "@/lib/runtime/module-outcome";
import { isPermissionDeniedMessage } from "@/lib/runtime/org-members";
import { getRoleUiMeta } from "@/lib/runtime/role-ui";
import { reportRuntimeError } from "@/lib/runtime/runtime-telemetry";
import { useProtectedRoute } from "@/lib/runtime/use-protected-route";
import { useRoleRuntime } from "@/lib/runtime/use-role-runtime";

type ParentModuleId = "assessment" | "training_advice" | "training" | "training_record";

type ParentModuleState = {
  prompt: string;
  pending: boolean;
  summaryText: string | null;
  cards: Array<{ card_type: string; title: string; [key: string]: unknown }>;
  errorMessage: string | null;
  donePayload: Record<string, unknown>;
};

const moduleOrder: ParentModuleId[] = [
  "assessment",
  "training_advice",
  "training",
  "training_record",
];

const moduleLabels: Record<ParentModuleId, string> = {
  assessment: "评估解读",
  training_advice: "训练建议",
  training: "训练计划",
  training_record: "训练记录回写",
};

const defaultPrompts: Record<ParentModuleId, string> = {
  assessment: "请基于当前孩子信息生成评估结论和风险提示。",
  training_advice: "请给出今天可执行的训练建议。",
  training: "请将训练建议转成具体的训练步骤与时长。",
  training_record: "请根据今天训练执行情况生成训练记录摘要。",
};

function createInitialModuleState(): Record<ParentModuleId, ParentModuleState> {
  return {
    assessment: {
      prompt: defaultPrompts.assessment,
      pending: false,
      summaryText: null,
      cards: [],
      errorMessage: null,
      donePayload: {},
    },
    training_advice: {
      prompt: defaultPrompts.training_advice,
      pending: false,
      summaryText: null,
      cards: [],
      errorMessage: null,
      donePayload: {},
    },
    training: {
      prompt: defaultPrompts.training,
      pending: false,
      summaryText: null,
      cards: [],
      errorMessage: null,
      donePayload: {},
    },
    training_record: {
      prompt: defaultPrompts.training_record,
      pending: false,
      summaryText: null,
      cards: [],
      errorMessage: null,
      donePayload: {},
    },
  };
}

export function ParentModuleChainPage() {
  const router = useRouter();
  const roleUi = getRoleUiMeta("parent");
  const runtime = useRoleRuntime("parent");
  const routeDecision = useProtectedRoute(
    runtime.accessToken,
    runtime.loading,
    Boolean(runtime.selectedChildId),
  );
  const [modules, setModules] = useState<Record<ParentModuleId, ParentModuleState>>(createInitialModuleState);
  const [runningAll, setRunningAll] = useState(false);

  const hasAnyPending = useMemo(
    () => moduleOrder.some((moduleId) => modules[moduleId].pending),
    [modules],
  );

  const runSingleModule = async (moduleId: ParentModuleId) => {
    if (!runtime.accessToken) {
      setModules((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          errorMessage: "缺少访问令牌，请先登录。",
        },
      }));
      return;
    }

    if (!runtime.selectedChildId) {
      setModules((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          errorMessage: "缺少孩子上下文，请先选择孩子。",
        },
      }));
      return;
    }

    setModules((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        pending: true,
        errorMessage: null,
      },
    }));

    try {
      const env = readFrontendEnv();
      const events = await callOrchestrator(
        {
          apiBaseUrl: env.apiBaseUrl,
          accessToken: runtime.accessToken,
        },
        {
          child_id: runtime.selectedChildId,
          message: modules[moduleId].prompt,
          module: moduleId,
          role: "parent",
          request_id: crypto.randomUUID(),
        },
      );

      const outcome = extractModuleOutcome(events);
      if (outcome.errorMessage) {
        throw new Error(outcome.errorMessage);
      }

      setModules((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          pending: false,
          summaryText: outcome.summaryText ?? "执行完成。",
          cards: outcome.cards,
          errorMessage: null,
          donePayload: outcome.done,
        },
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "模块执行失败";
      reportRuntimeError({
        scope: "parent_chain",
        message: errorMessage,
        context: { moduleId, route: "/journey" },
      });

      if (isPermissionDeniedMessage(errorMessage)) {
        router.replace("/forbidden?reason=permission_denied&role=parent");
      }

      setModules((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          pending: false,
          errorMessage,
        },
      }));
    }
  };

  const runFullChain = async () => {
    setRunningAll(true);
    for (const moduleId of moduleOrder) {
      await runSingleModule(moduleId);
    }
    setRunningAll(false);
  };

  if (!routeDecision.allow) {
    return (
      <main className={`app-shell ${roleUi.themeClass}`}>
        <section className="surface-card">
          <h1 className="page-title">家长业务链路</h1>
          <p className="muted-text">正在跳转到认证页面...</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${roleUi.themeClass}`}>
      <section className="surface-card">
        <header className="role-header">
          <div>
            <p className="role-kicker">家长</p>
            <h1 className="page-title">家长业务链路</h1>
          </div>
          <nav className="role-nav" aria-label="parent-routes">
            <Link href={roleUi.chatPath}>对话</Link>
            <Link href={roleUi.dashboardPath}>看板</Link>
            <Link href={roleUi.journeyPath ?? "/journey"} className="active">
              业务链路
            </Link>
            <Link href="/auth">认证</Link>
          </nav>
        </header>

        <RoleRuntimePanel
          roleLabel="家长"
          loading={runtime.loading}
          warning={runtime.warning}
          isAuthenticated={runtime.isAuthenticated}
          sessionEmail={runtime.sessionEmail}
          childOptions={runtime.children}
          selectedChildId={runtime.selectedChildId}
          onSelectChild={runtime.setSelectedChildId}
          onRefresh={runtime.refresh}
          onSignOut={runtime.signOut}
        />

        <div className="module-chain-actions">
          <button
            type="button"
            className="button-primary"
            onClick={() => void runFullChain()}
            disabled={runningAll || hasAnyPending}
          >
            {runningAll ? "执行中..." : "一键执行完整链路"}
          </button>
        </div>

        <section className="module-chain-grid" aria-label="parent-module-chain">
          {moduleOrder.map((moduleId) => {
            const moduleState = modules[moduleId];
            return (
              <article key={moduleId} className="module-chain-card">
                <header>
                  <h2>{moduleLabels[moduleId]}</h2>
                </header>
                <label>
                  执行指令
                  <textarea
                    rows={3}
                    value={moduleState.prompt}
                    onChange={(event) =>
                      setModules((prev) => ({
                        ...prev,
                        [moduleId]: {
                          ...prev[moduleId],
                          prompt: event.target.value,
                        },
                      }))}
                    disabled={moduleState.pending || runningAll}
                  />
                </label>
                <div className="form-actions">
                  <button
                    type="button"
                    className="button-secondary"
                    onClick={() => void runSingleModule(moduleId)}
                    disabled={moduleState.pending || runningAll}
                  >
                    {moduleState.pending ? "执行中..." : "执行当前模块"}
                  </button>
                </div>
                {moduleState.errorMessage ? (
                  <p className="runtime-panel__warning">执行失败：{moduleState.errorMessage}</p>
                ) : null}
                {moduleState.summaryText ? (
                  <p className="muted-text">摘要：{moduleState.summaryText}</p>
                ) : null}
                {Object.keys(moduleState.donePayload).length > 0 ? (
                  <details>
                    <summary>done payload</summary>
                    <pre>{JSON.stringify(moduleState.donePayload, null, 2)}</pre>
                  </details>
                ) : null}
                {moduleState.cards.length > 0 ? (
                  <DashboardCards cards={moduleState.cards} loading={false} error={null} />
                ) : null}
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
