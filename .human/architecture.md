# 架构约束（Architecture）

> 本文件说明项目的架构设计与目录结构，是 "what" 的唯一真源。
> 拆分方法与理由（"how/why"）见 [`.human/splitting-rules.md`](./splitting-rules.md)。
> 规则可执行：架构依赖与边界纯度由 [`.skills/xp-validation/SKILL.md`](../.skills/xp-validation/SKILL.md) 校验；DDD 战术规范由 [`.skills/ddd-validation/SKILL.md`](../.skills/ddd-validation/SKILL.md) 校验。

## 风格

**DDD + XP + 六边形（Ports & Adapters）**。核心铁律：**依赖只能从外向内**。

- 当前项目的典型方向：`inbound/outbound/bootstrap -> features -> domains`
- 通用抽象方向：`drivers/inbound/outbound/bootstrap -> features -> domains`
- `domains` 无任何出边；`features` 通过 outbound ports 调用外部能力；`bootstrap` 只负责装配

### 快速判定（AI/Human 共用，唯一真源）

- **ARCH-R1** `domains`：零出边，不 import `features/inbound/outbound/bootstrap`
- **ARCH-R2** `features`：只依赖 `domains` 与 feature ports，不 import `inbound/outbound/bootstrap`
- **ARCH-R3** `inbound`：只调用 feature inbound ports，不直连 outbound
- **ARCH-R4** `outbound`：只实现 feature outbound ports，不依赖 inbound
- **ARCH-R5** `bootstrap`：唯一装配点，可依赖全部但不写业务流程
- **ARCH-R6** `features`：MUST NOT 使用 class 实现 use case，统一使用函数/函数工厂

### 违规与修正示例（对应规则号）

| 规则 | 违规示例 | 修正方式 |
|------|----------|----------|
| `ARCH-R1` | `src/domains/*` import `src/features/*` | 将编排逻辑移动到 `src/features/*`，domain 仅保留规则与不变量 |
| `ARCH-R2` | `src/features/*` 直接 import `src/outbound/*` | 在 `feature/port.ts` 定义 outbound port，由 `src/outbound/*` 实现并在 `bootstrap` 注入 |
| `ARCH-R3` | `src/inbound/*` 直接调用 `src/outbound/*` repository | 改为调用 feature inbound port（use case），由 feature 间接使用 outbound port |
| `ARCH-R4` | `src/outbound/*` import `src/inbound/*` 状态或页面对象 | 将 inbound 依赖改为输入参数或 feature port 语义，outbound 保持被动实现 |
| `ARCH-R5` | `src/bootstrap/*` 出现业务分支或用例判断 | 业务分支下沉到 `src/features/*`，bootstrap 只负责对象装配与启动 |
| `ARCH-R6` | `src/features/*` 使用 `class XxxUseCase` | 改为 `createXxx(deps)` 或 `xxx` 常量函数，禁止 `new` 调用链 |

## 通用依赖方向（跨前端/后端）

```mermaid
flowchart LR
    drivers["drivers · web/http/cli/worker"] -->|调用 inbound port| features
    features --> domains["domains · 纯内核 · 无依赖"]
    outbound["outbound · db/cache/api/mq/validator"] -->|实现 outbound port| features
    features -. 经 outbound port 调用 .-> outbound
    bootstrap["bootstrap · composition root"] -. 注入实现 .-> features
```

## 各层职责与禁止

| 层 | 职责 | 依赖 | 禁止 |
|----|------|------|------|
| `domains/` | 业务规则 / 不变量 / 状态机 / 领域服务（纯内核） | 无 | 任何 I/O；import `features/inbound/outbound/bootstrap` |
| `features/` | 用例编排：查 -> 校验 -> 调外部 -> 返回语义结果 | `domains` + ports | 直连 DB/SDK；写领域不变量；依赖具体驱动框架 |
| `inbound/` | 驱动侧实现（web/http/cli/worker 的入口、页面、状态、控制流） | feature inbound ports | 写业务不变量/跨聚合用例编排；直连 outbound |
| `outbound/` | 被驱动侧实现（db/cache/mq/api/validator） | feature outbound ports | 承载业务规则；依赖 inbound |
| `shared/` | 业务无关通用件（errors/log/utils/types） | 无业务 | 沉淀业务概念 |
| `bootstrap/` | 组装根：DI、装配、入口（仅装配） | 全部 | 写业务逻辑 / 用例流程 |

说明：当前统一使用 `inbound` / `outbound` 术语表达六边形两侧实现，不再使用 `ui/model/infrastructure/interfaces` 作为规范目录。

## 目录结构规范

### A. 前端项目（当前）

```text
src/
  domains/
  features/
  inbound/
  outbound/
  bootstrap/
  shared/
```

### B. inbound 细分（web 实现示例）

```text
src/inbound/
  web/
    events/
    routes/
    pages/
    components/
    state/
      command/
      state/
      store/
    styles/
```

### C. outbound 细分

```text
src/outbound/
  repositories/
  validators/
  gateways/
  mappers/
```

#### outbound 命名约定（实现文件）

- Repository 实现：`*.repository.ts`
- Validator 实现：`*.validator.ts`
- Gateway 实现：`*.gateway.ts`
- Mapper 实现：`*.mapper.ts`
- 文件名表达业务语义与来源，避免运行环境导向命名（如优先 `mock-*`，避免 `browser-*`）

只要依赖方向不变，目录命名可按仓库形态调整。

## 端口与领域约定

- **端口归属**：所有 ports（inbound/outbound）定义在 `features/`；`domains` 不定义 ports。
- **端口命名（inbound）**：使用 `动词 + 业务意图`，如 `LoadX`、`SwitchY`；避免 `Handle`、`Process`。
- **端口命名（outbound）**：使用业务能力命名，避免技术实现词。
- **端口签名**：输入/输出使用稳定用例语义，禁止泄漏框架原生对象（HTTP/MQ/SDK types）。
- **inbound port 形态**：MUST 使用函数类型（`(input) => Promise<Result<...>>`），不使用 `execute` 包装对象。
- **端口文件约定**：每个 feature 内固定使用 `port.ts` 承载端口接口。
- **feature 文件骨架**：每个 feature 至少包含 `index.ts`、`port.ts`、`types.ts`。
- **feature 实现形态**：MUST NOT 使用 class；`index.ts` 仅导出函数式 use case（`createXxx` 或常量函数）。
- **领域服务**：跨实体、不属于单一实体的业务逻辑放 `domains/`。
- **聚合即一致性边界**：一次事务只修改一个聚合；跨聚合使用 ID 引用并由 feature 编排。
- **边界转换 / 防腐**：outbound 负责内外模型转换（外部 DTO <-> 领域模型）。
- **边界类型校验（inbound）**：用户输入（query/form/route/body）校验放 inbound adapter。
- **边界类型校验（outbound）**：外部依赖返回（API/DB/file/mock/SDK）校验放 outbound adapter。
- **业务校验归属**：领域不变量与业务规则放 domain/feature，不放 adapter。
- **横切关注点**：日志/指标/追踪不进入 domain；由外层处理。

## 演进式设计（YAGNI · 简单设计）

只为当前需求写代码，不为臆测未来预留抽象。设计优先级：
**① 通过测试 -> ② 意图清晰 -> ③ 无重复 -> ④ 元素最少**。

结构按真实复杂度增长（单文件 -> 文件夹 -> 限界上下文），由校验规则持续守边界。

## 例外与偏离

如需偏离上述规则，必须登记到 `/.human/decisions/ADR-*.md`：偏离点、原因、范围、回收计划。
