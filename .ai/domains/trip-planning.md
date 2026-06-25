# 领域：trip-planning

## 1. 领域目标
以固定模板组织一次旅行计划，确保用户在旅行期间可按天获取活动安排、地点信息、准备事项与建议。

## 2. 业务职责（负责）
- 定义并维护“模板化旅行计划”的结构与语义。
- 管理多天行程（TripDay）及其顺序关系。
- 管理每天的活动条目（ActivityItem）及时间/时长信息。
- 管理活动关联地点（Place）及地点说明信息。
- 维护活动级准备事项与建议。
- 汇总并维护天级准备事项与建议（基于当日活动，可补充）。

## 3. 业务边界（不负责）
- 实时出行决策：路线优化、交通拥堵规避、天气驱动改期。
- 交易履约：预订下单、支付、退款、改签等交易过程。
- 实时服务执行：导航、打车、现场排队等即时服务编排。

## 4. 核心概念
- `TripPlan`：一次完整旅行计划（聚合根）。
- `TripDay`：某一天的计划单元（日期、天序、活动集合）。
- `ActivityItem`：单条活动安排（标题、时间/时长、类别、地点引用、活动级准备与建议）。
- `Place`：地点资料（名称、地址、坐标、亮点/提示）。
- `PreparationItem`：准备事项（必须/建议/可选）。
- `SuggestionItem`：建议项（时机、路线、安全、预算等类型）。

## 5. 关键业务规则（不变量）
- 计划至少包含 1 天。
- `startDate <= endDate`，`TripDay.date` 在计划日期范围内。
- `dayIndex` 从 1 开始且唯一；`date` 在同一计划内唯一。
- 活动时长 `durationMinutes` 为正整数。
- 活动若引用 `placeId`，该地点必须存在于计划地点集中。
- 天级准备/建议需与当日活动语义一致（可由活动汇总并允许人工补充）。

## 6. 统一语言
- 建议统一用 `ActivityItem`（替代 `ItineraryItem`），避免“itinerary/plan/item”语义重叠。
- `TripDay` 表示“天”，`ActivityItem` 表示“活动条目”，`Place` 表示“地点主数据”。

## 7. 领域方法（Domain Methods）
- `getDay(plan, dayId)`：读取指定行程日。
- `getDefaultDayId(plan, now, timezone)`：计算默认展示日。
- `listDayActivities(plan, dayId)`：读取当天活动条目列表。
- `buildDayPlaceSequence(plan, dayId)`：按活动顺序提取当天地点序列（去重）。
- `deriveDayPreparations(day)`：聚合活动级 + 天级准备事项（去重）。
- `deriveDaySuggestions(day)`：聚合活动级 + 天级建议（去重）。
- `assertPlanInvariants(plan)`：检查计划关键不变量并返回违规列表。

## 8. 链接
- 代码：`src/domains/trip-planning/trip-plan.ts`、`src/domains/trip-planning/trip-plan.methods.ts`
