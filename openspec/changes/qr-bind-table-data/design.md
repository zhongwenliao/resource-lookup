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

## Risks / Trade-offs

- `QcLabel.vue` 解析方法改为转发公共模块（纯搬运）：回归风险靠纯函数等价性验证脚本（拼接源码运行，19 用例）+ 构建验证兜底；`pad2` 等 import 保留（其他方法仍在用）
- 判定列改选导致批次记录重建后，绑定页行标记的 recordKey 若依赖 index 可能漂移：D4 序号优先缓解；且绑定快照自包含，查询端不受影响（漂移仅影响绑定页行标记展示）
- IndexedDB 绑定库在 Node 环境无法直接验证：靠代码 review + 浏览器/Electron 实测（任务 5.2）

## Migration Plan

- DB v2→v3 升级仅新增仓库，旧批次数据不动；v2 的 legacy 仓库校验重建逻辑保留（v3 升级同样触发）
- 查询页历史缓存新增 `binding` 模式条目，旧缓存（text/rule）结构不变，`openHistory` 向后兼容

## Open Questions

（无——绑定方式与码来源已由用户确认）
