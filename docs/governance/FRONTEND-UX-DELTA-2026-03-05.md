# Frontend UX Delta 2026-03-05

## Baseline

- Reference: `docs/prototype_v2` (13-page parent prototype).
- Previous status: 主流程可用，但多个页面缺失 AI 动作闭环与异常恢复页。

## Delivered Delta

1. Parent 13-page core polish
- `home-guide` 增加 `AI 生成今日计划` 与版本化提示。
- `voice-record` 增加 `AI 结构化记录` 结果卡片。
- `training-weekly` 增加 `AI 解读周报`。
- `analysis-report` 增加 `AI 生成干预建议`。
- `training-detail` 增加 `导出 PDF` 动作反馈。
- `card-fullscreen` 增加 `保存到成长卡片`。

2. Missing key pages filled
- child management: `/children`, `/children/[id]/edit`
- session recovery: `/auth/session-expired`
- ops pages: `/sync-center`, `/notifications`, `/data-consent`

3. Exception chain verification
- 新增 E2E:
  - `tests/e2e/parent-session-expired-recovery.spec.ts`
  - `tests/e2e/parent-sync-center-retry.spec.ts`
  - `tests/e2e/parent-child-switch.spec.ts`

4. Governance automation
- 新增 UI 审计脚本: `scripts/ci/frontend_ui_audit_screenshots.sh`
- 新增契约测试: `tests/governance/test_frontend_ui_audit_artifacts.sh`
- `scripts/ci/frontend_final_gate.sh` 已接入治理与异常链路门禁。
- UI 审计原型映射升级为严格校验：支持 `prototype_v2/*.html` 渲染，缺失映射默认直接失败。

5. Live dashboard resilience
- 当后端返回空 `cards` payload 时，前端改为角色化 fallback cards，而不是显示阻断性 `看板加载失败`。
- 关联实现: `src/lib/runtime/dashboard-cards.ts`, `src/components/cards/role-dashboard-page.tsx`。

6. Dev/runtime warning hardening
- `next.config.ts` 增加 `allowedDevOrigins`，消除本地 `127.0.0.1` 到 `/_next/*` 的跨域警告噪声。
- `next.config.ts` 增加 `turbopack.root`，固定 workspace root，降低多 lockfile 推断警告噪声。

## Known Gaps

- 非 live 环境下，部分 AI 数据页仍以降级文案为主，需依赖真实 Supabase 数据做最终体验验收。
- 若需临时绕过严格原型映射，必须显式设置 `UI_AUDIT_ALLOW_PROTOTYPE_FALLBACK=1`，并在发布记录中补充原因。

## Sign-off Inputs

- test gate: `bash scripts/ci/frontend_final_gate.sh`
- visual contract: `bash tests/governance/test_frontend_ui_audit_artifacts.sh`
- live chain (optional): `bash scripts/ci/frontend_live_e2e_interactive.sh`
