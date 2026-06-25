# 特性：load-trip-plan

## 最小必填（5 项）

- [x] 用例目标
- [x] 边界（本次不做）
- [x] inbound/outbound ports
- [x] 编排步骤
- [x] 验收标准（可测试）

## 用例目标

根据 `tripId` 加载并校验固定模板行程，返回可消费的 `TripPlan` 与默认 `currentDayId`。

## inbound ports（触发入口）

- `LoadTripPlan({ tripId }) -> Result<{ tripPlan, currentDayId }, AppError>`

## outbound ports（被驱动依赖）

- `TripPlanRepository.loadById(tripId)`
- `TripPlanSchemaValidator.validate(rawData)`

## 编排步骤

1. 调用 `TripPlanRepository.loadById` 读取原始行程数据。
2. 若数据不存在，返回 `trip_not_found`。
3. 调用 `TripPlanSchemaValidator.validate` 校验结构。
4. 若校验失败，返回 `trip_invalid_schema`。
5. 返回 `{ tripPlan, currentDayId }`，默认 day 取首个 `TripDay`。

## 依赖

- domain=`trip-planning`
- outbound=`TripPlanRepository`, `TripPlanSchemaValidator`

## 测试清单（先写）

- [x] 加载成功路径
- [x] schema 非法路径
- [x] trip 不存在路径
- [x] repository 异常路径

## 链接

- 代码：`src/features/load-trip-plan/`
- 关联：`src/features/switch-current-day/`、`src/features/view-itinerary.md`

## 验收标准（可测试）

- 给定合法 `tripId`，调用 `LoadTripPlan` 返回有效 `tripPlan` 与默认 `currentDayId`。
- 给定缺失或非法数据，返回受控错误且不返回无效 `TripPlan`。

## 边界（本次不做）

- 不负责路线预估与事件预估。
- 不负责行程编辑、生成、同步。
