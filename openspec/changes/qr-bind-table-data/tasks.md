# 任务清单：扫码绑定表格数据

## 1. 共享模块抽取（防漂移）

- [x] 1.1 新建 `src/common/qc-excel.js`：把 `QcLabel.vue` 的 Excel 解析纯函数（`readSheetRows`/`guessModelFromName`/`detectJudgeCol`/`detectOtherCols`/`buildRecords`/`formatTimeVal`/`formatMeasureVal`）迁出，并新增一站式管线 `parseQcExcel(buf, name)`；`QcLabel.vue` 方法改为转发（纯搬运，行为不变）。验证：拼接源码运行等价性脚本（19 用例：内存构造 xlsx 闭环、列识别、记录构建、错误路径、格式化边界）全部通过；`npm run build` 无报错
- [x] 1.2 新建 `src/components/ScanDialog.vue`：把 `QrLookup.vue` 的摄像头扫码弹层（getUserMedia + jsQR 抽帧 + 错误降级提示）抽为公共组件，props `visible`(.sync)/`tip`，emit `scan(code)`；`QrLookup.vue` 改为引用并删除内嵌实现。验证：构建通过，查询页扫码行为不变（组件内逻辑逐行搬运）

## 2. 绑定数据层

- [x] 2.1 `qc-db.js` DB_VERSION 2→3：新增 `code-bindings` 仓库（keyPath `id` 自增，code/boundAt/batchId 索引非唯一）；`withStore` 泛化支持仓库名，批次仓库接口不变。验证：构建通过，旧批次数据不受影响（仅新增仓库）
- [x] 2.2 绑定接口：`saveBinding`（一码一行：同事务先删同 code 与同 recordKey 旧绑定再写入，重绑覆盖）、`findBindingByCode`（大小写不敏感，返回最新绑定或 null）、`findBindingsByBatch`、`listBindings(limit)`（boundAt 倒序）、`deleteBinding(id)`。验证：代码 review + 浏览器实测（任务 5.2）
- [x] 2.3 实时读取数据层：DB_VERSION 3→4 补 `sourceKey` 索引（既有仓库原地升级，旧绑定无该字段索引自动跳过）；新增 `findBindingsBySource(sourceKey)`；`saveBinding` 参数改 `sourceKey`/`sourceName`（旧 `batchId`/`batchFileName` 字段遗留记录不迁移，展示端回退兼容）。验证：构建通过；DB 升级后旧绑定记录仍可查询

## 3. 绑定页面

- [x] 3.1 新建 `src/views/CodeBind.vue`：上传 Excel（`parseQcExcel` 共享解析，解析即入库为批次）或载入历史批次；统计卡片（总数/OK/NG/已绑定）。验证：构建通过；上传与历史批次载入后记录表格展示正确
- [x] 3.2 绑定操作流：摄像头扫码（ScanDialog）或手动输入 → 待绑定码栏（规则码顺带拆段摘要提示，外部码标注原样绑定）→ 表格点选行（highlight-current-row）→ 确认绑定（同码已绑定其他行时确认提示覆盖）→ 落库后行标记绑定码值、待绑定码清空进入下一轮。验证：浏览器实测逐个绑定闭环
- [x] 3.3 解绑与列表：已绑定行解绑按钮；本机绑定记录列表（最近 50 条倒序：码值/序号/判定/来源/绑定时间/删除）。验证：解绑后行标记与列表同步刷新
- [x] 3.4 改造为数据源实时读取（不导入批次）：主进程 IPC 三通道 `excel:pick-file`（系统对话框）/`excel:stat-file`（mtime 探测）/`excel:read-file`（Uint8Array 二进制）+ preload 暴露；绑定页区块 1 改为「选择表格文件 + 实时监听开关 + 立即刷新」，移除批次入库与历史批次弹层；轮询 stat（3 秒）对比 mtime 自动重读刷新，设备写一半静默重试（保留旧数据、lastMtime 归零强制重试），文件失效暂停监听并提示；刷新后选中行按序号重定位；路径记忆 localStorage 重进自动恢复；浏览器降级上传快照（`sourceKey = 'upload:文件名'`）。验证：构建通过；Electron 实测选文件读取、改文件自动刷新、删文件提示暂停

## 4. 查询页与路由

- [x] 4.1 `QrLookup.vue`：`doQuery` 改异步，先查绑定库（命中展示绑定记录：序号/时间/判定/测量值/来源数据源/绑定时间，附「管理绑定」链接；`sourceName` 回退 `batchFileName` 兼容旧绑定），未绑定回退现有模式解析；历史缓存支持 `binding` 模式。验证：绑定外部码后扫码查询命中展示；未绑定码走原解析流程
- [x] 4.2 `src/router.js` 增加 `/bind` 路由（懒加载，`meta.name: '扫码绑定'`）；`App.vue` 导航加「扫码绑定」。验证：三页互跳正常，`#/bind` 直达

## 5. 回归验证

- [x] 5.1 生成端回归：`QcLabel.vue` 解析转发重构后上传 Excel → 列识别/记录构建/统计与重构前一致（等价性脚本 19 用例通过）；`npm run build` 产出 qclabel/codebind/qrlookup 三 chunk 均正常
- [ ] 5.2 端到端闭环：绑定页选定数据源文件（桌面版实时读取/浏览器上传快照）→ 扫外部码选行确认绑定 → 查询页扫同一码命中展示绑定记录；规则码绑定后查询同样命中；解绑后查询回退解析流程；数据源文件更新后绑定页自动刷新且已绑定行标记不丢。验证：Electron 实测外部码与规则码各一次绑定→查询闭环 + 文件更新自动刷新
- [ ] 5.3 `npm run electron:build` 打包成功，安装包内绑定与查询功能实测可用
