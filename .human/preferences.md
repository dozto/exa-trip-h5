# 技术偏好（Preferences）

<!-- 技术选型与编码约定。语言无关模板——选定技术栈后填写，未定则留空。
原则：此处只记"团队约定"，具体规则交给工具（EditorConfig / linter / formatter）强制执行，不靠文字描述。 -->

## 语言与框架

<!-- 示例：后端 TypeScript + Node；前端 React。未定则留空。 -->
- 运行时与包管理：Bun
- 语言：TypeScript
- 前端框架：React（不使用 Next.js 等重型全栈框架）
- 构建工具：Vite
- 路由：TanStack Router
- 数据请求与缓存：TanStack Query
- UI 组件库：HeroUI（https://heroui.com/）
- 状态管理：Zustand（页面只订阅状态，逻辑层驱动状态变更）
- 事件总线：eventemitter3（统一封装 Typed Events）
- 动画：Framer Motion（用于页面切换、列表入场、反馈过渡）
- 地图渲染：Mapbox（作为全球场景下的默认地图渲染与样式能力）

## 地图与实时能力偏好

- 地图渲染优先使用 Mapbox，路线几何、图层样式与交互动画以 Mapbox GL 能力为主。
- 交通模式采用分阶段策略：先支持步行/公交估算/驾车，再扩展独立公共交通 provider。
- 当前为本地调试开发阶段：前端使用公开 Mapbox token 直连；后续如需生产 BFF 代理，再以新 RFC 启动 `bootstrap/node`。
- 实时数据优先策略：页面打开与日期切换优先实时查询；允许短 TTL 缓存（路线 2-5 分钟）。
- UI 必须展示数据更新时间戳；实时请求失败时优先降级到最近一次成功结果并提示“可能过期”。

## 架构与分层约定

- 遵循 DDD + 六边形架构（见 `.human/architecture.md`）。
- 页面、数据、逻辑分离：
  - 页面层仅负责渲染与触发 UI 事件；
  - Feature 层仅负责用例编排，不涉及领域事件，对 UI 与具体实现无感知；
  - Feature 实现默认函数式，MUST NOT 使用 class 实现 use case；
  - `inbound` / `outbound` 负责页面状态、边界转换与外部依赖实现。
- UI 通过数据变化驱动更新，不在组件内编排业务规则。
- 固定格式数据采用 Zod 校验（Zod-first），再进入领域/特性层。
- `contracts/*.schema.json` 由 Zod schema 脚本生成，不手动维护。

## 格式化与 Lint

<!-- 推荐落到工具配置而非文字：
- EditorConfig（.editorconfig）统一缩进 / 换行 / 编码
- 各生态 linter+formatter：JS/TS=ESLint+Prettier · Python=Ruff/Black · Go=gofmt+golangci-lint · Rust=rustfmt+clippy -->

- 使用 EditorConfig 统一基础格式（缩进、换行、编码）。
- 使用 ESLint + Prettier 管理 TS/React 代码风格。
- 规则以工具配置为准，不在业务代码中引入风格分歧。

## 测试

<!-- 测试框架与覆盖要求。示例：JS/TS=Vitest · Python=pytest · Go=go test · Rust=cargo test。
测试策略遵循 XP/TDD（见 .human/architecture.md 与 tests/）。 -->

- 单元/组件测试：Vitest + Testing Library。
- E2E 测试：Playwright。
- 测试策略遵循 XP/TDD：先失败测试（red）-> 最小实现（green）-> 重构（refactor）。
- Feature 测试需覆盖成功路径、失败路径与端口交互。

## 命名约定

<!-- 仅记跨语言的团队约定（如目录用 kebab-case、领域类型用业务名）；语言内置规范交给 linter。 -->

- 目录与文件名使用 kebab-case。
- 领域类型、方法名、事件名使用业务术语（与 `.human/glossary.md` 对齐）。
- 应用层命令事件命名采用业务语义（如 `page-opened`、`day-selected`）。
- 避免使用 `manager`、`helper` 等弱语义命名承载业务概念。

### Outbound 文件命名（统一约定）

- Outbound 实现文件统一使用 `语义名.角色.ts` 后缀风格，避免实现细节导向命名。
- Repository：`*.repository.ts`，例如 `mock-trip-plan.repository.ts`、`file-trip-plan.repository.ts`。
- Validator：`*.validator.ts`，例如 `trip-plan-schema.validator.ts`。
- Gateway：`*.gateway.ts`（对接第三方 API / SDK）。
- Mapper：`*.mapper.ts`（边界模型转换）。
- 类/工厂命名优先表达业务语义与实现技术：如 `TripPlanSchemaZodValidator`、`MockTripPlanRepository`。

## UX 与动画约定

- 动画服务于信息理解，不干扰“快速查看”主任务。
- 仅在关键交互使用动画：页面切换、列表入场、状态反馈。
- 必须支持 `prefers-reduced-motion`，在弱性能设备可降级关闭复杂动画。
- 长列表场景优先保证流畅性，必要时使用虚拟滚动。

## 提交与分支

<!-- 推荐 Conventional Commits（feat/fix/docs/refactor/test/chore）+ 短生命周期分支。
示例：feat(ordering): 支持优惠券抵扣。 -->

- 提交规范：Conventional Commits（`feat`/`fix`/`docs`/`refactor`/`test`/`chore`）。
- 分支策略：短生命周期功能分支，合并前通过测试与规则校验。
