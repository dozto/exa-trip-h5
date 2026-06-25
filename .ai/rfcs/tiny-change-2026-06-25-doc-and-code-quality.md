# tiny-change：文档结构收敛 + 代码质量优化

- 日期：2026-06-25
- 变更级别：tiny-change
- 判定依据：文档合并与代码去重不改变业务不变量与用例语义；测试覆盖验证无回归。

## 变更清单

1. **文档结构收敛**：
   - `.human/ddd-principles.md` 与 `.human/hexagonal-principles.md` 合并进 `.human/architecture.md`（新增 DDD 战术约束、六边形适配器约束、测试与验证三节）。
   - 原文件已删除，所有引用（agent.md、index.md、workflow、preferences.md）已更新指向 architecture.md。
2. **技能精简**：
   - `.skills/feature-delivery/` 删除（流程统一由 `.ai/workflow-feature-delivery.md` 承载，skill 无额外可执行价值）。
   - `xp-validation` 与 `ddd-validation` SKILL.md 去除规则重述，仅保留可执行校验描述与工具表，规则指向 architecture.md。
3. **check-doc-sync 放松**：
   - 仅 `src/domains/`、`src/features/`、`src/inbound/web/state/command/` 变更才要求 RFC/tiny-change 记录；其余 src/tests 仅要求 `.ai/current.md` 更新。
4. **领域方法补齐单元测试**：
   - 新增 `tests/domains/trip-planning/trip-plan.methods.spec.ts`（17 tests）。
   - 新增 `tests/domains/trip-navigation/route-plan.methods.spec.ts`（21 tests）。
5. **assertPlanInvariants 接入**：
   - 在 `load-trip-plan` 中于 Zod 校验成功并返回 tripPlan 后调用 `assertPlanInvariants`，违规时返回 `trip_invalid_schema`。消除之前死代码状态。
6. **重复代码提取**：
   - `parseTimeToMinutes` / `formatMinutesToTime` 提取到 `shared/time.ts`（原在 `show-day-decision-hints/index.ts` 和 `route-plan.methods.ts` 各有私有副本）。
   - `haversineDistanceKm` 提取到 `shared/geo.ts`（原在 `plan-trip-routes/index.ts` 和 `mock-routing.gateway.ts` 各有重复实现）。
   - inbound 层（events.ts、commands.ts、view-store.ts、view-model.ts、map-canvas.tsx、map-toolbar.tsx、itinerary-page-model.ts）全部改用 domain 导出的 `TravelMode` 类型，不再内联 `"walk"|"transit"|"drive"`。
7. **错误码新增**：
   - `shared/errors.ts` 新增 `day_switch_failed`，`switch-current-day` 改用此码替代原先语义不精确的 `trip_load_failed`。
8. **handlers 依赖注入收敛**：
   - `handlers.ts` 不再直接 import `useTripViewStore` singleton，改为通过 `store: TripViewStoreApi` 依赖注入，与六边形装配原则一致。`bootstrap/web.ts` 注入 `useTripViewStore`。

## 验证证据

- `bun run test`：12 files / 65 tests PASS（含新增 38 域方法测试）
- `bun run build`：PASS（tsc + vite build 无错误）
- `./scripts/check-architecture` PASS
- `./scripts/check-ddd` PASS
- `./scripts/check-naming` PASS