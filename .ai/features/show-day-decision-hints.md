# 特性：show-day-decision-hints

## 最小必填（5 项）

- [x] 用例目标
- [x] 边界（本次不做）
- [x] inbound/outbound ports
- [x] 编排步骤
- [x] 验收标准（可测试）

## 用例目标

在用户查看某天行程时，基于已计算路线与活动时间窗产出“建议出发时间、缓冲时间、迟到风险、活动衔接可行性”决策提示。
该结果由 `view-itinerary` 聚合消费，并用于地图摘要与右侧活动卡提示联动。

## inbound ports（触发入口）

- `ShowDayDecisionHints({ tripPlan, dayId, navigationPlan, strategy, defaultBufferMinutes }) -> Result<DayDecisionHints, AppError>`

## outbound ports（被驱动依赖）

- 无（纯 domain 编排）

## 编排步骤

1. 读取当天活动列表，不存在 day 时返回受控错误。
2. 根据相邻活动地点与 navigationPlan 分段，按 strategy 选择路段方案。
3. 使用 `trip-navigation.estimateEventRisk` 生成活动级事件预估。
4. 使用 `trip-navigation.assessDayFeasibility` 生成活动衔接可达性结论。
5. 返回 `DayDecisionHints`（含更新时间戳），供页面状态层消费。

## 依赖

- domain=`trip-planning`, `trip-navigation`

## 测试清单（先写）

- [x] 返回活动级事件预估与衔接可行性
- [x] day 不存在时返回受控错误

## 链接

- 代码：`src/features/show-day-decision-hints/`

## 验收标准（可测试）

- 给定合法 `tripPlan/dayId/navigationPlan`，返回事件预估与衔接可行性结果。
- 给定不存在 `dayId`，返回受控错误，且不产生无效输出。

## 边界（本次不做）

- 不做实时路况驱动的动态重算。
- 不做 turn-by-turn 导航执行与语音播报。
