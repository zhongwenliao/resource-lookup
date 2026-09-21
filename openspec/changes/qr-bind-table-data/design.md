# 设计：扫码绑定表格数据

## Context

- 用户确认两个关键决策：绑定方式为「逐个扫码 + 手动选行」（码与行无规律对应关系）；码来源为「外部码与本系统规则码都有」（码值不能假设可解析）
- 现有资产：`qc-db.js` 批次库（IndexedDB）、`QrLookup.vue` 摄像头扫码（jsQR）、`QcLabel.vue` Excel 解析（判定列识别等）、`qc-code-rules.js`/`qr-parse.js` 共享规则模块

## Goals / Non-Goals

- Goals：任意码值（含外部码）可与 Excel 表格行建立绑定；绑定后扫码可查；绑定关系离线留存本机
- Non-Goals：不做批量顺序自动绑定、不做按字段自动匹配（用户未选择）；不做绑定数据导出/同步；不改动生成端拼码与打印行为

## Decisions

- **D1 绑定查询优先于模式解析**：查询页 `doQuery` 先查绑定库再走 `parseQrContent`。理由：外部码不满足任何已知模式，若解析在前则外部码永远到不了绑定查询；绑定命中即终止，语义清晰
- **D2 绑定存记录快照而非引用**：`{ id, code, batchId, batchFileName, record, recordKey, boundAt }`。理由：批次删除（生成端判定列改选会重建批次记录）不应破坏已建立的绑定；快照自包含，查询端展示不依赖批次存在
- **D3 一码一行，重绑覆盖**：`saveBinding` 在同一事务内先删除同 `code` 与同 `recordKey` 的旧绑定再写入。理由：一物一码的业务语义；误绑后重扫即覆盖，无需先解绑。同码已绑定其他行时 UI 先确认提示
- **D4 recordKey = batchId + ':' + (seq || 'idx' + index)**：序号优先（人可读、判定列改选后仍稳定），空序号回退行下标（批次记录数组原样存取，顺序稳定）
- **D5 码值原样存储，匹配大小写不敏感**：存储 trim 后原样（外部码不解析不校验格式）；查询比对 toUpperCase（与 `findByRuleCode` 口径一致，容错手动输入大小写误差；物理标签码内容恒定，不会误命中）
- **D6 解析与扫码抽公共模块**：`qc-excel.js`（生成页/绑定页共用，防两页解析结果漂移——同一 Excel 两页解析不一致会导致绑定快照与生成数据对不上）；`ScanDialog.vue`（绑定页/查询页共用，防扫码逻辑两份拷贝）
- **D7 DB_VERSION 2→3**：`code-bindings` 仓库索引均非唯一（唯一性由 D3 写入端维护）；`withStore` 加可选仓库名参数，批次仓库接口不变
- **D8 数据源实时读取，不导入批次**：绑定页选定一个表格文件实时读取（检测设备持续导出时自动刷新），不再上传入库为批次。主进程 IPC 三通道：`excel:pick-file`（系统对话框选 .xlsx/.xls）、`excel:stat-file`（返回 mtimeMs/size，轮询轻量探测）、`excel:read-file`（返回 Uint8Array + mtimeMs，结构化克隆直达渲染层交给共享解析管线）。选择**轮询 stat 对比 mtime（默认 3 秒）而非 fs.watch**：Windows 下设备写入时监听事件抖动严重且可能读到半写状态；mtime 未变不重读全文件，避免大体积 IPC 空转。stat 不受写入锁影响，stat 失败即文件被移动/删除 → 暂停监听并提示（已读数据保留展示，重新选择文件可恢复）。设备写一半导致的读取失败（独占锁）或解析失败（内容不完整）属暂态：读取失败不更新 `lastMtime`、解析失败归零 `lastMtime`，下一轮轮询自动重试；保留旧数据不清空表格，不打断绑定操作。刷新后已选行按序号重定位（检测数据通常只追加行），定位不到则清空待选行。文件路径存 localStorage（`qc-bind-source-path`），重进页面自动恢复。浏览器 dev 模式无 `electronAPI`，降级保留上传控件（一次性快照，`sourceKey = 'upload:文件名'`）
- **D9 数据源标识与 DB v4**：绑定结构调整为 `{ code, sourceKey, sourceName, record, recordKey, boundAt }`——`sourceKey` 为数据源标识（桌面版为文件绝对路径，浏览器降级为 `'upload:文件名'`），`sourceName` 为文件名。`recordKey = sourceKey + ':' + (seq:xx | idx:xx)`（同 D4 序号优先），同一文件重开页面绑定标记不丢，换文件即新数据源互不干扰。DB_VERSION 3→4：`code-bindings` 补 `sourceKey` 索引（v3 装机用户原地升级，旧绑定无该字段索引自动跳过）；新增 `findBindingsBySource`。旧批次模式绑定（`batchId`/`batchFileName`）不迁移，展示时 `sourceName` 回退 `batchFileName` 向后兼容

## Risks / Trade-offs

- `QcLabel.vue` 解析方法改为转发公共模块（纯搬运）：回归风险靠纯函数等价性验证脚本（拼接源码运行，19 用例）+ 构建验证兜底；`pad2` 等 import 保留（其他方法仍在用）
- 判定列改选导致批次记录重建后，绑定页行标记的 recordKey 若依赖 index 可能漂移：D4 序号优先缓解；且绑定快照自包含，查询端不受影响（漂移仅影响绑定页行标记展示）
- IndexedDB 绑定库在 Node 环境无法直接验证：靠代码 review + 浏览器/Electron 实测（任务 5.2）
- 实时读取的暂态失败（设备写一半）依赖轮询重试收敛：3 秒间隔下最坏多等一轮；文件持续被独占锁定超过人工感知阈值时，用户可用「立即刷新」手动确认状态
- 轮询有 3 秒感知延迟（新导出的行最多 3 秒后出现）：绑定操作节奏（扫码→选行→确认）远慢于 3 秒，可接受；需要更快感知时调小 `POLL_INTERVAL` 即可

## Migration Plan

- DB v2→v3 升级仅新增仓库，旧批次数据不动；v2 的 legacy 仓库校验重建逻辑保留（v3 升级同样触发）
- DB v3→v4 升级仅对既有 `code-bindings` 仓库补 `sourceKey` 索引，旧绑定记录（批次模式）不动、不迁移，展示端回退兼容
- 查询页历史缓存新增 `binding` 模式条目，旧缓存（text/rule）结构不变，`openHistory` 向后兼容
- 绑定页原「历史批次」入口随实时读取模式移除：批次库（`import-batches`）仍服务生成页，不受影响

## Open Questions

（无——绑定方式与码来源已由用户确认）
