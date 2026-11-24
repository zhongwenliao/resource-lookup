# 任务：码对绑定与汇总二维码

## 1. 共享规则与解析

- [x] 1.1 `qc-code-rules.js`：新增 `AGG_HEADER` 标识行常量、`isDigitCode` 数字码校验、`buildAggContent`/`parseAggContent` 汇总码内容编解码（生成端/解析端单一事实来源）
- [x] 1.2 `qr-parse.js`：`parseQrContent` 新增 `agg` 模式（多行首行 `HYX-AGG`），返回 `{ mode: 'agg', data: { codes } }`

## 2. 本地数据库（qc-db.js v6）

- [x] 2.1 DB_VERSION 5→6，onupgradeneeded 新建 `bind-docs` / `pair-bindings` / `agg-codes` 三仓及索引（`agg-codes.digitCodes` 用 multiEntry 支撑成员反查；旧仓不动，无数据迁移）
- [x] 2.2 文档 API：`saveDoc` / `listDocs` / `updateDocName`（级联刷新码对文档名快照）/ `deleteDocCascade`（同事务级联删码对）
- [x] 2.3 码对 API：`savePairBinding`（1:1 先清后写）/ `findPairByDigit` / `findPairByLabel` / `findPairsByDigits` / `findPairsByDoc` / `listPairBindings` / `deletePairBinding`
- [x] 2.4 汇总 API：`saveAggCode` / `findAggByContent` / `findAggsByDigit` / `listAggCodes` / `deleteAggCode`

## 3. 码对绑定页（PairBind.vue，/pair）

- [x] 3.1 文档管理区块：新建/改名/删除（级联确认）、当前文档选择
- [x] 3.2 两步绑定状态机：数字码（`isDigitCode` 校验）→ 标签码 → 落库回 idle；摄像头连续扫码（ScanDialog）/ 扫码枪（scanner-gun）/ 手动输入三通道；已绑定码跳过提示；串行队列防并发
- [x] 3.3 绑定记录区块：按文档筛选、分页表格、删除
- [x] 3.4 Excel 清单导出：AOA 组表 → `XLSX.write(type:'array')`；Electron 走 `excel:export-file` IPC（判空降级），浏览器降级 `XLSX.writeFile` 下载

## 4. 汇总二维码页（AggCode.vue，/agg）

- [x] 4.1 新建区块：标题、多选来源文档载入数字码、扫码/手动追加成员、成员表格（勾选、关联标签码、移除）
- [x] 4.2 生成：`buildAggContent` → 长度校验 → `QRCode.toDataURL` 预览 + `saveAggCode` 落库；下载 PNG / 复制内容
- [x] 4.3 历史区块：列表（标题/成员数/时间）、重新预览、查看成员、删除

## 5. 溯源查询页关联检索（QrLookup.vue）

- [x] 5.1 `doQuery` 顺序：汇总码 → 记录绑定 → 码对绑定（数字码/标签码双向）→ 汇总成员反查 → 明文/规则码解析
- [x] 5.2 结果模板新增 `pair` / `agg` 两个展示分支（成员表格逐行关联标签码与文档）；历史记录标签/着色扩展

## 6. 路由、导航与更名

- [x] 6.1 `router.js` 新增 `/pair`、`/agg`；`App.vue` 导航加「码对绑定」「汇总码」并展示品牌名
- [x] 6.2 更名「华源湘条码追溯系统」：`package.json`（description/productName/shortcutName/artifactName/version）、`electron/main.js` 窗口标题、`index.html`、`README.md`、`CLAUDE.md`

## 7. 主进程 IPC

- [x] 7.1 `electron/main.js`：`excel:export-file`（保存对话框 + Buffer 二进制写盘，返回 `{ ok, path | canceled | error }`）
- [x] 7.2 `electron/preload.js`：`exportExcelFile` 白名单暴露

## 8. 验证

- [x] 8.1 `npm run build` 通过（babel 6 / webpack 3，无 `?.` `??` 等 ES2019+ 语法）
- [x] 8.2 ESLint 通过（无分号、单引号、standard）
- [x] 8.3 浏览器 dev 模式无 `window.electronAPI` 未定义报错（导出走判空降级下载）
- [x] 8.4 自检清单：NG 红线、授权二次校验、共享规则单一来源、IPC `域:动作` 命名均未破坏
