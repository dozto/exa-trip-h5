---
name: ddd-validation
description: 校验 DDD 战术规范——聚合一致性边界、统一语言一致、领域服务归属与 feature 文档最小完备性。提交 / 合并前由 AI 执行。架构依赖与边界纯度见 xp-validation，本技能不重复。
---

# Skill: DDD 校验（领域战术规范）

> 用途：守住 DDD 战术设计的语义正确性，重点保证聚合边界、术语一致与领域规则归位。
> 何时用：修改 `src/domains/` 或 `src/features/` 后、**提交 / 合并前**。
> 边界划分：依赖方向、边界纯度、TDD 红绿由 [`xp-validation`](../xp-validation/SKILL.md) 负责，本技能只管 DDD 语义。

---

## 校验项

### 1. 聚合一致性边界
- 一次事务 / 用例只修改**一个**聚合根（一次 `repository.save` 不跨多个聚合）。
- 跨聚合只用 **ID 引用**，不直接持有他聚合对象；跨聚合一致性由 feature 显式编排与补偿策略达成。

### 2. 统一语言一致
- `domains/` 公开类型 / 方法名应能在 [`.human/glossary.md`](../../.human/glossary.md) 找到对应术语；出现业务新词时同步补术语表。

### 3. 领域服务归属
- 跨实体、不属于单一实体的业务逻辑在 `domains/`（领域服务），未漏到 `features/`。

### 4. Feature 文档最小完备性
- 每个 `.ai/features/*.md` 必须包含：`最小必填（5 项）`、`验收标准（可测试）`、`边界（本次不做）`。

---

## 如何落地（语言无关，写进 `scripts/`）

实现为脚本（当前入口：`scripts/check-ddd`），接 pre-commit / CI：

1. **文档最小项检查**：校验每个 feature 文档包含必需章节。
2. **聚合启发式检查**：扫描单个用例内 `save` / 持久化调用涉及的聚合根数量 > 1 时告警。
3. **术语比对**：domain 导出符号 ∉ glossary 术语 → 列为待登记。

| 生态 | 事件 / 符号枚举与测试扫描 |
|------|--------------------------|
| JS / TS | ts-morph / AST 解析 + vitest/jest |
| Java / Kotlin | 反射 / ArchUnit 自定义规则 + JUnit |
| Python | ast 模块 + pytest |
| Go | go/ast + go test |

> 规则唯一描述源是 [`.human/architecture.md`](../../.human/architecture.md)（端口与领域约定）；脚本只是其可执行实现。规则有变，先改那里。

---

## 输出约定

- **通过** → 允许提交 / 合并。
- **失败** → 列出：① feature 文档缺项 ② 跨聚合事务 ③ 未登记术语 ④ 错位的领域服务；按 `.human/architecture.md` 修正后重跑。
