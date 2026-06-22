# 六边形架构核心原则（Draft）

> 目的：为本项目提供可执行的 Ports & Adapters 约束，确保业务内核稳定、外部技术可替换。
> 定位：本文件是 `.human/architecture.md` 的六边形专项细则；若冲突，以 `.human/architecture.md` 与 ADR 为准并及时修订本文件。

## 1. 依赖方向铁律

- MUST：仅允许 `inbound/bootstrap/outbound -> features -> domains` 的调用方向。
- MUST：`outbound` 只实现 `features` 定义的 outbound ports。
- MUST：`src/bootstrap` 仅负责依赖注入与组装，不承担业务决策。
- MUST NOT：`domains` 依赖任何 inbound/bootstrap/outbound、框架或 I/O 组件。

## 2. Inbound Port（驱动侧入口）

- MUST：所有业务用例通过 inbound port 暴露，不允许入口层直连 domain 或 DB。
- SHOULD：inbound port 输入输出使用稳定的用例语义，避免协议细节泄漏。
- MUST NOT：在 `inbound` 写业务不变量或状态机规则。

## 3. Outbound Port（被驱动侧依赖）

- MUST：DB、支付、缓存、消息、第三方 API 等依赖统一经 outbound port 抽象。
- MUST：port 名称表达业务能力而非底层技术。
- MUST NOT：feature 直接 import 具体 SDK 客户端。

## 4. Adapter 职责边界

- `inbound` MUST：处理协议解析、页面交互、状态组织与命令分发，再调用 use case。
- `outbound` MUST：处理外部调用、重试/超时、错误映射与防腐转换。
- inbound/outbound MUST NOT：承载领域规则、聚合不变量或跨聚合用例编排逻辑。

## 5. Composition Root（`src/bootstrap`）

- MUST：在 `src/bootstrap` 完成实现注入（ports <- inbound/outbound）与应用启动。
- MUST NOT：在 `src/bootstrap` 新增业务分支、规则判断或事务编排。

## 6. 边界转换与错误语义

- MUST：外部模型与内部模型转换只发生在 adapter。
- MUST：外部异常在 adapter 映射为系统内部可理解的错误语义后再向内传递。
- MUST NOT：把 HTTP/MQ/SDK 原生对象直接传入 domain。

## 7. 一致性与事务策略

- MUST：单聚合一致性在域内保证；跨聚合由 feature 显式编排与补偿流程达成最终一致。
- SHOULD：在 feature 显式定义事务边界与失败补偿策略。
- MUST NOT：跨多个外部系统依赖单一本地事务假设强一致。

## 8. 可观测性与横切关注点

- SHOULD：日志、指标、追踪放在 adapter 或 feature 装饰器层实现。
- MUST NOT：在 domain 引入日志 SDK、埋点 SDK 或 tracing SDK。

## 9. 测试与验证（六边形维度）

- MUST：feature 用例测试覆盖端口交互、成功/失败路径。
- MUST：adapter 测试覆盖契约映射、错误翻译、重试与超时语义。
- SHOULD：关键 ports 具备 contract tests，确保替换 adapter 时行为一致。
