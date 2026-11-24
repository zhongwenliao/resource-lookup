# 华源湘条码追溯系统

检测设备导出的 Excel 质检数据 → 合格品（OK）一物一码二维码标签打印 → 码值绑定 → 码对绑定与汇总 → 关联溯源查询的桌面系统（Electron + Vue 2）。

## 功能

- 上传检测设备导出的 `.xlsx / .xls`，纯前端解析（SheetJS），数据不出本机
- 自动识别判定列（OK/NG 占比最高）、序号列、时间列、测量列，也可手动指定
- 筛出 OK 记录，每条按编码规则生成一个唯一二维码（一物一码）
- 二维码内容为编码规则码值（KBWK@@##*!%YMMDDXXXXX：项目+组件+试制阶段+颜色+供方/原材/阳极供方首字母+年月日+五位流水码自动 +1）
- 扫码绑定：检测数据表格实时读取（设备持续导出自动刷新），扫码绑定到表格记录
- 码对绑定：扫产品上的唯一**数字码** + 标签码建立 1:1 绑定，按绑定文档分组，绑定清单可导出 Excel 文档（两码均在列）
- 汇总二维码：多个绑定文档上的数字码汇总绑定到**一个二维码**（内容为 `HYX-AGG` 标识行 + 数字码逐行），通用扫码器即可读出全部数字码
- 关联溯源查询：输入/扫码自动分流——汇总码（成员逐个关联标签码）、扫码绑定记录、码对绑定（数字码/标签码双向）、汇总成员反查，再回退明文文本 / 编码规则解析；数据存本机 IndexedDB，可关联查询
- 标签规格：50×40mm / 40×30mm / 38×38mm（每页 1 个，适配标签打印机）、A4 排版（每页 24 个带裁切线）
- 调起系统打印对话框，可直接打印或另存为 PDF
- 导出 BarTender 打印任务（.btxml）：每条 OK 记录一个打印命令，二维码内容写入模板具名数据源（如歌尔模板的 `BcQrcodeData`），由 BarTender 渲染二维码

## 开发

```bash
npm install
npm run dev          # 浏览器开发调试（localhost:8080）
npm run electron:dev # Electron 窗口运行（需先 build 或同时起 dev）
```

## 打包安装程序

```bash
npm run electron:build   # = npm run build + electron-builder --win nsis
```

产物：`release/华源湘条码追溯系统-Setup-1.3.0.exe`（NSIS 安装包，x64）
免安装版：`release/win-unpacked/华源湘条码追溯系统.exe`

## BarTender（.btw 模板）批量打印

1. 应用内置「歌尔260701-1中框 锖色.btw」模板（`static/` 目录，随安装包分发，启动后自动填入路径）；换用其他模板时填其本机绝对路径。二维码具名数据源名默认 `BcQrcodeData`
2. 点击「BarTender 打印」**一键完成**：自动探测本机 `BarTend.exe`（PATH → 常见安装目录 → 注册表），写临时脚本并调起打印，无需命令行（仅安装包版本可用）
3. 备用通道：「导出 BTXML 文件」得到 `.btxml` 脚本，命令行执行 `BarTend /XMLScript=质检标签-xxx.btxml`，或用 BarTender 直接打开

> `.btw` 是闭源二进制格式，无法在浏览器端直接生成；BTXML 是 BarTender 官方的自动化打印通道，效果等同在模板数据输入表单中逐条录入数据打印。

## 目录结构

```
electron/main.js                      # Electron 主进程（含 Excel 读写/导出、打印、授权 IPC）
electron/preload.js                   # 渲染层安全白名单（contextBridge）
src/main.js / router.js / App.vue     # Vue 入口（标签生成 / 扫码绑定 / 码对绑定 / 汇总码 / 溯源查询五路由）
src/views/QcLabel.vue                 # 标签生成主页面
src/views/CodeBind.vue                # 扫码绑定页（绑定检测表格记录）
src/views/PairBind.vue                # 码对绑定页（数字码 ↔ 标签码 1:1 绑定 + Excel 清单导出）
src/views/AggCode.vue                 # 汇总二维码页（多文档数字码汇总成码）
src/views/QrLookup.vue                # 关联溯源查询页
src/components/                       # DemoPage / DemoBlock / ScanDialog / LicenseGate 容器组件
src/common/                           # 编码规则 / 码值解析 / IndexedDB / 扫码枪 / Excel 解析共享模块
static/*.btw                          # 内置 BarTender 标签模板（随安装包分发）
build-res/                            # 应用图标（icon.ico / icon.png）
build/ config/                        # webpack 构建配置（vue-cli 2 模板）
```

## 打印建议

- 标签打印机：装入对应规格标签纸，打印对话框中纸张类型选同规格，缩放 100%
- NG 记录不生成二维码，不会误贴
