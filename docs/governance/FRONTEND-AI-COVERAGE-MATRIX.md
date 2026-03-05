# Frontend AI Coverage Matrix

## Scope

- Date: 2026-03-05
- Repo: `starpath-frontend`
- Goal: 明确每个家长端页面的 AI 触点、输入依赖、失败降级和验证证据。

## Matrix

| route | ai touchpoint | runtime input | failure fallback | evidence |
|---|---|---|---|---|
| `/chat` | orchestrator 对话生成 | `access_token`, `child_id`, user message | assistant 返回 `请求失败：...` | `src/components/chat/role-chat-page.tsx`, `tests/e2e/parent-child-switch.spec.ts` |
| `/dashboard` | AI 卡片洞察摘要 | `access_token`, `child_id` | `看板加载失败：...` | `src/components/cards/role-dashboard-page.tsx` |
| `/assessment` | 评估结果结构化与风险等级 | answers, `child_id` | `保存失败：...` | `src/app/assessment/page.tsx`, `src/app/assessment/page.test.tsx` |
| `/training-advice` | `AI 生成训练建议`（风险+画像+频次综合建议） | assessments + profile + sessions + `child_id` | `建议降级：...` + 默认建议卡片 | `src/app/training-advice/page.tsx`, `src/app/training-advice/page.test.tsx`, `tests/e2e/parent-assessment-advice-home-guide.spec.ts` |
| `/home-guide` | `AI 生成今日计划` | training trend + profile + assessment | `指导降级：...` + 默认步骤 | `src/app/home-guide/page.tsx`, `src/app/home-guide/page.test.tsx` |
| `/voice-record` | `AI 结构化记录` | note + emotion intensity | `结构化失败：...` | `src/app/voice-record/page.tsx`, `src/app/voice-record/page.test.tsx` |
| `/training-weekly` | `AI 解读周报` | weekly session summary | 默认提示文案 | `src/app/training-weekly/page.tsx`, `src/app/training-weekly/page.test.tsx` |
| `/analysis-report` | `AI 生成干预建议` | domain scores + ABC summary | 默认建议文案 | `src/app/analysis-report/page.tsx`, `src/app/analysis-report/page.test.tsx` |
| `/training-detail` | 导出与复盘建议触点 | weekly sessions | `详情降级：...` | `src/app/training-detail/page.tsx`, `src/app/training-detail/page.test.tsx` |
| `/card-fullscreen` | 卡片保存动作 | trend/profile/assessment snapshots | `卡片降级：...` | `src/app/card-fullscreen/page.tsx`, `src/app/card-fullscreen/page.test.tsx` |

## Guardrails

1. 所有 AI 页面必须在无 `child_id` 时给出可操作降级提示，不可空白页。
2. AI 按钮动作必须有用户可见的结果文案（成功或失败）。
3. 每个 AI 触点至少有一条单元测试或 E2E 覆盖。
4. 前端不持久化敏感原始对话，持久化仅走后端策略表。

## Verification Commands

```bash
pnpm test
pnpm playwright test --grep-invert @live
bash tests/governance/test_frontend_ui_audit_artifacts.sh
```
