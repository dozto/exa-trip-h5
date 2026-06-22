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
| 行程条目 ItineraryItem | 单个活动安排，包含内容、时长、地点与时间段 | trip-planning |
| 地点 Place | 可被多个行程条目引用的地点信息实体 | trip-planning |
| 准备事项 PreparationItem | 出行前或活动前需要准备的事项，带优先级 | trip-planning |
| 建议 SuggestionItem | 关于时间、路线、安全、预算等提示信息 | trip-planning |
| 当前查看日 CurrentDay | 用户当前聚焦展示的行程日状态 | trip-planning |
| UI 事件 UiEvent | 由驱动侧交互触发、进入应用层的请求语义 | trip-planning |
| 应用事件 AppEvent | 应用层内部用于协作的事件语义，不绑定具体实现 | trip-planning |
