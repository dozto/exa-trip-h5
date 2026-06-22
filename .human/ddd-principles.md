# DDD 核心原则（Draft）

> 目的：为本项目提供无歧义的 DDD 执行约束，指导 AI 与人协作设计、实现与评审。
> 定位：本文件是 `.human/architecture.md` 的 DDD 专项细则；若冲突，以 `.human/architecture.md` 与 ADR 为准并及时修订本文件。

## 1. 统一语言（Ubiquitous Language）

- MUST：业务术语先登记到 `.human/glossary.md`，再进入 `src/` 命名。
- MUST：领域类型、方法名、事件名使用业务词汇，不使用模糊技术词（如 `Manager`、`Helper`）表达业务概念。
- MUST NOT：在不同上下文中复用同名但含义不同的术语。

## 2. 限界上下文（Bounded Context）

- MUST：每个上下文内保持单一语义模型；跨上下文交互使用契约或事件，不共享内部模型。
- SHOULD：出现术语冲突、生命周期冲突、职责冲突时，拆分上下文并记录到 `.human/architecture.md`。
- MUST NOT：跨上下文直接引用他方领域对象实现“快捷复用”。

## 3. 聚合与一致性边界

- MUST：聚合根负责维护不变量与状态迁移合法性。
- MUST：单事务只修改一个聚合；跨聚合一致性通过 feature 编排与显式流程控制实现。
- MUST NOT：在 feature 或 adapter 中绕过聚合根直接改写聚合内部状态。

## 4. 实体、值对象、领域服务

- MUST：有身份与生命周期的是实体；无身份且不可变的是值对象。
- MUST：跨实体且不归属单一实体的业务规则落在领域服务（`src/domains`）。
- MUST NOT：把业务规则放到 `src/features`、`src/inbound`、`src/outbound` 或 `src/bootstrap`。

## 5. 领域事件

- 本项目当前不采用领域事件机制；domain 通过类型与返回结果表达业务语义。
- 页面交互事件仅用于应用层（`inbound/web/state`）命令分发，使用 `eventemitter3`。
- MUST NOT：在 domain 中定义或依赖具体事件总线实现。

## 6. 边界转换与防腐层（ACL）

- MUST：外部 DTO 与领域模型的转换只在 adapter 层进行。
- MUST：对接外部系统时，outbound adapter 承担 ACL 职责，隔离外部语义污染。
- MUST NOT：外部字段或外部错误类型直接进入 domain。

## 7. Repository 与 Port 边界

- MUST：依赖外部资源的能力通过 port 抽象后由 adapter 实现。
- SHOULD：port 命名表达业务意图而非技术实现（如 `LoadActiveSubscriptions` 优于 `QuerySubscriptionTable`）。
- MUST NOT：domain 直接依赖 ORM、数据库客户端或第三方 SDK。

## 8. 测试与验证（DDD 维度）

- MUST：domain 测试覆盖不变量、状态机与关键分支。
- MUST：feature 测试覆盖用例编排、端口调用、失败路径与补偿逻辑。
- SHOULD：adapter 测试覆盖 DTO 映射、重试/超时语义与错误翻译。
