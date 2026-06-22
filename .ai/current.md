# 当前状态（.ai/current.md）

> 系统此刻的状态快照，随交付滚动更新。只记"现在"；变更的来龙去脉在 `rfcs/`。

## 当前焦点

<!-- 正在进行的特性 / 变更，链接活跃 RFC。
示例：- 实现 checkout 结算，见 [RFC-0001](rfcs/RFC-0001-checkout.md) -->

- 结构改造已进入稳定阶段：`src/features` 平铺、`src/inbound`/`src/outbound`/`src/bootstrap` 分层协作（见 [RFC-0001](./rfcs/RFC-0001-itinerary-h5-module-split.md)）。
- 当前重点是收敛 itinerary 页面模型与地图联动交互，持续清理无用代码并保持文档同步。
- inbound web 已完成目录语义收敛：`events/` 承载事件总线机制，`state` 细分为 `command/state/store`，`styles` 拆分为 `index + pages + components`。

## 系统现状

<!-- 已交付能力的一句话快照；随上线更新。起步留空。 -->

- 已建立代码基线：TypeScript + Vitest + Zod + eventemitter3 + React + Vite。
- 已建立本地预览链路：Vite `bun run dev`，默认读取 `src/mocks` 下的 mock 数据。
- 架构校验、DDD 校验与文档同步校验已可通过脚本验证。
- UI 已完成 HeroUI + Tailwind v4 初始化，地图页支持日期切换、点位点击与浮层详情展示。
- 页面交互链路已收敛为“驱动侧输入 -> 应用层编排 -> 应用状态更新 -> 驱动侧渲染”的闭环。
- outbound 命名已统一为后缀风格：`*.repository.ts`、`*.validator.ts`（例如 `mock-trip-plan.repository.ts`、`trip-plan-schema.validator.ts`）。

## 已知约束 / 技术债

<!-- 临时妥协、待偿还的债务、已知限制。每条尽量关联 RFC 或 ADR。 -->

- 当前仍以本地固定格式数据为主，不接入外部接口与持久化。
- JSON Schema 为生成产物，需通过 `bun run generate:contracts` 统一更新。
- 生产构建存在体积告警（单 chunk > 500kb），后续需做拆包优化。
- 应用层协作机制当前聚焦单页内交互分发，尚未扩展到跨页面编排。
