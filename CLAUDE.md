# AI 开发规范 — 质检二维码标签生成器

> **本文件是本项目唯一的 AI 规范内容源**，随仓库分发。
> `.codebuddy/rules/`、`AGENTS.md` 等入口文件均为指向本文件的薄引用。
> 供 AI 编码助手（Claude Code / CodeBuddy / Codex / Cursor 等）在本仓库工作时遵循。
> 目标：AI 产出必须与现有架构、技术栈约束、代码风格保持一致，减少返工。

---

## 1. 项目概览

检测设备导出的 Excel 质检数据 → 合格品（OK）一物一码二维码标签打印的 **Windows 桌面工具**（Electron + Vue 2），附带扫码溯源查询页。

核心链路：Excel 解析（SheetJS）→ OK 记录筛选 → 二维码生成（编码规则一物一码，KBWK@@##*!%YMMDDXXXXX）→ 标签排版打印（标签打印机 / A4 / BarTender BTXML）。溯源查询页识别两种内容模式：明文文本 / 编码规则。

**目标环境**：Windows x64、中文环境（用户路径、文件名可能含中文，所有文件读写必须显式指定 `utf8` 编码）。

---

## 2. 技术栈红线（AI 禁止事项）

| 层 | 锁定技术 | 禁止 |
|---|---|---|
| 前端框架 | Vue **2.6**（Options API） | Vue 3、Composition API、`<script setup>` |
| UI 库 | Element UI **2.13** | Element Plus、其他 UI 库 |
| 路由 | vue-router 3，**hash 模式** | history 模式（Electron `file://` 下不可用） |
| 构建 | webpack 3 + babel 6（vue-cli 2 模板） | Vite、webpack 5 配置写法 |
| 样式 | Less | Sass/Stylus |
| 桌面 | Electron 41，NSIS x64 | 改打包目标 |

**语法限制（babel 6 编译，重要）**：

- 禁用可选链 `?.`、空值合并 `??`、`BigInt`、`Array.prototype.flat` 等 ES2019+ 语法/API，编译会直接报错
- 安全写法：`obj && obj.prop`、`(x != null) ? x : y`
- 新增 npm 依赖前必须确认兼容 webpack 3 / babel 6，并说明理由，禁止擅自引入大型依赖

---

## 3. 目录结构与代码归属

```
electron/            主进程（CommonJS require）
  main.js            窗口创建、IPC handler、BarTender 探测与调起
  preload.js         contextBridge 白名单（window.electronAPI）
  license.js         授权状态机（试用期 + 激活码，HMAC 防篡改）
  license-core.js    机器码 / 签名核心
  keygen.js          授权码生成工具
src/                 渲染进程（ES Module import）
  views/             页面级组件：QcLabel.vue（生成）、QrLookup.vue（溯源）
  components/        通用组件：DemoPage / DemoBlock / LicenseGate
  common/            跨页面共享模块（见 §4.3）
static/              随包分发资源：.btw 模板
build/ config/       webpack 构建配置（vue-cli 2 模板，非必要不动）
openspec/            spec-driven 变更流程（changes/ 进行中，specs/ 归档）
docs/                文档与图示
```

**新增代码归属规则**：

1. 仅单个页面使用的逻辑 → 放该 view 内部
2. **生成端与解析端共用的规则/常量/编解码函数 → 必须放 `src/common/qc-code-rules.js`**（单一事实来源，防止两端规则漂移，这是本项目核心设计）
3. 需要系统能力（文件、进程、注册表、临时目录）→ 一律主进程 + IPC，**禁止**在渲染进程开启 nodeIntegration 或直接 require node 模块

---

## 4. 架构与安全约定

### 4.1 Electron 安全模型

- `contextIsolation: true`、`nodeIntegration: false`，渲染进程只能通过 `window.electronAPI.*` 调用主进程
- 新增主进程能力三步走：
  1. `electron/main.js`：`ipcMain.handle('域:动作', handler)`
  2. `electron/preload.js`：`contextBridge.exposeInMainWorld` 暴露方法
  3. 渲染进程调用
- IPC 通道命名：`域:动作`，如 `btw:list-templates`、`license:get-state`
- 主进程 handler 统一返回 `{ ok: boolean, error?: string }`，**不向渲染层抛异常**
- 付费/授权相关能力（如打印），**主进程侧必须二次校验授权状态**（纵深防御，参考 `btw:print-btxml` 的实现）

### 4.2 浏览器/Electron 双环境兼容

`npm run dev` 是纯浏览器环境，**`window.electronAPI` 不存在**。渲染进程所有调用必须判空降级：

```js
if (window.electronAPI && window.electronAPI.printBtxml) {
  // Electron 环境
} else {
  // 浏览器降级提示
}
```

### 4.3 共享模块约定

- `qc-code-rules.js`：二维码编码规则（映射表、拼码/拆段），生成端与解析端共用；新增颜色/阶段/组件词条只改这一处
- `qc-db.js`：IndexedDB 轻封装（库名 `qc-label-db` v2，仓库 `import-batches`），所有接口返回 Promise，失败由调用方降级提示、不阻断主流程；只存记录明细，不存二维码图片
- `qr-parse.js`：二维码内容解析

---

## 5. 代码风格（ESLint standard + 项目自定义）

- **无分号**（`semi: 0`）、单引号、2 空格缩进、单行 ≤ 300 字符
- Vue 组件用 Options API（`data` / `methods` / `computed`）
- 模块体系：渲染进程 `import/export`，主进程 `require/module.exports`
- **注释用中文，写"为什么"而非"是什么"**（现有代码风格，如 BOM 防误读、asarUnpack 原因等均有先例）
- 提交信息：中文、简明、说清变更点

---

## 6. 领域知识（改代码前必读）

- **编码规则**：`KBWK@@##*!%YMMDDXXXXX` = 项目+组件+试制阶段+颜色+供方/原材/阳极供方首字母+年月日+五位流水码（自动 +1）
- 码值映射（阶段 V3→3/V4→4/VN1→5/VN2→6/LV→7；颜色 锖色→Q/银色→Y；月份 10/11/12→A/B/C）只在 `qc-code-rules.js` 定义
- OK/NG 判定：自动识别 OK/NG 占比最高的判定列；**NG 记录不生成二维码**（防误贴，不可破坏）
- **BTXML 陷阱**：写临时文件必须加 UTF-8 BOM（`'\ufeff' + xml`），否则 BarTender 按 ANSI 误读中文
- `.btw` 是闭源二进制格式，只能经 BTXML 通道驱动 BarTender，无法前端生成
- `BarTend.exe` 探测顺序：PATH → 常见安装目录 → 注册表 `HKLM\SOFTWARE\Seagull Scientific\BarTender`
- 打包路径：`app.isPackaged` 时 static 资源在 `app.asar.unpacked/dist/static`（asarUnpack 解包，外部程序才能读）
- 授权状态机：首次启动 → trial（3 天）→ expired（需激活码）→ activated；`license.json` 带 HMAC 签名，篡改即判 expired

---

## 7. 常用命令

```bash
npm run dev            # 浏览器调试（localhost:8080，无 Electron 能力）
npm run electron:dev   # Electron 窗口运行（需先 build 或同时起 dev）
npm run electron:build # 打 NSIS 安装包 → release/质检二维码标签生成器-Setup-x.x.x.exe
```

---

## 8. 变更流程（OpenSpec）

较大的功能/重构走 `openspec/` spec-driven 流程：

1. `openspec/changes/<变更名>/` 下建 proposal、specs、tasks
2. 实现完成并验证后归档到 `openspec/specs/`
3. 小修小补可直接改代码，但需遵守本规范全部约定

---

## 9. AI 自检清单（提交前逐项确认）

- [ ] 未使用 Vue 3 / Element Plus / ES2019+ 语法（`?.`、`??` 等）
- [ ] ESLint 通过（无分号、单引号、standard 风格）
- [ ] 浏览器模式（`npm run dev`）不报 `window.electronAPI` 未定义（已判空降级）
- [ ] 生成端/解析端规则改动只落在 `qc-code-rules.js` 一处
- [ ] 新增 IPC 遵循 `域:动作` 命名，返回 `{ ok, error }`，preload 已同步暴露
- [ ] 文件读写显式 `utf8`；生成 BTXML 已加 BOM
- [ ] 中文路径/文件名场景可用（Windows 中文环境）
- [ ] 未破坏"NG 不生成二维码"与授权主进程二次校验两条业务红线
