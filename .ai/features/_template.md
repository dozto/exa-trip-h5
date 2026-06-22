# 特性：<名称>

<!-- 本特性的认知（AI 主笔、人确认）。是该用例"怎么做"的描述源；src/features 只放代码。 -->

## 最小必填（5 项）

- [ ] 用例目标
- [ ] 边界（本次不做）
- [ ] inbound/outbound ports
- [ ] 编排步骤
- [ ] 验收标准（可测试）

## 用例目标

<!-- 一句话：为谁解决什么。 -->

## inbound port（触发入口）

<!-- 用例接口签名（输入 -> 输出），由驱动侧调用。
示例：checkout(cartId) → OrderId -->

## 编排步骤

<!-- 查 -> 校验 -> 调外部（经 outbound port）-> 返回结果。
事务边界：一次事务只提交一个聚合（见 .human/architecture.md 聚合即一致性边界）。
失败处理：端口失败时返回受控错误，保持可预测语义。
示例：
1. 取购物车 2. 校验库存（outbound: InventoryPort）3. 创建 Order 聚合 4. 保存（事务边界）
   失败：库存不足 -> 拒绝并返回错误 -->

## 依赖

<!-- 依赖的 domain + 声明的 outbound ports。
示例：domain=ordering；outbound=InventoryPort, PaymentPort -->

## 测试清单（先写）

<!-- 写代码前先列，逐条转 红 → 绿（TDD）。覆盖正常路径、边界、端口失败；mock outbound ports。
示例：
- [ ] 正常结算生成订单
- [ ] 库存不足 → 拒绝
- [ ] 支付端口失败 → 不创建订单 -->

## 链接

<!-- 代码：src/features/<name>/；关联 RFC：rfcs/RFC-NNNN-... -->

## 验收标准（可测试）

<!--
至少写 2-3 条可验证语句（Given/When/Then 或等价方式）。
示例：
- 给定有效输入，当调用 inbound port 时，则返回成功并持久化聚合。
- 给定外部端口失败，当执行用例时，则返回受控错误且不提交无效状态。
-->

## 边界（本次不做）

<!-- 本次明确不覆盖的能力，控制范围并降低确认成本。 -->
