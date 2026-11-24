# 提案：产品数字码 ↔ 标签码绑定与汇总二维码

## Why

产线在「一物一码标签」之外还有三层追溯诉求：

1. **码对绑定**：产品本体上打标了一段唯一的**数字码**（激光打标/喷码，一物一码），需要把它与贴在产品上的**标签码**（本系统规则码或外部码）建立 1:1 绑定——扫数字码能找到标签码，扫标签码也能找到数字码。
2. **绑定体现在文档上**：绑定结果要输出成正式文档（Excel 绑定清单），随货/随检验报告流转，文档上同时体现两个码。
3. **汇总二维码**：装箱/出货时需要把**多个文档上的数字码**汇总绑定到**一个二维码**上；用通用扫码器扫这一个码，就要能看到其中绑定的全部数字码（不依赖本软件也能读出），在本软件里扫则能进一步关联出每个数字码绑定的标签码与所属文档。
4. **关联查询**：以上关系需要一个本地数据库支撑，输入任意一个码（数字码/标签码/汇总码）都能反查出它的全部关联关系。

同时应用更名为「华源湘条码追溯系统」，定位从单一生成工具扩展为条码追溯系统。

## What Changes

- 新增「码对绑定」页（路由 `/pair`）：
  - 两步扫码绑定：先扫/输产品**数字码**（纯数字校验），再扫/输**标签码**，即建立 1:1 码对绑定；摄像头连续扫码、扫码枪（键盘模式）、手动输入三通道
  - **绑定文档**管理：码对归属到命名文档（新建/改名/删除），支撑「文档」粒度的清单导出与汇总取数
  - 绑定记录列表（按文档筛选/分页/删除）
  - **导出 Excel 绑定清单**（需求 2）：序号/数字码/标签码/所属文档/绑定时间，桌面版经主进程 IPC 保存对话框写盘，浏览器降级为下载
- 新增「汇总二维码」页（路由 `/agg`）：
  - 从**多个文档**勾选数字码（或扫码/手动追加）作为成员，生成**一个汇总二维码**：内容为「标识行 + 每行一个数字码」，通用扫码器即可读出全部数字码
  - 二维码预览/下载 PNG/复制内容；汇总关系落库（标题/成员/来源文档/创建时间），支持历史查看与删除
- 溯源查询页升级为**关联查询**（需求 5）：查询顺序变为 汇总码内容 → 记录绑定库 → 码对绑定库 → 汇总成员反查 → 明文/规则码解析：
  - 扫**汇总码**：展示标题、来源文档与全部成员数字码，逐个关联出各自绑定的标签码
  - 扫**数字码**：展示其绑定的标签码、所属文档与所在汇总码
  - 扫**标签码**：展示其绑定的数字码（反向查询）
- 本地数据库 `qc-label-db` 升 v6，新增三仓：
  - `bind-docs`：绑定文档 { id, name, createdAt, note }
  - `pair-bindings`：码对绑定 { id, digitCode, labelCode, docId, docName, createdAt }（1:1，重绑覆盖；digitCode/labelCode/docId/createdAt 索引）
  - `agg-codes`：汇总码 { id, title, content, digitCodes[], docIds[], createdAt }（`digitCodes` multiEntry 索引支撑「数字码 → 所在汇总」反查；`content` 索引支撑扫码精确回查）
- 汇总码内容格式为生成端/解析端共用规则，按单一事实来源约定落在 `src/common/qc-code-rules.js`（`HYX-AGG` 标识行 + 每行一个数字码），`qr-parse.js` 增加 `agg` 模式识别
- 应用更名「华源湘条码追溯系统」：窗口标题/安装包名/快捷方式/页面品牌/README 同步更新
- `electron/main.js` + `preload.js` 新增 `excel:export-file` IPC（保存对话框 + 二进制写盘），渲染层判空降级

## Capabilities

### New Capabilities

- `pair-code-binding`: 产品数字码 ↔ 标签码 1:1 绑定（两步扫码），绑定归属文档并可导出 Excel 绑定清单；多文档数字码汇总生成单个二维码（内容自包含全部数字码，通用扫码器可读），汇总关系落库

### Modified Capabilities

- `qr-traceability-lookup`: 查询入口升级为关联查询——优先识别汇总码内容并展示成员关联；单码依次检索记录绑定库、码对绑定库（数字码/标签码双向）、汇总成员反查，最后回退明文/规则码解析

## Impact

- 新增 `src/views/PairBind.vue`、`src/views/AggCode.vue`；`src/router.js` / `src/App.vue` 增加路由、导航与品牌名
- `src/common/qc-code-rules.js` 新增汇总码内容格式与数字码校验（生成端/解析端共用）；`src/common/qr-parse.js` 新增 `agg` 模式
- `src/common/qc-db.js` DB_VERSION 5→6（新仓只增不改旧仓，无数据迁移）；新增文档/码对/汇总三组 API
- `electron/main.js` / `electron/preload.js` 新增 `excel:export-file` IPC
- 更名涉及 `package.json`（productName/shortcutName/artifactName/version）、`electron/main.js`（窗口标题）、`index.html`、`README.md`、`CLAUDE.md`
- 无新增第三方依赖（SheetJS/qrcode/IndexedDB 均已有）；纯前端 + 本地库，数据不出本机
