# Feature 交付工作流（AI Native）

> 目的：把“需求分析 -> 设计 -> 文档确认 -> 实现 -> 验证 -> 回写”的协作过程标准化，让 AI 工具可自动提问、自动检查、自动提示。
> 适用：所有新增/修改 feature 的任务。

---

## 0. 输入触发

当用户输入“做一个 xx feature / 修改 xx 功能”或 `/feature <name> [mode=fast|strict]` 时，AI 进入本流程。

### 0.1 模式

- `fast`（默认）：最小提问，优先默认假设，快速形成可确认 RFC。
- `strict`：提问更完整，风险和约束更细，适合高风险/核心链路变更。

### 0.2 tiny-change 例外

满足以下全部条件时，可使用 tiny-change 简化流程：

- 仅重命名、注释/文档修订、无行为重排等低风险改动
- 无业务行为变化
- 无 inbound/outbound port 变化
- 无层级边界变化

tiny-change MUST 产出“简化记录”（推荐路径：`.ai/rfcs/tiny-change-*.md`），但 MAY 跳过完整 RFC 章节与确认门。

## 1. 上下文加载（必须）

AI MUST 先读取：

1. `.human/project.md`（目标与边界）
2. `.human/architecture.md`（总架构约束）
3. `.human/ddd-principles.md`（DDD 原则）
4. `.human/hexagonal-principles.md`（六边形原则）
5. `.human/glossary.md`（统一语言）
6. `.ai/index.md`、`.ai/current.md`（当前认知与现状）

AI MUST NOT 在未读取上述文件前直接产出实现方案。

## 1.5 最小提问策略（默认）

- AI MUST 默认“主动驱动”：能基于现有上下文推断的内容，不向用户提问。
- AI MUST 只提阻塞问题（会实质改变方案或带来不可逆风险）。
- AI SHOULD 每轮最多提 1-3 个关键问题；其余采用默认假设并写入 RFC。
- AI MUST 为每个问题提供“推荐默认值 + 若不确认的影响”。
- AI MUST NOT 为了“形式完整”逐条向用户索取全部细节。

`fast` 与 `strict` 的差异：

- `fast`：每轮最多 1-2 个阻塞问题，待确认决策建议 <= 2。
- `strict`：每轮最多 3 个阻塞问题，待确认决策建议 <= 3，并补充风险核对。

## 2. 需求澄清与提问（必须）

AI MUST 优先自行补齐信息，仅在以下场景提问：

- 不可逆或高风险决策（安全、合规、计费、生产数据）
- 目标冲突或边界冲突（会导致不同架构拆分）
- 缺少关键验收标准（无法判断是否完成）

AI SHOULD 采用“最小问题集”，优先问这 3 类：

1. 成功标准是什么（如何判定完成）
2. 本次明确不做什么（范围边界）
3. 有无硬约束（安全/合规/性能/预算）

若用户未给出完整答案，AI MUST 使用合理默认值继续推进，并在 RFC 的“默认假设/待确认决策”中显式记录。

## 3. 拆分建议（领域/特性/边界）

AI MUST 给出：

- 领域拆分建议（domain 候选）
- feature 拆分建议（用例粒度、先后顺序）
- bounded context 边界建议（术语、职责、一致性边界）
- 端口拆分建议（inbound/outbound ports）
- 风险与取舍（复杂度、一致性、交付节奏）

AI MUST 显式标注“建议项”与“必须项”。

## 4. 文档先行（RFC + 认知层）

normal 变更在写代码前，AI MUST 先形成并提交文档草案：

1. `.ai/rfcs/RFC-xxxx-*.md`（状态 `pending`）
2. 必要时更新：
   - `.ai/domains/<domain>.md`
   - `.ai/features/<feature>.md`
   - `.human/glossary.md`（新增术语）

AI MUST 在 RFC 中包含：问题、方案、备选方案、影响面、测试策略、风险与回滚。

AI SHOULD 在 RFC 顶部显式记录当前模式：`mode=fast|strict`。

tiny-change MUST 至少记录：变更类型、行为影响（应为无）、端口影响（应为无）、边界影响（应为无）、最小验证证据。

## 5. 人工确认门（硬门禁）

normal 变更：AI MUST 等待用户明确确认文档后，才能进入实现。
tiny-change：AI MAY 在给出简化记录后直接实现，但 MUST 在交付中显式标注 tiny-change 判定依据。

- normal 未确认：只允许继续澄清/修订文档
- normal 已确认：进入第 6 步
- tiny-change：完成简化记录后可进入第 6 步

## 6. 实现（TDD + DDD + 六边形）

AI MUST 按顺序执行：

1. 先写失败测试（red）
2. 最小实现使测试通过（green）
3. 重构并保持通过（refactor）

代码归位 MUST 满足：

- 规则与不变量 -> `src/domains`
- 用例编排与 ports -> `src/features`
- 驱动侧与被驱动侧实现 -> `src/inbound` 与 `src/outbound`
- 组装注入 -> `src/bootstrap`

实现前 MUST 完成边界自检：

- 自检清单唯一真源：`.human/architecture.md` 的“快速判定（AI/Human 共用，唯一真源）”（`ARCH-R1` ~ `ARCH-R6`）。

## 7. 合并前验证（必须）

AI MUST 执行并汇报：

- `xp-validation`（依赖方向/边界纯度/TDD）
- `ddd-validation`（聚合一致性/统一语言）
- 测试结果与关键证据（失败->修复->通过）

## 8. 回写与收口（必须）

完成实现后，AI MUST 同步更新：

- `.ai/current.md`（当前焦点、现状、约束/债务）
- normal 变更的 RFC 状态（`pending -> accepted`）
- 受影响的领域/特性认知文档
- 新增术语（如有）到 `.human/glossary.md`

## 9. 输出格式（对用户）

AI 每次交付应包含：

1. 本轮做了什么
2. 为什么这样做（对应哪些约束）
3. 证据（测试/校验）
4. 下一步建议（1-3 条）

---

## 流程失败条件（立即中止并回退到上一步）

- normal 变更未确认 RFC 就开始写代码
- 未做失败测试直接实现
- 发现跨层依赖违规仍继续提交
- 发现术语冲突但未更新 glossary

> 本文件定义流程；原则定义见 `.human/ddd-principles.md` 与 `.human/hexagonal-principles.md`。
