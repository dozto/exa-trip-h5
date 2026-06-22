# AI Agent 规则

> 所有 AI 编码工具（Claude Code / opencode / Cursor / Copilot）的唯一规则入口。

---

## 1. 规则层级（单一真源）

- 原则真源在 `.human/`：
  - [`.human/architecture.md`](../.human/architecture.md)
  - [`.human/ddd-principles.md`](../.human/ddd-principles.md)
  - [`.human/hexagonal-principles.md`](../.human/hexagonal-principles.md)
- 流程真源在 `.ai/`：
  - [`.ai/workflow-feature-delivery.md`](./workflow-feature-delivery.md)
- 校验执行在 `.skills/`：
  - [`.skills/xp-validation/SKILL.md`](../.skills/xp-validation/SKILL.md)
  - [`.skills/ddd-validation/SKILL.md`](../.skills/ddd-validation/SKILL.md)
  - [`.skills/feature-delivery/SKILL.md`](../.skills/feature-delivery/SKILL.md)

## 2. 开工前必读顺序

1. `.human/*`（约束）
2. `.ai/index.md`（系统入口）
3. `.ai/current.md`（当前状态）
4. 本文件（门禁）
5. `.ai/workflow-feature-delivery.md`（执行流程）

## 2.1 对话触发协议（统一入口）

- 推荐命令：`/feature <name> [mode=fast|strict]`
- 默认模式：`fast`
- 语义：收到该触发后，AI 必须按 `.ai/workflow-feature-delivery.md` 执行，不得跳步。

## 3. 门禁（最小硬约束）

- MUST：先文档后代码。normal 变更必须先形成 RFC（`pending`）并等待确认。
- MUST：tiny-change 可走简化记录（见 `.ai/workflow-feature-delivery.md`），但必须给出判定依据与最小验证证据。
- MUST：实现遵循 TDD（red -> green -> refactor）。
- MUST：实现遵循 DDD + 六边形边界与依赖方向。
- MUST：合并前通过 `xp-validation` 与 `ddd-validation`。
- MUST：完成后更新 `.ai/current.md`；normal 变更需将 RFC 状态更新为 `accepted`。

## 3.1 Definition of Done（DoD，精简）

以下 5 条全部满足才算完成：

1. 测试通过（至少包含本次变更路径的失败测试 -> 修复 -> 通过证据）
2. 架构校验通过：`scripts/check-architecture`
3. DDD 校验通过：`scripts/check-ddd`
4. 文档同步通过：`scripts/check-doc-sync`
5. 文档与现状同步：normal 变更的 RFC 状态正确，或 tiny-change 简化记录完整，且 `.ai/current.md` 已更新

## 3.2 实现前自检（硬约束）

开始实现前，AI MUST 按 [`.human/architecture.md`](../.human/architecture.md) 的“快速判定（AI/Human 共用，唯一真源）”逐条自检（`ARCH-R1` ~ `ARCH-R6`）。

## 4. Forbidden（禁止）

- normal 变更未确认 RFC 即写代码。
- 跳过失败测试直接实现。
- 违反依赖方向/边界规则继续提交。
- 在 `AGENTS.md`、`CLAUDE.md`、Copilot 指令中重复声明规则正文（这些文件只做入口引用）。
