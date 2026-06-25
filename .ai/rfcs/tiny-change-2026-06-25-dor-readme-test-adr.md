# tiny-change：DoR 补充 + 人类 README + 测试约定与 ADR 触发清单明化

- 日期：2026-06-25
- 变更级别：tiny-change
- 判定依据：纯文档增改，不改变业务不变量与用例语义；现有测试与校验脚本覆盖验证无回归。

## 变更清单

1. **Definition of Ready（DoR）**：在 `.ai/workflow-feature-delivery.md` §0.2 之后新增 §0.3，定义 4 条就绪判定条件 + 未就绪处理 + fast/strict 差异。
2. **`.human/README.md` 新建**：人类使用元指引——文件职责表、参与时机、启动条件、ADR 关系。`AGENTS.md` 第 1 行链接从 `.human/` 改为 `.human/README.md`。
3. **测试约定具体化**：`architecture.md` 的"测试与验证"节从 5 行扩充为 5 个子节：测试组织（镜像 src 结构）、命名（`*.spec.ts` + describe 语义）、覆盖范围（domain 100%/feature 主路径+失败/mock port）、Mock 策略（mock interface 不 mock domain、feature 测试不 import 真实 adapter）、TDD 红绿。
4. **ADR 触发清单明化**：`architecture.md` 的"例外与偏离"节从一句话扩充为 3 个子节：6 类必须写 ADR 的偏离、不需要写 ADR 的变更、ADR 写作要求。

## 验证证据

- `bun run test`：12 files / 65 tests PASS
- `./scripts/check-architecture` PASS
- `./scripts/check-ddd` PASS
- `./scripts/check-naming` PASS