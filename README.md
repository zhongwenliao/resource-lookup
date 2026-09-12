# 质检二维码标签生成器

检测设备导出的 Excel 质检数据 → 合格品（OK）一物一码二维码标签打印的桌面工具（Electron + Vue 2）。

## 功能

- 上传检测设备导出的 `.xlsx / .xls`，纯前端解析（SheetJS），数据不出本机
- 自动识别判定列（OK/NG 占比最高）、序号列、时间列、测量列，也可手动指定
- 筛出 OK 记录，每条生成一个二维码（含型号、序号、检测时间、全部测量值）
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

产物：`release/质检二维码标签生成器-Setup-1.0.0.exe`（NSIS 安装包，x64）
免安装版：`release/win-unpacked/质检二维码标签生成器.exe`

## BarTender（.btw 模板）批量打印

1. 应用内置「歌尔260701-1中框 锖色.btw」模板（`static/` 目录，随安装包分发，启动后自动填入路径）；换用其他模板时填其本机绝对路径。二维码具名数据源名默认 `BcQrcodeData`
2. 点击「BarTender 打印」**一键完成**：自动探测本机 `BarTend.exe`（PATH → 常见安装目录 → 注册表），写临时脚本并调起打印，无需命令行（仅安装包版本可用）
3. 备用通道：「导出 BTXML 文件」得到 `.btxml` 脚本，命令行执行 `BarTend /XMLScript=质检标签-xxx.btxml`，或用 BarTender 直接打开

> `.btw` 是闭源二进制格式，无法在浏览器端直接生成；BTXML 是 BarTender 官方的自动化打印通道，效果等同在模板数据输入表单中逐条录入数据打印。

## 目录结构

```
electron/main.js                      # Electron 主进程
src/main.js / router.js / App.vue     # Vue 入口（单路由）
src/components/QcLabel.vue            # 工具主页面
src/common/components/                # DemoPage / DemoBlock 容器组件
static/qr-view.html                   # 「网页链接」模式扫码展示页（部署到服务器）
static/*.btw                          # 内置 BarTender 标签模板（随安装包分发）
build-res/                            # 应用图标（icon.ico / icon.png）
build/ config/                        # webpack 构建配置（vue-cli 2 模板）
```

## 打印建议

- 标签打印机：装入对应规格标签纸，打印对话框中纸张类型选同规格，缩放 100%
- NG 记录不生成二维码，不会误贴
