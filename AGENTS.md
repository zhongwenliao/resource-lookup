# AGENTS.md — AI 编码助手协作规范

> 供 AI 编码助手（CodeBuddy / Cursor / Claude Code / Codex 等）在本仓库工作前通读。人读亦可。

## 项目定位

「前端技术沉淀」：**可运行的前端技术练习场**，每个技术点一个可交互演示页。代码即文档——所有示例必须真实可运行，不是伪代码。

## 技术栈（注意：是 Vue 2，不是 Vue 3）

- **核心**：Vue 2.7（统一 Options API 写法）/ Vue Router 3 / Vuex 3
- **组件库（双库共存，用于对比沉淀）**：Element UI 2.x（`el-*`）+ Ant Design Vue 1.x（`a-*`），均已全量全局注册，模板直接使用，无需局部引入
- **样式**：Less + `scoped`；postcss-pxtorem 仅作用于 `src/views/`（rootValue 37.5，设计稿 375px）—— views 下样式直接写 px，构建时自动转 rem，**不要手写 rem**
- **构建**：Vite 5，Node >= 18
- **别名**：`@` → `src/`；`vue` 已别名为完整版构建（支持 template 选项），见 `vite.config.js`，勿改动

## 常用命令

```bash
npm run dev            # 开发服务器 localhost:8080（strictPort，被占用直接报错，禁止换端口）
npm run lint           # ESLint 检查并自动修复（--fix）
npm run build          # 生产构建 → dist/
npm run ws:server      # WebSocket 演示服务（端口 8081，websocket 模块依赖）
npm run upload:server  # 大文件上传服务（端口 8082，upload 模块依赖）
npm run tile:server    # 地图瓦片服务（端口 8083，map 模块依赖，支持弱网模拟）
```

端口约定：8080 前端 / 8081 ws / 8082 upload / 8083 tile，新增本地服务不得占用这四个端口。

## 核心架构约定

### 1. 路由配置即菜单（单一数据源）

`src/router/index.js` 的 `routeConfig` 数组同时驱动路由与侧边栏菜单：

- `meta.name`：菜单文案 + 浏览器标签标题（`beforeEach` 中同步）
- `meta.group`：侧边栏分组名（`getAsideConfig` 按此聚合）
- `meta.link`：可选，菜单实际跳转地址（动态路由用，默认取 `path`）
- `meta.hideAslide`：是否在侧边栏隐藏

路由组件一律懒加载：`component: loadingLazy('模块相对 views 的路径')`，不带 `.vue` 后缀。

### 2. Vuex 模块自动聚合

`src/store/*.js`（`index.js` 除外）经 `import.meta.glob` 自动注册，**文件名即模块名**。新增模块只需建文件，无需手动注册。

### 3. 演示页统一容器

所有演示页使用 `@/components/DemoPage` + `@/components/DemoBlock` 包裹，保持结构统一：

```vue
<template>
  <demo-page title="页面标题" description="一句话说清技术点与链路">
    <demo-block :index="1" title="小节标题" description="场景说明" :code="codeSnippet">
      <!-- 可交互示例 -->
    </demo-block>
  </demo-page>
</template>
```

## 新增演示页 SOP（三步）

1. 在 `src/views/<模块>/` 下新建 `.vue` 演示页（用 DemoPage + DemoBlock 容器）
2. 在 `src/router/index.js` 的 `routeConfig` 中注册一条路由（`meta.name` / `meta.group`）
3. 完成——侧边栏菜单与页面标题自动生成

## 代码风格（ESLint standard，提交前跑 `npm run lint`）

- 无分号、单引号、2 空格缩进、行尾逗号（多行时）
- 方法名后加空格：`data () {`、`created () {`
- 单行最长 300 字符
- 组件 `name` 用 PascalCase；演示页组件允许单词命名（`vue/multi-word-component-names` 已关闭）
- 模板中组件用 kebab-case（`<demo-page>`、`<el-input>`）
- 组件导入用 `@/` 别名：`import DemoPage from '@/components/DemoPage'`
- 注释用中文，关键处标注「技术点：xxx」解释原理（项目既有风格，见各演示页）

## AI 协作守则

1. **保持 Vue 2 Options API**：禁止 `<script setup>`、Composition API、Vue 3 专属 API（`defineProps` 等）
2. **不擅自引入新依赖**：新增 npm 包需用户明确同意
3. **不破坏双库共存**：Element 与 Antd 同场景对比是刻意设计，不要"统一"成一个库
4. **不改动 `vue` 别名与 `strictPort`**：前者是 template 选项的前提，后者避免撞 8081-8083
5. **演示页必须可交互、可运行**：涉及 ws/upload/tile 的示例，注明依赖的本地服务命令
6. **改完必跑 `npm run lint`**：确保零 error 再交付
7. **遵循既有目录语义**：页面进 `src/views/<模块>/`，跨页复用组件才进 `src/components/`

## 目录速览

```
├── AGENTS.md             # 本文件
├── vite.config.js        # Vite 配置（别名 / PostCSS pxtorem / strictPort）
├── public/               # 静态资源（sw.js / manifest.json 原样拷贝）
├── scripts/              # 本地演示服务器（Node，与前端工程解耦）
└── src/
    ├── main.js           # 入口：双组件库全量注册
    ├── App.vue           # 布局骨架（头部 + 侧边栏 + 主区域）
    ├── router/index.js   # 路由配置即菜单（routeConfig + getAsideConfig）
    ├── store/            # Vuex（import.meta.glob 自动聚合模块）
    ├── components/       # 公共组件（DemoPage / DemoBlock / 布局组件）
    └── views/            # 演示页（按模块分目录：vue/ ui/ router/ vuex/ style/
                          #   engineering/ websocket/ upload/ map/ pwa/ qrcode/）
```
