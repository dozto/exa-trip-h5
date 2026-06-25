# 领域：trip-navigation

## 1. 领域目标
基于 `trip-planning` 提供的活动地点与时间安排，产出可执行的出行路线预估与活动事件预估，帮助用户在出发前完成“怎么走、多久到、何时出发、风险多大”的决策。

## 2. 业务职责（负责）
- 计算活动地点与地点间的预估通行时间与距离。
- 按交通方式提供路线预估：`walk`（步行）、`transit`（公共交通）、`drive`（驾车）。
- 为同一出行段提供多方案路线：`fastest`（最快）、`comfort`（最舒适/风景更优）、`cheapest`（最省钱）。
- 针对活动生成事件预估：建议出发时间、到达缓冲时间、迟到风险、活动超时风险。
- 在多活动日程下，计算相邻活动间可行衔接性（是否来得及、建议调整量）。

## 3. 业务边界（不负责）
- 实时导航执行（转向指引、语音导航、实时重规划）。
- 交通服务履约（打车叫车、购票、订座、改签）。
- 实时路况与天气驱动的即时控制（本领域输出“预估”，非“即时调度”）。

## 4. 上下文关系
- 上游输入：`trip-planning`
  - 提供活动时间、活动地点、日期、城市/区域、用户偏好。
- 下游消费：
  - 旅行计划展示与提醒能力（使用本领域输出的路线方案与风险等级）。
- 语义约束：
  - `trip-navigation` 不改写 `trip-planning` 的活动事实，只提供预估与建议。

## 5. 核心概念（统一语言）
- `NavigationPlan`：一次计划内全部路线与事件预估结果。
- `RouteLeg`：相邻两个活动地点之间的一段出行。
- `RouteOption`：某段出行在特定策略下的一种可选路线方案（携带 `strategy` 标签：`fastest` / `comfort` / `cheapest`）。
- `PlaceFocusLegs`：以某地点为视角的前序/后继 leg 对（`predecessor` / `successor`），支撑景点聚焦视图。
- `TransportModeEstimate`：某交通方式下的时长、费用、换乘/停车等预估。
- `EventEstimate`：面向活动的时间风险预估（建议出发、缓冲、准点概率、超时风险）。
- `FeasibilityAssessment`：多活动串联后的可达性评估（可行/紧张/不可行）。

## 6. 关键业务规则（不变量）
- 每个 `RouteLeg` 至少包含 1 个可用路线方案；无可用方案时必须返回“不可评估”原因。
- 预估必须区分交通方式（步行/公交/驾车），不可混淆输出，短距离只提供 步行路线和预估。
- 多方案语义固定：
  - `fastest`：优先最短总耗时；
  - `comfort`：优先低负担/高景观（允许时间略高）；
  - `cheapest`：优先最低费用（允许时间略高）。
- 事件预估必须绑定活动时间窗，至少产出：
  - `recommendedDepartureTime`
  - `suggestedBufferMinutes`
  - `latenessRiskLevel`（低/中/高）
- 同日活动衔接必须给出可达性结论：
  - `feasible` / `tight` / `infeasible`，并附最小调整建议（提前出发或缩短停留）。
- 所有预估需标注生效上下文（日期、时段、城市/区域），避免跨场景误用。

## 7. 建议输出结构（业务语义）
- 路线维度：`mode`、`strategy`、`estimatedDurationMinutes`、`estimatedCost`、`distanceKm`、`confidence`。
- 事件维度：`activityId`、`recommendedDepartureTime`、`bufferMinutes`、`latenessRiskLevel`、`overrunRiskLevel`。
- 衔接维度：`fromActivityId`、`toActivityId`、`feasibility`、`adjustmentSuggestion`.

## 8. 术语约定
- “路线预估”指地点到地点的通行预测，不等于实时导航。
- “事件预估”指活动层面的时间风险预测，不等于活动内容执行。
- “可行性”指时间上可衔接，不代表用户主观满意度。

## 9. 领域方法（Domain Methods）
- `filterModesByContext(modes, context)`：按出行上下文筛选可用 mode（如短距离优先步行）。
- `selectOptionByStrategy(options, strategy)`：按策略选择候选路段；若 options 带 `strategy` 字段则优先按字段匹配，否则退化为比较器排序。
- `recommendMode(options, strategy)`：给出推荐出行方式。
- `buildRouteLegs(placeSequence)`：基于地点序列构建路段骨架。
- `selectLegsForPlace(legs, placeId)`：以某地点为视角返回前序/后继 leg 对（`PlaceFocusLegs`），支撑景点聚焦视图。
- `estimateEventRisk(input)`：计算活动级出发建议与风险等级。
- `assessDayFeasibility(links)`：计算相邻活动衔接可行性与调整建议。
- `composeNavigationPlan(input)`：组装标准化 `NavigationPlan` 结果。

## 10. 链接
- 代码：`src/domains/trip-navigation/route-plan.ts`、`src/domains/trip-navigation/route-plan.methods.ts`
