# RFC-0002：Mapbox 实时导航上下文引入

- 状态：accepted
- 变更级别：normal
- 日期：2026-06-22
- 作者：AI
- 模式：fast
- 关联需求：全球场景下引入真实地图展示与动态路径规划能力

## 1) 目标与范围

### 背景/目标

在现有 itinerary H5 查看链路上增加“地图 + 路线预估 + 事件预估”能力层：

- 以 Mapbox 作为地图渲染与样式主能力。
- 基于每日地点序列动态规划路径（先支持 walk/transit/drive）。
- 采用双模式接入策略：
  - 生产推荐经 `bootstrap/node` 代理调用外部路线能力；
  - 本地/演示环境允许前端使用公开 token 直连 Mapbox 能力。

### 本次不做

- 不在首期实现完整 turn-by-turn 语音导航。
- 不在首期实现 transit（公共交通）全量接入。
- 不在首期引入行程编辑能力或多用户协作。

## 2) 关键澄清（最少化）

### AI 默认假设（落地后修订）

- 公交模式采用分阶段策略：V1 先交付 walk/transit(估算)/drive，后续接入独立 transit provider。
- 页面打开与切换日期时优先实时查询，允许短 TTL 缓存兜底。
- 事件预估与可行性评估由独立 feature 产出并由页面聚合消费。

### 待确认决策（<=3）

- 无阻塞决策，按默认假设推进。

## 3) 方案

### 领域/Feature 拆分

- 新增上下文 `trip-navigation`：负责路径语义，不回写 `trip-planning` 的行程事实。
- 新增/扩展 feature：
  - `plan-trip-routes`：按地点序列规划多段路线与出行方式候选。
  - `show-day-decision-hints`：基于路线与活动时间窗产出建议出发时间、风险与衔接可行性。
  - `view-itinerary`：作为页面聚合特性编排子用例并消费结果。

### Ports & Adapters 设计

- inbound ports（features）：
  - `PlanTripRoutes(input) -> Result<NavigationPlan, AppError>`
  - `ShowDayDecisionHints(input) -> Result<DayDecisionHints, AppError>`
- outbound ports（由 outbound 实现）：
  - `RoutingGateway`（Mapbox Directions，后续可扩 transit provider）
  - `LiveCacheRepository`（短 TTL 缓存）
- adapter 归位：
  - `src/outbound/gateways/*.gateway.ts`
  - `src/outbound/repositories/*.repository.ts`
  - `src/bootstrap/node.ts` 作为 BFF 入口与装配点

### 数据与事件

- `trip-planning` 继续提供地点序列事实，由 `plan-trip-routes` 编排路线预估。
- `show-day-decision-hints` 基于 `NavigationPlan + ActivityItem` 输出 `DayDecisionHints`。
- `inbound/web/state/command` 增加命令语义：页面打开、日期切换、模式切换触发实时刷新。
- UI 呈现必须包含“数据更新时间戳”“降级到缓存”状态提示，并展示决策提示摘要。

## 4) 验证与风险

### 测试与校验

- TDD：先写 feature 失败测试（端口成功/失败/超时/缓存兜底）。
- `bun run test`
- `bun run build`
- `bun run check:architecture`
- `bun run check:ddd`
- `bun run check:doc-sync`

### 风险与回滚

- 风险：外部 provider 不稳定导致实时能力抖动。
  - 缓解：短 TTL 缓存、超时控制、错误语义翻译与前端降级提示。
- 风险：地图与实时能力耦合过重。
  - 缓解：feature ports 分离，Mapbox 仅负责渲染层。
- 风险：多环境接入策略不一致导致认知偏差。
  - 缓解：明确“双模式”口径（生产优先 node 代理，本地/演示允许公开 token 直连）。
- 回滚：保留现有 mock 地图展示链路，可按 feature 开关关闭实时能力。

## 5) 变更清单

### 预计改动路径

- `src/features/plan-trip-routes/**`
- `src/features/show-day-decision-hints/**`
- `src/outbound/gateways/**`
- `src/outbound/repositories/**`
- `src/bootstrap/node.ts`
- `src/bootstrap/web.ts`
- `src/inbound/web/state/**`
- `src/inbound/web/components/**`
- `.human/**`
- `.ai/**`
- `tests/**`

### 文档回写

- [x] `.ai/current.md`
- [x] `.ai/domains/trip-navigation.md`
- [x] `.ai/features/plan-trip-routes.md`
- [x] `.ai/features/show-day-decision-hints.md`
- [x] `.ai/features/view-itinerary.md`
- [x] `.human/glossary.md`

## 6.1 实际落地结果（2026-06-25）

- `plan-trip-routes` 已接入 web/node bootstrap，支持缓存降级与短距离步行优先。
- `show-day-decision-hints` 已落地并接入页面状态流，输出活动级事件预估与衔接可行性。
- 地图浮层已显示建议出发时间/风险摘要，并支持点击联动右侧活动卡定位。
- 前端与 node 双模式已生效：生产推荐 node 代理，本地/演示可用公开 token。

## 7) 决策记录

> 修订（2026-06-25）：`bootstrap/node.ts` 已移除。当前收敛为单模式——前端使用公开 token 直连 Mapbox；`bootstrap/node` 代理策略暂不实现，待后续如需收敛为"严格代理"再以新 RFC 启动。

- 决策：地图渲染主方案采用 Mapbox。
- 决策：实时能力采用双模式接入；生产优先 `bootstrap/node` 代理，本地/演示允许公开 token 直连。
- 决策：transit 分阶段接入，首期仅 walk/transit(估算)/drive。
- 决策：新增 `show-day-decision-hints` 作为独立 feature，不并入 `plan-trip-routes`。
- 决策人：Human + AI
- 决策时间：2026-06-22 / 2026-06-25
