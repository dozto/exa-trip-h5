# 特性：plan-trip-routes

## 最小必填（5 项）

- [x] 用例目标
- [x] 边界（本次不做）
- [x] inbound/outbound ports
- [x] 编排步骤
- [x] 验收标准（可测试）

## 用例目标

在用户查看某天行程时，基于当天地点序列计算 A->B 分段路线，返回 walk/transit/drive 候选与推荐模式，并支持缓存降级。

## inbound ports（触发入口）

- `PlanTripRoutes({ tripPlan, dayId, departureTime, strategies?, modes? }) -> Result<NavigationPlan, AppError>`
  - 优先使用 `strategies`（fastest / comfort / cheapest）；若仅提供 `modes` 则走兼容路径，每 leg 只产出 fastest 单方案。
  - 默认未提供两者时使用 `strategies = ["fastest", "comfort", "cheapest"]`。

## outbound ports（被驱动依赖）

- `RoutingGateway.planRoute({ from, to, mode, strategy?, departureTime })`
- `LiveCacheRepository.getNavigationPlan(cacheKey)`
- `LiveCacheRepository.setNavigationPlan(cacheKey, value, ttlSeconds)`

## 编排步骤

1. 使用 `trip-planning.buildDayPlaceSequence` 读取当天地点序列。
2. 若地点少于 2 个，直接返回空路线语义。
3. 对每个路段先调用 `trip-navigation.filterModesByContext` 过滤 mode（短距离优先仅步行），再按 `strategies × modes` 笛卡尔积调用 `RoutingGateway.planRoute`（含 `strategy` 入参）获取候选。
4. 每个 `RouteOption` 由结果补上 `strategy` 标签；`recommendedMode` 由 `recommendMode(options, "fastest")` 计算。
5. 组合为 `NavigationPlan`，写入短 TTL 缓存（缓存 key 含策略集合）。
6. 若外部调用失败，优先返回缓存并标记 `isFallback=true`。

## 依赖

- domain=`trip-planning`, `trip-navigation`
- outbound=`RoutingGateway`, `LiveCacheRepository`

## 测试清单（先写）

- [x] 当日地点 >= 2 时返回分段路线与模式候选
- [x] 当日地点 < 2 时返回空路线且不调用 RoutingGateway
- [x] RoutingGateway 失败时命中缓存并返回降级状态
- [x] RoutingGateway 与缓存都失败时返回受控错误
- [x] 短距离路段触发 mode 过滤，仅返回步行候选

## 链接

- 代码：`src/features/plan-trip-routes/`
- RFC：`.ai/rfcs/RFC-0002-mapbox-live-navigation.md`、`.ai/rfcs/RFC-0004-place-focus-view-and-strategy-routing.md`

## 验收标准（可测试）

- 给定有效地点序列，当调用用例时，返回按路段组织的路线结果并包含更新时间戳。
- 给定外部路由失败但缓存存在，当调用用例时，返回缓存结果并标记降级。
- 给定输入无效或数据不足，当调用用例时，返回可预测语义（空路线或受控错误）。

## 边界（本次不做）

- 不实现 transit 全量接入与换乘细节。
- 不实现 turn-by-turn 导航指令。
