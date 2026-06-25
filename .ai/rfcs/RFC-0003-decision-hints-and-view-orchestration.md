# RFC-0003：决策提示特性与页面聚合编排收敛

- 状态：accepted
- 变更级别：normal
- 日期：2026-06-25
- 作者：AI
- 模式：fast
- 关联需求：在只读行程查看中补齐“事件预估 + 衔接可行性”并形成可消费的页面聚合编排

## 1) 目标与范围

### 背景/目标

在 `trip-navigation` 已具备路线预估语义后，补齐活动级决策提示能力并打通页面消费链路：

- 新增独立 feature `show-day-decision-hints`，输出 `DayDecisionHints`。
- `view-itinerary` 从“单用例描述”升级为“页面聚合特性”，编排子用例并消费结果。
- 页面同时展示路线降级提示与预估提示，并支持地图提示联动活动卡定位。

### 本次不做

- 不引入 turn-by-turn 导航执行。
- 不引入交易履约与外部账号体系。

## 2) 关键澄清

### AI 默认假设

- 事件预估依赖 `trip-planning` 活动事实 + `trip-navigation` 路线结果。
- 页面聚合只负责编排与状态消费，领域规则保留在 domain methods。

### 待确认决策（<=3）

- 无阻塞决策。

## 3) 方案

### Feature 拆分

- `show-day-decision-hints`
  - 输入：`tripPlan`、`dayId`、`navigationPlan`、`strategy`、`defaultBufferMinutes`
  - 输出：`DayDecisionHints`
- `view-itinerary`（聚合）
  - 编排 `load-trip-plan` / `switch-current-day` / `plan-trip-routes` / `show-day-decision-hints`
  - 将路线 warning 与预估 warning 统一呈现到状态区

### 交互与状态

- 地图浮层显示决策摘要（建议出发时间、迟到风险、衔接可行性）。
- 点击摘要可聚焦并滚动到右侧活动卡对应条目。

## 4) 验证与风险

### 测试与校验

- `tests/features/trip-live/show-day-decision-hints.spec.ts`
- `tests/inbound/web/state/command/handlers.spec.ts`
- `bun run test`
- `bun run build`
- `bun run check:architecture`
- `bun run check:ddd`
- `bun run check:doc-sync`

### 风险与回滚

- 风险：页面状态聚合变重。
  - 缓解：保持 feature 细分，view-itinerary 仅编排。
- 风险：提示信息过多影响可读性。
  - 缓解：地图浮层展示摘要，右侧卡片保留明细。

## 5) 变更清单

### 主要改动路径

- `src/features/show-day-decision-hints/**`
- `src/inbound/web/state/**`
- `src/inbound/web/components/**`
- `.ai/features/**`
- `.ai/domains/**`
- `.human/glossary.md`

### 文档回写

- [x] `.ai/current.md`
- [x] `.ai/features/view-itinerary.md`
- [x] `.ai/features/show-day-decision-hints.md`
- [x] `.human/glossary.md`

## 6) 决策记录

- 决策：`show-day-decision-hints` 独立于 `plan-trip-routes`，保持职责单一。
- 决策：`view-itinerary` 定位为页面聚合特性，不承载领域计算规则。
- 决策：支持“地图摘要 -> 活动条目”联动，提升决策可达性。
- 决策人：Human + AI
- 决策时间：2026-06-25
