# 拆分规则（Splitting Rules）

> 本文件说明架构拆分的 "how/why"。
> "what" 见 [`.human/architecture.md`](./architecture.md)。

## 目标

- 用最小认知成本把变更放在正确层级。
- 让 AI 与 Human 在拆分时使用同一判断标准。

## 分层判定顺序（How）

按顺序判断，命中即归位：

1. **是否改变业务不变量或领域语义？** 是 -> `domains/`
2. **是否是一个用例编排或端口交互流程？** 是 -> `features/`
3. **是否是驱动侧输入适配（页面、HTTP、CLI、Worker）？** 是 -> `inbound/`
4. **是否是应用态组织（状态、选择器、页面控制流）？** 是 -> `inbound/web/state/`
5. **是否是边界输入校验（query/form/route/body）？** 是 -> `inbound/*/validators/`
6. **是否是外部系统实现（DB/API/MQ/Cache/外部返回校验）？** 是 -> `outbound/`
7. **是否只是依赖装配与启动？** 是 -> `bootstrap/`

若一个改动同时命中多层，拆成多个提交/步骤，保持每层职责单一。

### 速记口诀（提交前 10 秒自检）

- 规则与不变量 -> `src/domains/`
- 用例编排与端口 -> `src/features/`
- 页面/路由/组件/状态/命令分发 -> `src/inbound/`
- 入站边界校验（query/form/route/body）-> `src/inbound/*/validators/`
- 仓储/网关/映射器/出站边界校验 -> `src/outbound/`
- 依赖注入与启动 -> `src/bootstrap/`
- 通用无业务工具 -> `src/shared/`

## Feature 拆分规则（How）

一个 feature 对应一个可测试用例能力。出现下列任一情况时应拆分新 feature：

- 输入输出语义发生变化。
- 失败策略或补偿语义不同。
- 依赖的 outbound ports 集合不同。
- 事务边界或一致性边界不同。

## Inbound State 拆分规则（How）

`inbound/web/state` 只承载应用层状态与控制流，不承载业务不变量。

- 同一页面可维护一个主 state 模块；复杂时按子视图拆分 selector/view-model。
- state 负责组合多个 feature 结果，但不改写 domain 规则。
- state 可变，domain/feature 优先保持稳定。

推荐结构（复杂页面）：

- `state/command/`：页面命令协议、命令创建器、命令处理器
- `state/state/`：selector、view-model、页面模型 hook
- `state/store/`：状态容器与 runtime context
- `events/`：事件总线等通用传输机制（不放页面业务规则）

## Validator 放置规则（How）

- 仅做类型/结构解析也要按边界归位，不按技术库归位。
- 用户输入解析（query/form/path/body）放 inbound adapter。
- 外部依赖返回解析（API/DB/file/mock/SDK）放 outbound adapter。
- 可复用 schema/工具可放 `shared/validation`，但具体边界错误翻译留在 adapter。

## 为什么这样拆（Why）

- **稳定性**：把变化快的驱动与外部依赖隔离在外层，保护内核语义稳定。
- **可测试性**：feature/domain 可独立测试，不依赖 UI、HTTP、数据库实现。
- **可替换性**：更换框架或基础设施时，只替换 adapter，不重写业务用例。
- **可协作性**：统一判定顺序可减少 AI 与 Human 的分层歧义。

## 反例（禁止）

- 在 `inbound` 写业务不变量。
- 在 `features` 直接操作 DB/SDK 或绑定具体驱动框架对象。
- 在 `domains` 引入任何 I/O、事件总线实现、框架类型。
- 在 `bootstrap` 写业务流程分支。
