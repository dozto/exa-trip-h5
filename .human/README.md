# .human/ — 人类维护的约束层

> 本目录是项目的"为什么"与"边界"。人主笔，AI 只读。
> 修改本目录即定义或变更项目约束；AI 据此维护 `.ai/` 与 `src/`。

## 文件职责

| 文件 | 作用 | 何时修改 |
|------|------|----------|
| `project.md` | 项目意图：为谁、解决什么、不做什么 | 有新目标/非目标时 |
| `architecture.md` | 架构 + DDD + 六边形 + 测试约定 + ADR 触发 | 改变架构方向、战术约束或测试规范时 |
| `preferences.md` | 技术选型与编码约定 | 技术栈变化时 |
| `glossary.md` | 统一语言 | 引入新业务术语时（也可由 AI 在 RFC 中提案、人确认） |
| `splitting-rules.md` | 分层拆分的 "how/why" | 分层判定方法变化时 |
| `decisions/` | ADR（架构决策记录） | 触发条件见 `architecture.md` "例外与偏离" |

## 人类参与时机

你只在以下时刻需要操作：

1. **定义/调整目标与边界** → 改 `project.md`
2. **变更架构约束或技术栈** → 改 `architecture.md` / `preferences.md`
3. **引入新业务术语** → 改 `glossary.md`（也可让 AI 提案后你确认）
4. **确认 AI 提的 RFC** → 读 `.ai/rfcs/` 拍板：同意 / 调整 / 否决
5. **审查交付结果** → 看 AI 输出的测试证据与 `.ai/current.md`

## 什么时候你不需要做

- 不需要直接写 `.ai/` 下任何文件 — AI 维护
- 不需要直接写 `src/` / `tests/` — AI 实现
- 不需要手动触发校验脚本 — AI 合并前执行

## 什么样的人类输入足够启动 AI？

见 `.ai/workflow-feature-delivery.md` 的 "Definition of Ready"（§0.3）。
简单说：给出"做什么 + 不做什么 + 验收期望"即可。

## 与 ADR 的关系

`decisions/` 下的 ADR 是"已敲定的架构级结论"，一经接受不可变。
触发条件见 `architecture.md` "例外与偏离"。
日常变更的推理过程放 `.ai/rfcs/`（RFC），上层级稳固定后可晋升为 ADR。