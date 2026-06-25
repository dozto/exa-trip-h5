# 特性：switch-current-day

## 最小必填（5 项）

- [x] 用例目标
- [x] 边界（本次不做）
- [x] inbound/outbound ports
- [x] 编排步骤
- [x] 验收标准（可测试）

## 用例目标

切换当前展示的 `dayId`，为页面聚合特性提供稳定的当前日语义。

## inbound ports（触发入口）

- `SwitchCurrentDay({ dayId }) -> Result<{ currentDayId }, AppError>`

## outbound ports（被驱动依赖）

- 无（纯用例语义）

## 编排步骤

1. 接收 `dayId`。
2. 若 `dayId` 为空，返回受控错误。
3. 返回 `{ currentDayId: dayId }`。

## 依赖

- domain=`trip-planning`

## 测试清单（先写）

- [x] 给定合法 dayId 返回切换结果
- [x] 给定空 dayId 返回受控错误

## 链接

- 代码：`src/features/switch-current-day/`
- 关联：`src/features/view-itinerary.md`

## 验收标准（可测试）

- 给定合法 `dayId`，调用后返回目标 `currentDayId`。
- 给定无效 `dayId`，返回受控错误且不改变状态语义。

## 边界（本次不做）

- 不负责读取 `TripPlan`（由 `load-trip-plan` 负责）。
- 不负责路线预估与决策提示计算（由相关子 feature 负责）。
