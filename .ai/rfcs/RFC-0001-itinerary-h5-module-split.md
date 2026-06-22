# RFC-0001：目录结构与分层约束升级

- 状态：accepted
- 日期：2026-06-21
- 作者：AI
- 模式：fast
- 关联需求：将代码结构调整为 feature 平铺 + inbound/outbound 实现层，保持六边形依赖方向

## 1) 目标与范围

### 背景/目标

将目录结构收敛为更直观的 code-first 组织方式：

- `src/features` 平铺特性目录（每个特性固定 `index.ts`、`port.ts`、`types.ts`）。
- `src/inbound` 承载驱动侧实现（页面、路由、状态、交互入口）。
- `src/outbound` 承载被驱动侧实现（repository/validator/gateway/mapper）。
- `src/domains` 只保留业务内核。

### 本次不做

- 不改变业务能力边界。
- 不引入外部接口或持久化方案。

## 2) 关键澄清（最少化）

### AI 默认假设

- 六边形核心约束不变：实现可调整，依赖方向不可逆。
- 文档保持抽象描述，不写业务细节目录说明。

### 待确认决策（<=3）

- 无阻塞决策。

## 3) 方案

### 结构方案

- 领域层：`src/domains/*`
- 特性层：`src/features/*`（平铺）
- 驱动侧实现层：`src/inbound/*`
- 被驱动侧实现层：`src/outbound/*`
- 组装层：`src/bootstrap/*`
- mock 数据：`src/mocks/*`

### 迁移原则

- 保持行为不变，先迁移目录与导入，再清理旧路径。
- 端口仍由 feature 定义，实现仍由 inbound/outbound 承接。
- `model` 语义并入 `src/inbound/web/state`，不再保留 `src/model` 顶层目录。

## 4) 验证与风险

### 测试与校验

- `bun test`
- `bun run build`
- `scripts/check-architecture`
- `scripts/check-ddd`
- `scripts/check-doc-sync`

### 风险与回滚

- 风险：路径迁移导致引用失效。
- 缓解：分阶段迁移并持续运行校验脚本。
- 回滚：按提交粒度回退目录迁移步骤。

## 5) 变更清单

### 预计改动路径

- `src/domains/**`
- `src/features/**`
- `src/inbound/**`
- `src/outbound/**`
- `src/bootstrap/**`
- `src/mocks/**`
- `tests/**`
- `scripts/**`
- `.ai/**`
- `.human/**`

### 文档回写

- [x] `.ai/current.md`
- [x] `.human/architecture.md`
- [x] `.human/ddd-principles.md`
- [x] `.human/hexagonal-principles.md`

## 6) 决策记录

- 决策：采用 `src/features` 平铺，不再使用 `src/core` 这一层。
- 决策：采用 `src/inbound` / `src/outbound` 作为实现层抽象，不再使用 `src/ui` / `src/model` / `src/infrastructure` 作为规范目录。
- 决策：本项目不采用领域事件机制，领域语义通过类型和返回结果表达。
- 决策人：Human + AI
- 决策时间：2026-06-21 / 2026-06-22

## 7) 后续规则对齐说明（2026-06-22）

- 当前生效口径以 `/.human/architecture.md`、`/.human/splitting-rules.md`、`/.ai/workflow-feature-delivery.md` 为准。
- `inbound/outbound/bootstrap -> features -> domains` 为唯一依赖方向口径。
