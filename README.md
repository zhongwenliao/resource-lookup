# frontend-playground · 前端技术沉淀

一个**可运行的前端技术练习场**：每个技术点一个可交互示例，边看边玩。所有示例基于真实工程配置（webpack 3 + Vue 2 全家桶），不是纸上谈兵。

## 技术栈

- **核心**：Vue 2.6 / Vue Router 3 / Vuex 3
- **组件库（双库对比）**：Element UI 2.x + Ant Design Vue 1.x
- **样式**：Less 3 + scoped + postcss-pxtorem（移动端 rem 适配）
- **工程**：webpack 3（vue-cli 2 模板）、ESLint（standard）+ Prettier、Jest / Nightwatch

## 沉淀模块

| 模块 | 内容 | 入口 |
| --- | --- | --- |
| Vue 特性 | 组件通信八式、插槽三种用法、自定义指令、Mixin 合并策略 | `/vue/*` |
| 组件库对比 | Element vs Antd 总览、表单/表格同场景双实现 | `/ui/*` |
| 路由方案 | 动态参数、编程式导航、导航守卫与执行顺序 | `/router/*` |
| Vuex | 单向数据流、mapXxx 辅助函数、异步 action | `/vuex/counter` |
| 样式方案 | Less 变量/mixin、scoped 穿透、px2rem 链路 | `/style/less` |
| 工程化 | require.context 自动注册、webpack 配置要点 | `/engineering/*` |
| 网络通信 | WebSocket 状态机、心跳保活、指数退避重连、大文件上传（分片/秒传/断点续传/并发池）、地图瓦片离线缓存（弱网模拟/Cache First/SWR/离线兜底） | `/websocket/*` `/upload/*` `/map/*` |
| PWA | Service Worker 生命周期、Cache First / Network First / SWR 缓存策略、离线感知、manifest、消息通知 | `/pwa/*` |

## 目录结构

```
src/
├── main.js               # 入口：双组件库注册
├── App.vue               # 布局骨架（头部 + 侧边栏 + 主区域）
├── router.js             # 路由配置即菜单（meta.group 驱动侧边栏）
├── store/
│   ├── index.js          # require.context 自动聚合所有模块
│   └── counter.js        # Vuex 演示模块
├── common/components/    # 公共组件（布局 + 演示页容器 DemoPage/DemoBlock）
└── components/demos/     # 技术演示页（按模块分目录）
    ├── Home.vue
    ├── vue/              # Vue 特性
    ├── ui/               # 组件库对比
    ├── router/           # 路由方案
    ├── vuex/             # Vuex
    ├── style/            # 样式方案
    ├── engineering/      # 工程化（modules/ 子目录演示自动注册）
    ├── websocket/        # 网络通信（基础用法 / 心跳与重连）
    ├── upload/           # 大文件上传（分片/秒传/断点续传/并发池）
    ├── map/              # 地图瓦片离线缓存（弱网模拟 / 缓存策略 / 离线兜底）
    └── pwa/              # PWA（Service Worker / 缓存策略 / 离线与通知）
static/
├── sw.js                 # 手写 Service Worker（三种缓存策略，PWA 演示配套）
├── manifest.json         # PWA 应用清单（index.html 已关联）
└── pwa-demo/             # 缓存策略测试资源
scripts/
├── ws-server.js          # WebSocket 演示服务器（npm run ws:server，端口 8081）
├── upload-server.js      # 大文件上传服务器（npm run upload:server，端口 8082）
└── tile-server.js        # 地图瓦片服务器（npm run tile:server，端口 8083，支持弱网模拟）
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# 启动 WebSocket 演示服务器（WebSocket 模块的示例依赖它，端口 8081）
npm run ws:server

# 启动大文件上传服务器（大文件上传演示依赖它，端口 8082）
npm run upload:server

# 启动地图瓦片服务器（瓦片离线缓存演示依赖它，端口 8083）
npm run tile:server

# build for production with minification
npm run build

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# ESLint 检查并自动修复（--fix）
npm run lint
```

## 如何新增一个演示页

三步接入，菜单自动出现（受益于「路由配置即菜单」）：

1. 在 `src/components/demos/` 下新建 `.vue` 演示页（建议用 `DemoPage` + `DemoBlock` 容器保持结构统一）
2. 在 `src/router.js` 的 `routeConfig` 中注册一条路由（`meta.name` 菜单文案 / `meta.group` 分组名）
3. 完成 —— 侧边栏与页面标题自动生成

## 相关文档

- [开发规范](docs/开发规范.md)
