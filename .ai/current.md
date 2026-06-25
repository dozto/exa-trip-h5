# 当前状态（.ai/current.md）

> 系统此刻的状态快照，随交付滚动更新。只记"现在"；变更的来龙去脉在 `rfcs/`。

## 当前焦点

- 结构改造已进入稳定阶段：`src/features` 平铺、`src/inbound`/`src/outbound`/`src/bootstrap` 分层协作（见 [RFC-0001](./rfcs/RFC-0001-itinerary-h5-module-split.md)）。
- inbound web 已完成目录语义收敛：`events/` 承载事件总线机制，`state` 细分为 `command/state/store`，`styles` 拆分为 `index + pages + components`。
- Mapbox 实时能力文档已收口（见 [RFC-0002](./rfcs/RFC-0002-mapbox-live-navigation.md)，状态 `accepted`）。
- 实时能力已形成双 feature：`plan-trip-routes`（路线预估）+ `show-day-decision-hints`（事件预估与衔接可行性），并由 `view-itinerary` 聚合编排（见 [RFC-0003](./rfcs/RFC-0003-decision-hints-and-view-orchestration.md)）。
- 路线展示与景点聚焦体验改造完成（见 [RFC-0004](./rfcs/RFC-0004-place-focus-view-and-strategy-routing.md)，状态 `accepted`）：
  - 顶部工具栏语义从「出行方式切换」改为「路线策略切换」（fastest / comfort / cheapest），由 `selectOptionByStrategy` 自动为每段 leg 选 mode。
  - `RouteOption` 补齐 `strategy` 字段；`plan-trip-routes` 按 `strategies` 入参产出多策略方案；Mock/Mapbox gateway 均按 `strategy` 差异化输出（含几何拐点与 `comfortScore`/`estimatedCost`）。
  - 新增三层视图模型（`overview` / `day` / `place`）与 ESC 逐级退出语义（place → day → overview），由 inbound store + handlers 承载。
  - 地图按 `viewLevel` 过滤显示范围：概览全量、选天聚焦当日、选景点进一步放大到该点。
  - 新增 `ItineraryOverviewCard` / `ItineraryPlaceFocusCard` 组件；地标点击在 L1 进入景点聚焦、右侧卡片显示该景点前序/后继 leg 路线与出发建议。
  - 新增 domain 方法 `selectLegsForPlace(legs, placeId)` 返回前序/后继 leg 对（`PlaceFocusLegs`）。
- 最近 tiny-change：`.env` 纳入 gitignore 并补 `.env.example`；移除未接入的 `bootstrap/node.ts`，Mapbox 接入收敛为前端公开 token 直连单模式；统一领域术语 `RoutePlan` → `NavigationPlan`（见 `.ai/rfcs/tiny-change-2026-06-25-cleanup-and-terminology.md`）。
- 最近变更（文档与代码质量优化）：
  - 文档结构收敛：`.human/ddd-principles.md` 与 `.human/hexagonal-principles.md` 合并进 `.human/architecture.md`；`.skills/feature-delivery` 删除（流程统一由 `.ai/workflow-feature-delivery.md` 承载）；技能文件去除规则重述仅保留可执行部分。
  - `check-doc-sync` 启发式收紧：仅 `src/domains`、`src/features`、`src/inbound/web/state/command` 变更才要求 RFC/tiny-change 记录。
  - 领域方法补齐单元测试：`tests/domains/trip-planning/`（17 tests）、`tests/domains/trip-navigation/`（21 tests）。
  - `assertPlanInvariants` 已在 `load-trip-plan` 中于 Zod 校验后调用，消除死代码。
  - 重复代码提取到 `shared/`：`parseTimeToMinutes`、`formatMinutesToTime`（`shared/time.ts`）、`haversineDistanceKm`（`shared/geo.ts`）。inbound 层全部改用 domain `TravelMode` 类型。
  - 错误码新增 `day_switch_failed`，`switch-current-day`不再复用 `trip_load_failed`。
  - `handlers.ts` 不再直接 import Zustand singleton，`store` 作为依赖注入。
- 最近变更（路线策略预计算 + 短距离锁定 + L2 提示语）：
  - `handlers.ts`：`pageOpened` / `daySelected` 一次性预计算三种策略（fastest/comfort/cheapest）的路线方案；`strategySelected` 只更新 `selectedStrategy` 状态，不再重新 plan。
  - `plan-trip-routes` catch 兜底改为返回空 `legs` + `isFallback: true` 的 NavigationPlan，而非 `err`，避免一次 fetch 失败导致整天无路线。
  - 新增 `FallbackRoutingGateway`（`outbound/gateways/fallback-routing.gateway.ts`）：Mapbox 路线失败自动回退到 MockRoutingGateway；`bootstrap/web.ts` 在 token 存在时使用该装饰器包装。
  - `TripMapViewModel` 增加 `walkOnlyDay` 字段；`MapToolbar` 在 `walkOnlyDay=true` 时仅渲染"最快"按钮（隐藏 comfort/cheapest）。
  - `MapToolbar` 选中按钮补 `aria-pressed`；`map-canvas.css` 仅对 `:not([aria-pressed="true"])` 应用白色半透明背景，让 HeroUI solid 状态色正常显示。
  - `ItineraryPlaceFocusCard` 的"无路线"提示按首尾位置细化：首景点显"起点景点 · 从这里开始当天的行程"，尾景点显"终点景点 · 当天行程到此结束"，仅有此景点显"当日仅有此景点，无需路线衔接"，其余情况才显"该景点在路线计算时未关联到相邻地点"。
  - `PlaceFocusCardViewModel` 新增 `isFirstInDay` / `isLastInDay` 字段。
- 最近变更（流程与约束强化）：
  - 新增 Definition of Ready（DoR）：`.ai/workflow-feature-delivery.md` §0.3，定义 AI 启动前输入就绪判定标准。
  - 新增 `.human/README.md`：人类使用元指引，文件职责表 + 参与时机 + 启动条件。`AGENTS.md` 入口链接已更新指向。
  - `architecture.md` 测试约定具体化：测试组织（镜像 src）、命名（`*.spec.ts`）、覆盖范围（domain 100%、feature 主路径+失败路径）、Mock 策略（mock port interface、不 mock domain）。
  - `architecture.md` ADR 触发清单明化：6 类偏离必须写 ADR（限界上下文边界变化、依赖方向口径变化、核心框架替换、跨聚合事务、domain 引入 I/O、端口归属偏离）。

## 系统现状

<!-- 已交付能力的一句话快照；随上线更新。起步留空。 -->

- 已建立代码基线：TypeScript + Vitest + Zod + eventemitter3 + React + Vite。
- 已建立本地预览链路：Vite `bun run dev`，默认读取 `src/mocks` 下的 mock 数据。
- 架构校验、DDD 校验与文档同步校验已可通过脚本验证。
- UI 已完成 HeroUI + Tailwind v4 初始化，地图页支持日期切换、点位点击与浮层详情展示。地图按视图层级（overview / day / place）过滤与聚焦；顶部工具栏切换路线策略（最快/舒适/省钱）而非 mode。
- 地图浮层已接入决策提示摘要（建议出发时间、迟到风险、衔接可行性），并支持点击联动右侧活动卡定位。
- 页面交互链路已收敛为“驱动侧输入 -> 应用层编排 -> 应用状态更新 -> 驱动侧渲染”的闭环。
- 行程查看右侧浮层支持三种形态：概览卡（行李总览）、当日行程卡（含逐 leg 时间与距离）、景点聚焦卡（前序/后继 leg 与出发建议）。
- outbound 命名已统一为后缀风格：`*.repository.ts`、`*.validator.ts`（例如 `mock-trip-plan.repository.ts`、`trip-plan-schema.validator.ts`）。

## 已知约束 / 技术债

<!-- 临时妥协、待偿还的债务、已知限制。每条尽量关联 RFC 或 ADR。 -->

- 当前仍以本地固定格式数据为主，不接入外部接口与持久化。
- JSON Schema 为生成产物，需通过 `bun run generate:contracts` 统一更新。
- 生产构建存在体积告警（单 chunk > 500kb），后续需做拆包优化。
- 应用层协作机制当前聚焦单页内交互分发，尚未扩展到跨页面编排。
- Mapbox 接入当前为单模式：前端使用公开 token 直连；`bootstrap/node` 代理策略已移除，待后续如需生产代理再以新 RFC 启动。公共交通当前仍为估算能力（驱动路线 + 时长系数），未接入独立 transit provider。
- 若后续收敛为"严格代理"策略，需要新增 `bootstrap/node` 并补齐对应 RFC、配置与测试迁移计划。
