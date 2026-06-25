# 特性：view-itinerary

## 最小必填（5 项）

- [x] 用例目标
- [x] 边界（本次不做）
- [x] inbound/outbound ports
- [x] 编排步骤
- [x] 验收标准（可测试）

## 用例目标

在 H5 页面中完成行程浏览闭环：加载 trip、按日期切换，并稳定展示当日关键信息（活动、地点、准备事项、建议）。
该特性为“页面聚合特性”，负责编排子用例，不直接承载所有业务计算细节。

## 特性分层（本次调整）

- 页面聚合特性：`view-itinerary`
  - 负责页面生命周期内的输入编排、状态装配、错误/降级语义展示。
- 子用例特性：
  - `load-trip-plan`：加载并校验行程。
  - `switch-current-day`：切换当前展示 day。
  - `plan-trip-routes`：按天计算地点间路线并处理缓存降级。
  - `show-day-decision-hints`：基于路线与时间窗生成决策提示。

## inbound ports（触发入口）

- `LoadTripPlan({ tripId }) -> Result<{ tripPlan, currentDayId }, AppError>`
- `SwitchCurrentDay({ dayId }) -> Result<{ currentDayId }, AppError>`
- `PlanTripRoutes({ tripPlan, dayId, departureTime, modes }) -> Result<NavigationPlan, AppError>`
- `ShowDayDecisionHints({ tripPlan, dayId, navigationPlan, strategy, defaultBufferMinutes }) -> Result<DayDecisionHints, AppError>`

## outbound ports（被驱动依赖）

- `TripPlanRepository.loadById(tripId)`
- `TripPlanSchemaValidator.validate(rawData)`
- `RoutingGateway.planRoute({ from, to, mode, departureTime })`
- `LiveCacheRepository.getNavigationPlan(cacheKey)`
- `LiveCacheRepository.setNavigationPlan(cacheKey, value, ttlSeconds)`

## 编排步骤

1. 调用 `LoadTripPlan` 输入 `tripId` 并加载原始数据。
2. 通过 `TripPlanSchemaValidator` 完成结构校验。
3. 返回 `{ tripPlan, currentDayId }` 或受控错误。
4. 调用 `PlanTripRoutes` 产出当天路线候选与推荐方式。
5. 调用 `ShowDayDecisionHints` 产出活动级事件预估与衔接可行性。
6. 调用 `SwitchCurrentDay` 输入 `dayId`，在切换后重复步骤 4-5。
7. 使用 `trip-planning` domain methods 读取当日活动与汇总信息，驱动 UI 渲染。

## 测试清单（先写）

- [x] 加载成功路径
- [x] schema 非法路径
- [x] trip 不存在路径
- [x] repository 异常路径

## 链接

- 代码：`src/features/load-trip-plan/`、`src/features/switch-current-day/`
- 关联：`src/features/plan-trip-routes/`、`src/features/show-day-decision-hints/`
- 编排入口：`src/inbound/web/state/command/handlers.ts`
- RFC：`.ai/rfcs/RFC-0003-decision-hints-and-view-orchestration.md`

## 验收标准（可测试）

- 给定合法 trip id，`LoadTripPlan` 返回默认 `currentDayId` 与完整 `tripPlan`。
- 给定非法/不存在数据，`LoadTripPlan` 返回受控错误且不产生无效结果。
- 给定合法 dayId，`SwitchCurrentDay` 返回目标 `currentDayId`。
- 给定 dayId，能稳定读取当天活动/地点序列并保持语义一致。
- 给定路线可用，`PlanTripRoutes` 与 `ShowDayDecisionHints` 的结果在页面状态中可被消费。
- 给定外部失败，页面能展示受控错误或降级提示且不阻塞核心浏览链路。

## 边界（本次不做）

- 不接入外部 API、数据库与账户系统。
- 不实现行程编辑、拖拽排序、多人协同。
- 不将路线计算与事件预估逻辑内联到页面层（保持子 feature 独立）。
