---
name: xp-validation
description: 校验 DDD + 六边形架构的依赖方向与边界纯度，以及 XP/TDD 测试实践。当生成或修改 src/ 代码后、合并前，或需要把架构规则落为 CI / pre-commit 检查时使用。
---

# Skill: XP 校验（架构适应度函数）

> 用途：把 DDD + 六边形的架构规则与 XP/TDD 实践变成**可执行规约**，防止迭代中架构腐化。
> 何时用：生成 / 修改 `src/` 代码后、合并前；以及 CI 与本地 pre-commit。

---

## 校验项（铁律）

### 1. 依赖方向（六边形）
- `domains/` **零出边**：无任何 import。
- `features/` 只依赖 `domains/` 与自身 ports；禁止 import `inbound/`、`outbound/`、`bootstrap/`。
- `inbound/` 只依赖 feature 的 inbound port；禁止 import `outbound/`。
- `outbound/` 只实现 feature 的 outbound port；禁止 import `inbound/`。
- `domains/` 禁止依赖 `features/`、`inbound/`、`outbound/`、`bootstrap/`。
- `bootstrap/` 可依赖全部，但不含业务逻辑 / 用例流程。

### 2. 边界纯度
- `domains/` 内禁止出现 I/O / SQL / HTTP / 框架 / SDK 的 import。
- `shared/` 内禁止出现领域概念（业务词汇）——保持业务中立。
- 所有 port 定义在 `features/`，不在 `domains/`。
- `features/` 内 use case 实现 MUST NOT 使用 class；统一使用函数/函数工厂。

### 3. 测试（XP / TDD）
- 每个 `domain` 规则有单元测试（无需 mock）。
- 每个 `feature` 用例有测试（mock outbound ports）。
- 红 → 绿 → 重构：先写失败测试，再实现。

---

## 如何落地（语言无关，按生态选工具）

把规则实现为脚本，放 `scripts/`（当前入口：`scripts/check-architecture`），接入 CI 与 pre-commit：

| 生态 | 依赖校验 | 测试 |
|------|----------|------|
| JS / TS | dependency-cruiser · eslint-plugin-boundaries | vitest / jest |
| Java / Kotlin | ArchUnit | JUnit |
| Python | import-linter | pytest |
| Go | go-arch-lint | go test |
| Rust | cargo-modules · 自定义 lint | cargo test |

> 规则的唯一描述源是本文件；脚本只是它的可执行实现。规则有变，先改这里。

---

## 输出约定

- **通过** → 允许合并。
- **失败** → 列出违规的文件与触发的规则编号，按 `.ai/agent.md` §2 的"逻辑归属口诀"修正后重跑。
