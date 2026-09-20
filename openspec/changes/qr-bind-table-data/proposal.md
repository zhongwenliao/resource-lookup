# 提案：扫码绑定表格数据

## Why

溯源查询目前依赖「生成时绑定」：`QcLabel.vue` 生成规则码时把 `ruleCode` 内嵌进批次记录落库，查询页按码回查。产线实际场景中大量二维码是**已存在的**（供应商标签、激光打标序列号等外部码，或已打印的本系统规则码），码值不经过生成端，无法与检测数据建立关联。需要一个「扫码 → 选表格行 → 确认绑定」的独立入口，把任意码值与 Excel 表格行建立绑定，之后扫码即可查到绑定的检测数据。

## What Changes

- 应用内新增「扫码绑定」页（第三个路由 `/bind`），与标签生成、溯源查询并列：
  - 上传检测数据 Excel（与生成页共用同一套列识别逻辑，解析即入库为批次）或载入历史批次
  - 摄像头扫码或手动输入得到码值（外部码原样存储不解析；规则码顺带拆段摘要提示）
  - 逐个绑定：扫一个码 → 表格点选对应记录行 → 确认绑定 → 扫下一个（一码一行，重绑覆盖）
  - 已绑定行展示绑定码值并支持解绑；本机绑定记录列表（最近 50 条，可删除）
- 绑定关系落 IndexedDB 新仓库 `code-bindings`（DB_VERSION 2→3）：存记录快照而非引用，来源批次删除后绑定仍可独立查询
- 溯源查询页查询顺序调整：**先查绑定库**（任何码值都可能已绑定，含外部码与规则码），命中直接展示绑定的表格记录；未绑定再走现有模式解析（text/rule）
- 摄像头扫码逻辑从 `QrLookup.vue` 抽为公共组件 `ScanDialog.vue`（绑定页与查询页共用）；Excel 解析纯函数从 `QcLabel.vue` 抽为 `src/common/qc-excel.js`（生成页与绑定页共用，防两页解析结果漂移）

## Capabilities

### New Capabilities

- `qr-bind-table-data`: 扫码绑定表格数据——上传/载入检测数据后，逐个扫描实物二维码并在表格中点选对应记录行，建立「码值 ↔ 表格数据」绑定（一码一行，重绑覆盖）；绑定存记录快照，独立于来源批次可查可解绑

### Modified Capabilities

- `qr-traceability-lookup`: 查询入口优先检索本机绑定库，命中展示绑定记录（序号/时间/判定/测量值/来源批次/绑定时间）；未绑定回退现有模式解析。摄像头扫码改用公共组件 `ScanDialog`（行为不变）

## Impact

- 新增 `src/views/CodeBind.vue`、`src/components/ScanDialog.vue`、`src/common/qc-excel.js`；`src/router.js` 与 `App.vue` 增加路由与导航
- `src/common/qc-db.js` DB_VERSION 升 3 新增 `code-bindings` 仓库（code/boundAt/batchId 索引均非唯一，唯一性由 `saveBinding` 写入前清理维护）；`withStore` 泛化支持仓库名
- `QcLabel.vue` Excel 解析方法改为转发 `qc-excel.js`（纯搬运，行为不变）；`QrLookup.vue` 扫码弹层改用 `ScanDialog`、`doQuery` 改异步先查绑定库
- 无新增第三方依赖（jsQR/XLSX/IndexedDB 均已有）；纯前端、数据不出本机
