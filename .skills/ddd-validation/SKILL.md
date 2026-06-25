---
name: ddd-validation
description: 校验 DDD 战术规范——聚合一致性边界、统一语言一致、领域服务归属与 feature 文档最小完备性。提交 / 合并前由 AI 执行。
---

# Skill: DDD 校验（领域战术规范）

> 用途：守住 DDD 战术设计的语义正确性，重点保证聚合边界、术语一致与领域规则归位。
> 何时用：修改 `src/domains/` 或 `src/features/` 后、**提交 / 合并前**。
> 规则唯一描述源：[`.human/architecture.md`](../../.human/architecture.md) 的 DDD 战术约束。本文件只描述如何校验，不重述规则。

---

## 校验项 → 校验方式

| 校验项 | 脚本实现 |
|--------|----------|
| Feature 文档最小项（5 项章节存在） | `scripts/check-ddd` |
| 聚合一致性（单用例不跨聚合 save） | 启发式扫描：单个用例内 `save` / 持久化调用涉聚合根 > 1 时告警 |
| 统一语言（domain 导出符号 ∈ glossary） | 术语比对：domain 导出符号 ∉ `.human/glossary.md` → 列为待登记 |
| 领域服务归属（跨实体规则在 domains，不漏 features） | 检查 `src/features/` 是否包含领域不变量逻辑 |

---

## 如何落地

脚本入口：`scripts/check-ddd`，接 pre-commit / CI。

| 生态 | 符号枚举与测试扫描 |
|------|---------------------|
| JS / TS | ts-morph / AST 解析 + vitest/jest |
| Java / Kotlin | 反射 / ArchUnit 自定义规则 + JUnit |
| Python | ast 模块 + pytest |
| Go | go/ast + go test |

---

## 输出约定

- **通过** → 允许提交 / 合并。
- **失败** → 列出：① feature 文档缺项 ② 跨聚合事务 ③ 未登记术语 ④ 错位的领域服务；按 `.human/architecture.md` 的 DDD 战术约束修正后重跑。