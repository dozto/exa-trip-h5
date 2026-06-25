# 认知层入口（.ai/index.md）

> AI 开工先读本文件。本目录是**认知层**（AI 主笔、人确认）：记录"系统是什么、怎么做"的压缩理解。

## 本目录用途

| 路径 | 作用 |
|------|------|
| `index.md`（本文件） | 系统地图：领域与特性清单 |
| `current.md` | 当前状态：焦点、现状快照、已知约束 / 债务 |
| `agent.md` | AI 工作规则与门控流程 |
| `workflow-feature-delivery.md` | Feature 交付流程（提问、拆分、RFC、实现、回写） |
| `domains/` | 各领域的压缩认知（每域一文件） |
| `features/` | 各特性的认知（每特性一文件） |
| `rfcs/` | 变更过程与提案（RFC，编号永存） |

## 关键约束入口（来自 `.human/`）

- [`.human/architecture.md`](../.human/architecture.md) — 总体架构约束与依赖方向
- [`.human/ddd-principles.md`](../.human/ddd-principles.md) — DDD 专项约束（统一语言、聚合、无领域事件策略、测试）
- [`.human/hexagonal-principles.md`](../.human/hexagonal-principles.md) — 六边形专项约束（ports、inbound/outbound、组装根、边界转换）

## 对话触发入口

- 推荐：`/feature <name> [mode=fast|strict]`
- 规则见 [`.ai/agent.md`](./agent.md) 与 [`.ai/workflow-feature-delivery.md`](./workflow-feature-delivery.md)

## 领域（Domains）

- [trip-planning](domains/trip-planning.md) — 行程计划与按日活动编排（天、地点、建议、准备事项）。
- [trip-navigation](domains/trip-navigation.md) — 基于地点序列的路线预估与事件预估语义（分段、策略、风险、可行性）。

## 特性（Features）

- [view-itinerary](features/view-itinerary.md) — 页面聚合特性，编排加载、切天、路线预估与决策提示的结果消费。
- [load-trip-plan](features/load-trip-plan.md) — 读取并校验 TripPlan，返回默认当前日。
- [switch-current-day](features/switch-current-day.md) — 切换当前展示 dayId 的稳定语义。
- [plan-trip-routes](features/plan-trip-routes.md) — 计算当日地点间路线，返回 walk/transit/drive 候选与推荐。
- [show-day-decision-hints](features/show-day-decision-hints.md) — 基于路线与活动时间窗生成出发建议、风险与衔接可行性。
