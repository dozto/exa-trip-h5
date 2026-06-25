# tiny-change：清理 .env、移除 bootstrap/node、术语统一

- 日期：2026-06-25
- 变更级别：tiny-change
- 判定依据：均为收尾清理与名称对齐，不改变业务不变量与用例语义；可由现有测试覆盖验证。

## 变更清单

1. `.gitignore` 增补 `.env`、`.env.*` 忽略规则并新增 `.env.example`，防止 `VITE_MAPBOX_ACCESS_TOKEN` 泄漏。
2. 移除 `src/bootstrap/node.ts`：当前仅保留本地调试开发，Mapbox token 由前端直连；`buildViewItineraryService` 移除后无任何引用。同步收敛 `.human/preferences.md`、`.human/glossary.md`、`.ai/current.md` 与 RFC-0002 中"双模式"/"bootstrap/node"描述，并附 RFC-0002 修订记录。
3. 统一领域术语 `RoutePlan` → `NavigationPlan`，与 `.ai/domains/trip-navigation.md` 与 `.human/glossary.md` 对齐：
   - 类型符号：`RoutePlan` → `NavigationPlan`
   - 状态字段与 store action：`routePlan*` → `navigationPlan*`
   - outbound port 方法：`getRoutePlan/setRoutePlan` → `getNavigationPlan/setNavigationPlan`
   - 错误码：`route_plan_failed` → `navigation_plan_failed`

## 验证证据

- `bun run test`：10 files / 27 tests PASS
- `./scripts/check-architecture` PASS
- `./scripts/check-ddd` PASS
- `./scripts/check-naming` PASS
- `./scripts/check-doc-sync` PASS