# RFC-NNNN：标题

<!--
用法：复制本文件并重命名为 RFC-NNNN-kebab-title.md（NNNN 从 0001 起）。
原则：先文档后代码；未确认 RFC 不实现。
-->

- 状态：pending <!-- pending / accepted / rejected / superseded(RFC-xxxx) -->
- 变更级别：normal <!-- tiny / normal -->
- 日期：YYYY-MM-DD
- 作者：AI / Human
- 关联需求：<!-- issue/link/用户描述 -->

## 1) 目标与范围

### 背景/目标

<!-- 为什么做；完成后如何判断成功 -->

### 本次不做

<!-- Out of Scope，控制范围 -->

## 2) 关键澄清（最少化）

### AI 默认假设

<!-- AI 未提问即采用的默认值（含影响） -->

### 待确认决策（<=3）

<!-- 只放阻塞实现的关键决策；每项含推荐默认值 -->

## 3) 方案

### 领域/Feature 拆分

<!-- 涉及哪些 domain、feature、边界 -->

### Ports & Adapters 设计

<!-- inbound/outbound ports、对应实现层（inbound/outbound）、调用链 -->

### 数据与事件

<!-- 关键模型变化、跨层协作语义（保持抽象，不绑定具体实现） -->

## 4) 验证与风险

### 测试与校验

<!-- TDD 计划 + xp-validation + ddd-validation -->

### 风险与回滚

<!-- 主要风险、缓解方式、回滚策略 -->

## 5) 变更清单

### 预计改动路径

<!-- src/domains|features|inbound|outbound|bootstrap|tests -->

### 文档回写

- [ ] `.ai/current.md`
- [ ] `.ai/domains/<domain>.md`（如需）
- [ ] `.ai/features/<feature>.md`（如需）
- [ ] `.human/glossary.md`（如有新术语）

## 6) 决策记录

<!-- 决策：accepted / rejected / superseded；决策人；决策时间；备注 -->

## 附：tiny-change 简化记录（仅 tiny 需要）

<!-- 仅当变更级别=tiny 时填写：
- 变更类型：重命名 / 注释 / 文档 / 无行为重排
- 行为影响：无
- 端口影响：无
- 边界影响：无
- 最小验证：类型检查/测试/脚本证据 -->
