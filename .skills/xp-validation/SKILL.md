---
name: xp-validation
description: 校验架构依赖方向与边界纯度、TDD 测试实践。当生成或修改 src/ 代码后、合并前，或需要把架构规则落为 CI / pre-commit 检查时使用。
---

# Skill: XP 校验（架构适应度函数）

> 用途：把架构规则变成**可执行规约**，防止迭代中架构腐化。
> 何时用：生成 / 修改 `src/` 代码后、合并前；以及 CI 与本地 pre-commit。
> 规则唯一描述源：[`.human/architecture.md`](../../.human/architecture.md) 的 ARCH-R1~R6、DDD 战术约束、测试与验证。本文件只描述如何校验，不重述规则。

---

## 校验项 → 对应规则（查 `.human/architecture.md`）

| 校验项 | 规则来源 | 脚本实现 |
|--------|----------|----------|
| 依赖方向 | ARCH-R1~R4 | `scripts/check-architecture` |
| 边界纯度（domains 无 I/O、shared 无业务词、ports 在 features、use case 无 class） | ARCH-R1,R2,R6 | `scripts/check-architecture` |
| 测试存在（domain 有单元测试、feature 有用例测试） | 测试与验证 | 检查 `tests/domains/` 与 `tests/features/` 覆盖 |

---

## 如何落地

脚本已放在 `scripts/`（当前入口：`scripts/check-architecture`），接入 CI 与 pre-commit。

| 生态 | 依赖校验 | 测试 |
|------|----------|------|
| JS / TS | dependency-cruiser · eslint-plugin-boundaries | vitest / jest |
| Java / Kotlin | ArchUnit | JUnit |
| Python | import-linter | pytest |
| Go | go-arch-lint | go test |
| Rust | cargo-modules · 自定义 lint | cargo test |

---

## 输出约定

- **通过** → 允许合并。
- **失败** → 列出违规的文件与触发的规则编号，按 `.ai/agent.md` 门禁修正后重跑。