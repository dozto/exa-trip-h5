# 统一语言（Glossary · Ubiquitous Language）

<!-- DDD 统一语言：业务方、人、AI、代码共用同一套术语。
人主笔、随 domain 出现增补。术语应与 src/domains 中的类型 / 方法名保持一致。 -->

| 术语 | 定义 | 所属上下文 |
|------|------|------------|
<!-- 示例（删除或替换为真实术语）：
| 订单 Order | 一次购买的聚合根，含若干订单行与状态机 | ordering |
| 履约 Fulfillment | 订单确认后到交付的过程 | ordering |
-->
| 行程 TripPlan | 一次旅行的聚合根，包含元信息与按天行程 | trip-planning |
| 行程日 TripDay | 行程中的单日计划，按日期组织活动条目 | trip-planning |
| 活动条目 ActivityItem | 单个活动安排，包含内容、时长、地点与时间段（代码中兼容 `ItineraryItem`） | trip-planning |
| 地点 Place | 可被多个行程条目引用的地点信息实体 | trip-planning |
| 准备事项 PreparationItem | 出行前或活动前需要准备的事项，带优先级 | trip-planning |
| 建议 SuggestionItem | 关于时间、路线、安全、预算等提示信息 | trip-planning |
| 当前查看日 CurrentDay | 用户当前聚焦展示的行程日状态 | trip-planning |
| 路线方案 NavigationPlan | 一次行程展示中由地点序列计算得到的路径方案集合 | trip-navigation |
| 路段 RouteLeg | 路线中相邻两地点之间的单段路径语义 | trip-navigation |
| 路段选项 RouteOption | 某路段在特定出行方式与策略下的候选方案（时间、距离、费用、几何） | trip-navigation |
| 出行方式 TravelMode | 路径规划可选方式（walk / transit / drive） | trip-navigation |
| 路线策略 RouteStrategy | 路线选择策略（fastest / comfort / cheapest） | trip-navigation |
| 事件预估 EventEstimate | 活动级时间风险结果（建议出发、缓冲、迟到/超时风险） | trip-navigation |
| 决策提示 DayDecisionHints | 当天汇总决策结果（事件预估 + 活动衔接可行性） | trip-navigation |
| 衔接评估 FeasibilityAssessment | 相邻活动在时间上是否可衔接的评估与调整建议 | trip-navigation |
| 可行性等级 FeasibilityLevel | 活动衔接结论（feasible / tight / infeasible） | trip-navigation |
| 加载行程 LoadTripPlan | 读取并校验 TripPlan 的用例语义 | view-itinerary |
| 切换当前日 SwitchCurrentDay | 切换当前展示 dayId 的用例语义 | view-itinerary |
| 规划日路线 PlanTripRoutes | 基于当天地点序列计算路线候选并支持缓存降级 | plan-trip-routes |
| 展示决策提示 ShowDayDecisionHints | 基于路线和活动时间窗生成出发建议与风险提示 | show-day-decision-hints |
| 前端代理 BFF | 前端后端代理层（鉴权/限流/缓存/错误翻译）；当前未实现，预留概念 | platform |
| 视图层级 ViewLevel | 行程查看的三层聚焦状态：overview / day / place | view-itinerary |
| 选中景点 SelectedPlace | 用户当前聚焦查看的地点 ID（仅在 viewLevel=place 时有效） | view-itinerary |
| 选中路线策略 SelectedStrategy | 当前驱动路线展示的策略（fastest / comfort / cheapest），默认 fastest | view-itinerary |
| 景点聚焦卡片 PlaceFocusCard | L2 视图右侧大面板，展示该景点详情及前序/后继 leg 路线与事件预估 | view-itinerary |
| 行程总览卡 OverviewCard | L0 视图右侧摘要：天数、地点数、行程跨度等总览信息 | view-itinerary |
