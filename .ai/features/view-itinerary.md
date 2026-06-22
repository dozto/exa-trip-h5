# 特性：view-itinerary

## 最小必填（5 项）

- [x] 用例目标
- [x] 边界（本次不做）
- [x] inbound/outbound ports
- [x] 编排步骤
- [x] 验收标准（可测试）

## 用例目标

在 H5 页面中完成行程浏览闭环：加载 trip、按日期切换、地图点位联动并展示当日详情。

## inbound ports（触发入口）

- `LoadTripPlan({ tripId }) -> Result<{ tripPlan, currentDayId }, AppError>`
- `SwitchCurrentDay({ dayId }) -> Result<{ currentDayId }, AppError>`

## outbound ports（被驱动依赖）

- `TripPlanRepository.loadById(tripId)`
- `TripPlanSchemaValidator.validate(rawData)`

## 编排步骤

1. 调用 `LoadTripPlan` 输入 `tripId` 并加载原始数据。
2. 通过 `TripPlanSchemaValidator` 完成结构校验。
3. 返回 `{ tripPlan, currentDayId }` 或受控错误。
4. 调用 `SwitchCurrentDay` 输入 `dayId`，返回 `{ currentDayId }` 或受控错误。

## 测试清单（先写）

- [x] 加载成功路径
- [x] schema 非法路径
- [x] trip 不存在路径
- [x] repository 异常路径

## 链接

- 代码：`src/features/load-trip-plan/`、`src/features/switch-current-day/`

## 验收标准（可测试）

- 给定合法 trip id，`LoadTripPlan` 返回默认 `currentDayId` 与完整 `tripPlan`。
- 给定非法/不存在数据，`LoadTripPlan` 返回受控错误且不产生无效结果。
- 给定合法 dayId，`SwitchCurrentDay` 返回目标 `currentDayId`。

## 边界（本次不做）

- 不接入外部 API、数据库与账户系统。
- 不实现行程编辑、拖拽排序、多人协同。
