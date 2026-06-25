# RFC-0004：景点聚焦视图与策略驱动路线展示

- 状态：accepted
- 变更级别：normal
- 日期：2026-06-25
- 作者：AI / Human
- 模式：fast
- 关联需求：路线查看缺失逐段时间和路线选项；出行方式切换不直观；地图总是显示多天全景点；需要"概览→选天→选景点"三层视图与闭合交互。

## 1) 目标与范围

### 背景/目标

当前 `view-itinerary` 的展示层存在四个已确认缺陷：

1. **路线仅显示总量摘要**：`buildTripMapModel` 只取当前 `selectedTravelMode` 聚合出一个总时长 + 距离 Chip，没有逐 leg 的通行时间、距离、可选方案。
2. `RouteOption` 缺 `strategy` 字段，`RoutingGateway.planRoute` 只按 mode 调一次，不产出 `fastest / comfort / cheapest` 多策略方案；UI 也无策略选择。这与 `trip-navigation` 领域文档 §6/§7 一致描述但代码未落地。
3. **出行方式工具栏失灵**：用户反馈步行/公交/驾车切换看不出效果。根因：只用 `modes: [command.mode]` 单 mode 重算，切换后之前 mode 数据被抹除；且 Mock gateway 几何只有起终点两点，视觉差异极弱。
4. **地图无视当日选择**：`selectMapPoints` 遍历所有天，`MapCanvas.fitBounds` 总是覆盖全量景点；点击 marker 只切天，不聚焦景点、不放大地、不弹景点卡。

本次目标：

- 把"出行方式切换"语义改造为"**路线策略切换**"（fastest / comfort / cheapest），由 domain `selectOptionByStrategy` 自动为每段 leg 选一个 mode 方案；用户不再手动选 mode。
- 补齐 `RouteOption.strategy` 与多策略路线产出，逐 leg 暴露通行时间、距离、几何、策略。
- 引入三层浏览器视图模型：`overview`（概览）→ `day`（选天聚焦）→ `place`（选景点聚焦），并补齐 ESC 逐级退出语义。
- 地图根据 `viewLevel` 决定显示范围：overview 显示全量景点；day/place 只显示并 fit 当天景点；place 进一步放大到选中地点。
- 新增 L2 景点聚焦卡片（右侧大面板替换当天行程卡），展示该景点信息 + 与该景点关联的前序/后继 leg 路线（按当前策略显示通行时间/距离）+ 该景点的 `EventEstimate` 出发建议与风险。
- L0 概览态右侧浮层显示行程总览摘要（天数、地点数、行程跨度、提示"选择一天查看详情"）。
- 优化 Mock `RoutingGateway` 的几何，产出多段折线使切换效果可见。

完成后验收：用户在底部日期条点击某天 → 地图只显示当日景点并 fit；用户点击当天某景点 marker → 地图放大到该点、右侧出现景点聚焦卡含前序/后继 leg 时间/距离/策略及出发建议；用户切换策略 → 各 leg 与时间随之更新；ESC 在 place → day → overview 逐级退出；overview 态显示总览摘要。

### 本次不做

- 不引入实时路况驱动重算。
- 不改 turn-by-turn 导航执行与语音播报。
- 不接入外部账户、预订、支付。
- 不做跨页面导航编排（本次仍在单页内闭环）。
- 不引入新限界上下文与跨聚合事务。

## 2) 关键澄清

### AI 默认假设

- 默认策略 = `fastest`；策略切换发生在顶部工具栏（替换原 mode 按钮位置）；移除独立 mode 切换 UI。
- `RoutingGateway.planRoute` 入参新增 `strategy: RouteStrategy`；feature 对每个 leg 遍历 `strategies × filteredModes` 产出多条 `RouteOption`；缓存 key 含策略。
- L2 卡片"覆盖全天行程"采用右侧大面板替换现有 `ItineraryLocationCard`（非全屏 sheet）。
- ESC 行为为逐级退出：`place → day` 清 `selectedPlaceId`；`day → overview` 清 `currentDayId`；`overview` 时 ESC 无操作。
- `show-day-decision-hints.FeatureInput.strategy` 可选，未传时默认 `fastest`；当前 store 会透传 `selectedStrategy`。
- Mock gateway 几何：除起终点外加 1-2 个中间拐点，并让 fastest/comfort/cheapest 几何路径差异化（comfort 走风景偏移点；cheapest 在两点间略绕路）。

### 待确认决策（<=3）

- 无阻塞决策（用户已确认：①默认策略=fastest 且策略以工具栏呈现；②优化 Mock 几何）。

## 3) 方案

### 领域/Feature 拆分

- `trip-navigation`（domain）：
  - `RouteOption` 结构新增 `strategy: RouteStrategy` 字段。
  - 新增领域方法 `selectLegsForPlace(legs, placeId)`：返回某地点参与的前序/后继 leg（纯函数）。
  - `selectOptionByStrategy` 保留按 comparator 排序的语义；当 options 每条带 `strategy` 时，可优先按 strategy 字段筛选再排序（兼容旧无 strategy 数据）。
  - flagged: `recommendMode` 仍按策略选最优选项的 mode。
- `plan-trip-routes`（feature）：
  - `RoutingGateway.planRoute` 入参增 `strategy`；同一段调用多次产出多策略方案。
  - `PlanTripRoutesInput`: 由 `modes?: TravelMode[]` 改为 `strategies?: RouteStrategy[]`（默认三种），内部按 `filterModesByContext` 决定可用 mode 候选集，再为每个 (strategy, mode) 调一次 gateway。
  - `liveCacheRepository` key 增加策略组合。
- `show-day-decision-hints`（feature）：
  - 保持现状（仍按策略选 leg option 算 travelMinutes）；store 改为透传 `selectedStrategy`。
- `view-itinerary`（聚合特性）：
  - `view-itinerary` inbound 编排多了一个"选景点"和"退出"语义；不引入新 feature，归于 inbound 编排（仍由 view-itinerary 描述）。

### Ports & Adapters 设计

- 新增/变更 inbound command（事件总线语义，不改 architecture 边界）：
  - `travelModeSelected` → **移除**
  - 新增 `strategySelected(strategy: RouteStrategy)`
  - 新增 `placeSelected(placeId: string)`
  - 新增 `viewEscaped()`
- outbound：
  - `RoutingGateway.planRoute` 入参加 `strategy`；两端实现（Mock、Mapbox）同步更新。
  - Mock 额外：按 strategy 的差异化几何 + 可选 `estimatedCost` / `comfortScore` 填充，让 `selectOptionByStrategy` 能在数据上看到差异。
  - Mapbox 额外：请求 `alternatives=true`，挑出更接近"舒适/省钱"的备选。

### 数据与事件

- `RouteOption` 增字段 `strategy: RouteStrategy`。
- inbound store 新增字段：`viewLevel: "overview" | "day" | "place"`、`selectedPlaceId: string | null`、`selectedStrategy: RouteStrategy`（默认 `fastest`），并移除 `selectedTravelMode`。
- `daySwitchSucceeded` 时 `viewLevel = "day"`、`selectedPlaceId = null`；`pageOpened` 默认进入 day（沿用 load 返回的 `currentDayId`）。
- `placeSelected` 只更新 `viewLevel = "place"` 与 `selectedPlaceId`，不重算路线（复用 store 中 `navigationPlan` 的 leg）。
- "逃出"语义由 `viewEscaped` 在 handler 内根据当前 `viewLevel` 决定流转。
-Store 不进 domain，仅 inbound state。

## 4) 验证与风险

### 测试与校验

TDD 顺序：

1. **domain**：`tests/domains/trip-navigation/route-plan.methods.spec.ts`
   - 新增 `selectLegsForPlace` 用例（包含前/后序、无邻 leg、空入）。
   - `selectOptionByStrategy` 对带 strategy 字段 options 的优先筛选行为。
   - `RouteOption.strategy` 类型可被 `composeNavigationPlan` 透传。
2. **feature** `plan-trip-routes`：`tests/features/trip-live/plan-trip-routes.spec.ts`
   - 新增：对每个 leg 产生三条策略方案（fastest/comfort/cheapest），每条带 `strategy`。
   - 新增：缓存 key 含策略集合。
   - 新增：短距离路段按 `filterModesByContext` 收敛到 walk 但仍生成多策略方案。
3. **gateway** `MockRoutingGateway` / `MapboxRoutingGateway`：
   - 新增：Mock 按 strategy 的差异化输出（duration、cost、comfortScore、几何含拐点）。
   - 新增：Mapbox 解析 alternatives 按 strategy 挑选。
4. **inbound** `tests/inbound/web/state/command/handlers.spec.ts`
   - 新增：`strategySelected` → 更新 `selectedStrategy` + 重算路线（strategies 使用新策略集合）。
   - 新增：`placeSelected` → 只切 `viewLevel/selectedPlaceId`，不调用 `planTripRoutes`。
   - 新增：`viewEscaped` 在 `place/day/overview` 三个层级的不同行为。
5. **selectors / view-model**：新增 `tests/inbound/web/state/state/selectors.spec.ts` 覆盖 `viewLevel` 驱动 `selectMapPoints`、`selectPlaceFocusLegs` 等。

校验脚本：

- `bun run test`
- `bun run build`
- `bun run check:architecture`
- `bun run check:ddd`
- `bun run check:doc-sync`

### 风险与回滚

- 风险：`RouteOption.strategy` 是新增字段，旧 tests 与旧缓存可能缺省。
  - 缓解：`selectOptionByStrategy` 兼容无 strategy 字段（fallback 到原 comparator）。
  - 缓存 key 变更后会 miss 一次重算（可接受）。
- 风险：三层视图状态机扩展使 store 膨胀。
  - 缓解：状态字段集中在 store，view-model 仅做纯投影；不进 domain。
- 风险：Mock 几何变化可能干扰既有快照测试。
  - 缓解：本次测试以断言关键字段（duration/cost/strategy）为主，几何仅判断点数，避免脆弱。
- 回滚：本次均为可逆调整，字段添加与命令替换独立可回滚；如某阶段不可用，按阶段回退且 RFC 状态置 `superseded`。

## 5) 变更清单

### 预计改动路径

- `src/domains/trip-navigation/route-plan.ts`、`route-plan.methods.ts`
- `src/features/plan-trip-routes/`（port/types/index）
- `src/features/show-day-decision-hints/`（入参策略可选，store 调用处更新）
- `src/outbound/gateways/mock-routing.gateway.ts`、`mapbox-routing.gateway.ts`
- `src/inbound/web/state/command/events.ts`、`commands.ts`、`handlers.ts`
- `src/inbound/web/state/store/view-store.ts`
- `src/inbound/web/state/state/selectors.ts`、`view-model.ts`、`itinerary-page-model.ts`
- `src/inbound/web/components/map-canvas.tsx`、`map-toolbar.tsx`、`itinerary-page.tsx`、`itinerary-location-card.tsx`
- 新增 `src/inbound/web/components/itinerary-overview-card.tsx`、`itinerary-place-focus-card.tsx`
- `src/bootstrap/web.ts`（handler 依赖无变化、store 上层字段同步）
- `tests/**`对应上述路径镜像
- 文档：`.ai/domains/trip-navigation.md`、`.ai/features/view-itinerary.md`、`.ai/features/plan-trip-routes.md`、`.human/glossary.md`、`.ai/current.md`

### 文档回写

- [x] `.ai/current.md`
- [x] `.ai/domains/trip-navigation.md`
- [x] `.ai/features/view-itinerary.md`
- [x] `.ai/features/plan-trip-routes.md`
- [x] `.human/glossary.md`

## 6) 决策记录

- 决策：accepted
- 决策人：Human（确认模式与 Mock 几何优化）
- 决策时间：2026-06-25
- 备注：顶部工具栏语义从 mode 切换转为 strategy 切换；默认 fastest；L2 用右侧大面板替换 location-card；ESC 逐级退出。