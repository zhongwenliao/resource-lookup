# 质检二维码标签生成器

检测设备导出的 Excel 质检数据 → 合格品（OK）一物一码二维码标签打印的桌面工具（Electron + Vue 2）。

## 功能

- 上传检测设备导出的 `.xlsx / .xls`，纯前端解析（SheetJS），数据不出本机
- 自动识别判定列（OK/NG 占比最高）、序号列、时间列、测量列，也可手动指定
- 筛出 OK 记录，每条生成一个二维码（含型号、序号、检测时间、全部测量值）
- 标签规格：50×40mm / 40×30mm / 38×38mm（每页 1 个，适配标签打印机）、A4 排版（每页 24 个带裁切线）
- 调起系统打印对话框，可直接打印或另存为 PDF

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

## 目录结构

```
electron/main.js                      # Electron 主进程
src/main.js / router.js / App.vue     # Vue 入口（单路由）
src/components/demos/qrcode/QcLabel.vue  # 工具主页面
src/common/components/                # DemoPage / DemoBlock 容器组件
build-res/icon.ico                    # 应用图标
build/ config/                        # webpack 构建配置（vue-cli 2 模板）
gen_qr_labels*.py                     # 辅助：Python 版批量生成标签 PDF 脚本
_trimmed_backup/                      # 裁剪前的原练习场项目文件备份
```

## 打印建议

- 标签打印机：装入对应规格标签纸，打印对话框中纸张类型选同规格，缩放 100%
- NG 记录不生成二维码，不会误贴
