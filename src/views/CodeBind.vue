<template>
  <demo-page
    title="扫码绑定"
    description="选定检测数据表格（桌面版实时读取，检测数据更新后自动刷新，无需导入）后，逐个扫描实物二维码并在表格中点选对应检测记录，确认后建立「码值 ↔ 表格数据」绑定。外部码与本系统规则码均可绑定；绑定关系保存在本机，溯源查询页扫码时优先展示绑定数据。">
    <!-- ==================== 区块 1：数据源表格（实时读取） ==================== -->
    <demo-block :index="1" title="数据源表格（实时读取）"
      description="桌面版选择检测数据表格文件后实时读取（不导入本机批次库）：检测设备持续导出数据时自动刷新，与标签生成页共用同一套列识别逻辑。浏览器调试模式降级为上传快照。">
      <!-- Electron：选文件 + 实时监听 -->
      <template v-if="hasExcelApi">
        <div class="source-bar">
          <el-button type="primary" size="small" icon="el-icon-folder-opened" @click="pickFile">选择表格文件</el-button>
          <el-button size="small" icon="el-icon-refresh" :loading="reading" @click="reloadSource(true)">立即刷新</el-button>
          <el-switch v-model="liveOn" active-text="实时监听"></el-switch>
        </div>
        <p v-if="sourcePath" class="source-path">
          <span class="path-text" :title="sourcePath">{{ sourcePath }}</span>
          <span v-if="lastRefreshAt" class="source-meta">上次刷新 {{ lastRefreshAt }}</span>
        </p>
      </template>
      <!-- 浏览器降级：上传快照（无实时读取能力） -->
      <template v-else>
        <el-alert type="info" :closable="false" class="dev-tip"
          title="浏览器调试模式：仅支持上传快照（不实时）。桌面版可选择表格文件实时读取，检测数据更新后自动刷新。"></el-alert>
        <el-upload drag action="#" accept=".xlsx,.xls" :auto-upload="false" :show-file-list="false"
          :on-change="onFileChange">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将检测设备导出的 Excel 拖到此处，或<em>点击选择</em></div>
        </el-upload>
      </template>
      <p v-if="sourceErr" class="err-tip">{{ sourceErr }}</p>
      <p v-if="parseErr" class="err-tip">{{ parseErr }}</p>

      <div v-if="stats" class="stat-cards">
        <div class="stat-card"><span class="num">{{ stats.total }}</span><span class="label">检测记录</span></div>
        <div class="stat-card ok"><span class="num">{{ stats.ok }}</span><span class="label">OK 合格</span></div>
        <div class="stat-card ng"><span class="num">{{ stats.ng }}</span><span class="label">NG 不合格</span></div>
        <div class="stat-card bound"><span class="num">{{ bindings.length }}</span><span class="label">已绑定</span></div>
      </div>
    </demo-block>

    <!-- ==================== 区块 2：扫码绑定 ==================== -->
    <demo-block v-if="records.length" :index="2" title="扫码绑定"
      description="扫描一个码 → 在下方表格点选对应记录行 → 确认绑定 → 扫下一个。同一码或同一行重复绑定时覆盖旧绑定（一码一行）。">
      <div class="pending-bar">
        <el-button type="success" size="small" plain icon="el-icon-camera" @click="scanVisible = true">摄像头扫码</el-button>
        <el-input v-model="manualCode" size="small" class="manual-input" placeholder="扫码不可用时手动输入码值"
          @keyup.enter.native="useManualCode"></el-input>
        <el-button size="small" @click="useManualCode">填入</el-button>
      </div>
      <div class="pending-code-box" :class="{ active: !!pendingCode }">
        <span class="pending-label">待绑定码</span>
        <span class="pending-code">{{ pendingCode || '（扫码或输入后显示）' }}</span>
        <span v-if="pendingHint" class="pending-hint">{{ pendingHint }}</span>
        <el-button type="primary" size="small" class="confirm-btn" :disabled="!pendingCode || !selectedRow"
          @click="confirmBind">确认绑定{{ selectedRow ? ' → #' + (selectedRow.record.seq || selectedRow.index + 1) : '' }}</el-button>
        <el-button v-if="pendingCode" size="text" class="clear-btn" @click="pendingCode = ''">清除</el-button>
      </div>
      <p class="bind-tip">已选行：{{ selectedRow ? '#' + (selectedRow.record.seq || selectedRow.index + 1) + '（' + (selectedRow.record.judge || '-') + '）' : '未选择（点击表格行选择）' }}</p>

      <el-table :data="records" size="mini" border highlight-current-row class="record-table"
        @current-change="onRowChange">
        <el-table-column label="序号" width="70">
          <template slot-scope="s"><span :class="s.row.judge === 'OK' ? 'txt-ok' : 'txt-ng'">#{{ s.row.seq || (s.$index + 1) }}</span></template>
        </el-table-column>
        <el-table-column prop="time" label="检测时间" width="160"></el-table-column>
        <el-table-column prop="judge" label="判定" width="60">
          <template slot-scope="s"><span :class="s.row.judge === 'OK' ? 'txt-ok' : 'txt-ng'">{{ s.row.judge }}</span></template>
        </el-table-column>
        <el-table-column v-for="(m, i) in measurePreviewCols" :key="i" :label="'测量' + (i + 1)" width="90">
          <template slot-scope="s">{{ s.row.measures[i] }}</template>
        </el-table-column>
        <el-table-column label="绑定" min-width="170">
          <template slot-scope="s">
            <template v-if="rowBinding(s.row)">
              <span class="bound-code" :title="rowBinding(s.row).code">{{ codePreview(rowBinding(s.row).code) }}</span>
              <el-button type="text" size="mini" class="unbind-btn" @click="unbind(rowBinding(s.row))">解绑</el-button>
            </template>
            <span v-else class="unbound">未绑定</span>
          </template>
        </el-table-column>
      </el-table>
    </demo-block>

    <!-- ==================== 区块 3：本机绑定记录 ==================== -->
    <demo-block :index="3" title="本机绑定记录"
      description="全部数据源的绑定关系按绑定时间倒序（最近 50 条）。绑定存记录快照，数据源文件删除或更换后仍可查询展示。">
      <el-table :data="bindingList" size="mini" border v-loading="bindingListLoading" class="binding-table">
        <el-table-column label="码值" min-width="200" show-overflow-tooltip>
          <template slot-scope="s"><span class="bound-code">{{ s.row.code }}</span></template>
        </el-table-column>
        <el-table-column label="序号" width="70">
          <template slot-scope="s">#{{ (s.row.record && s.row.record.seq) || '-' }}</template>
        </el-table-column>
        <el-table-column label="判定" width="60">
          <template slot-scope="s">
            <span :class="(s.row.record && s.row.record.judge) === 'OK' ? 'txt-ok' : 'txt-ng'">{{ (s.row.record && s.row.record.judge) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" min-width="140" show-overflow-tooltip>
          <template slot-scope="s">{{ s.row.sourceName || s.row.batchFileName || '未命名' }}</template>
        </el-table-column>
        <el-table-column prop="boundAt" label="绑定时间" width="150"></el-table-column>
        <el-table-column label="操作" width="70">
          <template slot-scope="s">
            <el-button type="text" size="mini" class="unbind-btn" @click="unbind(s.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!bindingList.length && !bindingListLoading" class="binding-empty">暂无绑定记录</p>
    </demo-block>

    <!-- ==================== 摄像头扫码弹层（公共组件） ==================== -->
    <scan-dialog :visible.sync="scanVisible" tip="将待绑定的二维码对准取景框，识别成功后自动填入待绑定码"
      @scan="onScanCode"></scan-dialog>
  </demo-page>
</template>

<script>
/**
 * 扫码绑定页 —— 把「已存在的二维码」与「检测数据表格行」建立绑定关系的路由页
 *
 * 数据流：选择数据源表格文件（桌面版经主进程 IPC 实时读取，不导入批次库；轮询
 *         mtime 感知检测设备持续导出，变化后自动重读刷新）→ 摄像头扫码（ScanDialog）
 *         或手动输入得到码值（外部码原样存储，规则码顺带拆段提示）→ 表格点选行
 *         → saveBinding 落 IndexedDB（一码一行，重绑覆盖）
 *         → 溯源查询页扫码优先展示绑定记录。
 * 绑定存记录快照（非引用）：数据源文件删除/更换后绑定仍可独立查询。
 * 浏览器调试模式无 electronAPI，降级为上传快照（sourceKey 用 'upload:文件名'）。
 * 全程纯前端、数据不出本机。
 */
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
import ScanDialog from '@/components/ScanDialog';
// Excel 解析一站式管线（与生成页共享的唯一实现，防止两页解析结果漂移）
import { parseQcExcel } from '@/common/qc-excel';
import { parseQrContent } from '@/common/qr-parse';
import { pad2 } from '@/common/qc-code-rules';
import {
  saveBinding, findBindingByCode, findBindingsBySource, listBindings, deleteBinding
} from '@/common/qc-db';

// 表格测量列最多展示列数（避免表格过宽）
const MEASURE_PREVIEW_COLS = 3;
// 本机绑定列表最多展示条数
const BINDING_LIST_MAX = 50;
// 实时监听轮询间隔（ms）：stat 只探测 mtime，变化才重读全文件，避免大体积 IPC 空转
const POLL_INTERVAL = 3000;
// 记住上次数据源文件路径的 localStorage 键（重进页面自动恢复实时读取）
const SOURCE_PATH_KEY = 'qc-bind-source-path';

export default {
  name: 'CodeBind',
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      /* ---- 数据源（实时读取） ---- */
      sourcePath: '', // 当前数据源文件绝对路径（桌面版实时读取模式）
      sourceKey: '', // 数据源标识：桌面版为文件路径，浏览器降级上传为 'upload:文件名'
      sourceName: '', // 数据源展示名（文件名）
      lastMtime: 0, // 上次成功读取的 mtimeMs（轮询对比，未变不重读；读取/解析失败不更新以便重试）
      lastRefreshAt: '', // 上次成功刷新时间（展示用）
      reading: false, // 读取/解析进行中（防重入）
      liveOn: true, // 实时监听开关（设备大量写入时可手动暂停）
      sourceErr: '', // 数据源文件访问错误（被移动/删除等），空串表示正常

      /* ---- 解析结果 ---- */
      records: [], // 记录：{ seq, time, judge, measures, ruleCode? }
      stats: null, // 统计：{ total, ok, ng }
      parseErr: '', // 解析错误提示，空串表示无错误

      /* ---- 绑定操作 ---- */
      scanVisible: false, // 摄像头扫码弹层
      manualCode: '', // 手动输入码值（扫码不可用降级入口）
      pendingCode: '', // 待绑定码（扫码/输入回填，确认后清空）
      selectedRow: null, // 待绑定行：{ record, index }（表格 current-change 记录）
      bindings: [], // 当前数据源的绑定数组（行绑定状态标记用）

      /* ---- 本机绑定列表 ---- */
      bindingList: [], // 最近绑定（倒序，最多 50 条）
      bindingListLoading: false
    };
  },
  computed: {
    /** 桌面版实时读取能力（浏览器 dev 模式无 electronAPI，降级为上传快照） */
    hasExcelApi () {
      return !!(window.electronAPI && window.electronAPI.pickExcelFile &&
        window.electronAPI.readExcelFile && window.electronAPI.statExcelFile);
    },
    /** 表格展示的测量列（截断） */
    measurePreviewCols () {
      const max = this.records.reduce((m, r) => Math.max(m, (r.measures || []).length), 0);
      const cols = [];
      for (let i = 0; i < Math.min(max, MEASURE_PREVIEW_COLS); i++) cols.push(i);
      return cols;
    },
    /**
     * 待绑定码提示：规则码顺带拆段摘要（帮用户确认扫对了码）；
     * 其余内容标注为外部码原样存储（不解析、不校验格式）。
     */
    pendingHint () {
      if (!this.pendingCode) return '';
      const parsed = parseQrContent(this.pendingCode);
      if (parsed.mode === 'rule') {
        const d = parsed.data;
        return '规则码：' + (d.prefix || '') + ' · ' + d.stage.name + ' · ' + d.color.name +
          ' · ' + this.inferYear(d.year) + '-' + pad2(d.monthNum) + '-' + d.day + ' · #' + d.serial;
      }
      if (parsed.mode === 'text') return '历史明文码';
      return '外部码（原样绑定，不解析内容）';
    }
  },
  watch: {
    /** 实时监听开关：关闭暂停轮询；重新打开立即探测一次（尽快感知暂停期间的积压变更） */
    liveOn (on) {
      if (on && this.sourcePath && this.hasExcelApi) {
        this.startPolling();
        this.pollTick();
      } else if (!on) {
        this.stopPolling();
      }
    }
  },
  created () {
    this.loadBindingList();
    this.restoreSource();
  },
  beforeDestroy () {
    this.stopPolling(); // 路由切走清理轮询定时器，避免后台空转
  },
  methods: {
    /* ==================== 数据源管理（实时读取） ==================== */

    /** 选择数据源文件（系统对话框）：记住路径并立即读取，随后进入实时监听 */
    async pickFile () {
      const r = await window.electronAPI.pickExcelFile();
      if (!r || !r.ok) {
        if (r && r.canceled) return; // 用户取消属正常操作，不打扰
        this.$message.error((r && r.error) || '选择文件失败');
        return;
      }
      this.setSource(r.path);
    },
    /** 设定数据源：更新标识与本地记忆，强制重读并启动实时监听 */
    setSource (path) {
      this.sourcePath = path;
      this.sourceKey = path;
      this.sourceName = this.baseName(path);
      this.lastMtime = 0; // 归零强制下一次读取（换文件后旧 mtime 无意义）
      this.sourceErr = '';
      try {
        localStorage.setItem(SOURCE_PATH_KEY, path);
      } catch (e) { /* 存储不可用：仅本次会话记忆路径，不影响功能 */ }
      this.reloadSource(true);
      this.startPolling();
    },
    /** 恢复上次使用的数据源文件（重进页面自动回到实时读取状态） */
    restoreSource () {
      if (!this.hasExcelApi) return;
      let path = '';
      try {
        path = localStorage.getItem(SOURCE_PATH_KEY) || '';
      } catch (e) {
        path = '';
      }
      if (path) this.setSource(path);
    },
    /**
     * 读取数据源文件并解析（manual 为 true 表示用户手动刷新，失败需给出提示）。
     * 设备写入瞬间独占锁定导致的读取失败属暂态：静默等下一轮轮询重试。
     */
    async reloadSource (manual) {
      if (!this.sourcePath || this.reading) return;
      this.reading = true;
      try {
        const r = await window.electronAPI.readExcelFile(this.sourcePath);
        if (!r || !r.ok) {
          if (manual) this.$message.warning((r && r.error) || '读取失败，请稍后重试');
          return; // lastMtime 不更新 → 下一轮轮询自动重试
        }
        this.lastMtime = r.mtimeMs;
        this.applyParsed(r.data, this.sourceName);
      } finally {
        this.reading = false;
      }
    },
    /** 轮询探测：mtime 变化才重读全文件（避免每 3 秒全量 IPC 传输） */
    async pollTick () {
      if (!this.sourcePath || !this.liveOn || this.reading) return;
      let st = null;
      try {
        st = await window.electronAPI.statExcelFile(this.sourcePath);
      } catch (e) {
        st = null;
      }
      if (!st || !st.ok) {
        // stat 不受文件写入锁影响，失败说明文件已被移动/删除：
        // 暂停监听并提示（已读数据保留展示，可重新选择文件恢复）
        this.stopPolling();
        this.sourceErr = (st && st.error) || '无法访问数据源文件，实时监听已暂停';
        return;
      }
      this.sourceErr = '';
      if (st.mtimeMs !== this.lastMtime) this.reloadSource(false);
    },
    startPolling () {
      this.stopPolling();
      // 定时器句柄不进 data：无需响应式，避免 Vue 递归 observe 开销
      this.pollTimer = setInterval(this.pollTick, POLL_INTERVAL);
    },
    stopPolling () {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    /** 浏览器降级：上传文件读为二进制后走同一解析管线（一次性快照，不实时） */
    onFileChange (file) {
      const raw = file.raw;
      if (!raw) return;
      const reader = new FileReader();
      reader.onload = e => {
        // 浏览器拿不到文件路径，以 'upload:文件名' 为数据源标识（同名重传可恢复绑定行标记）
        this.sourceKey = 'upload:' + raw.name;
        this.sourceName = raw.name;
        this.applyParsed(new Uint8Array(e.target.result), raw.name);
      };
      reader.readAsArrayBuffer(raw);
    },
    /**
     * 解析二进制并刷新表格。设备写一半时可能解析失败：保留旧数据等下一轮重试
     * （lastMtime 归零强制重读），不清空表格打断正在进行的绑定操作。
     */
    applyParsed (u8, name) {
      let parsed = null;
      try {
        parsed = parseQcExcel(u8, name);
      } catch (e) {
        this.parseErr = '解析失败：' + ((e && e.message) || '文件格式不支持');
        this.lastMtime = 0; // 读取成功但内容不完整：归零让下一轮轮询强制重读
        return;
      }
      this.parseErr = '';
      this.records = parsed.records;
      this.stats = parsed.stats;
      this.lastRefreshAt = this.nowStr();
      // 数据刷新后按序号重新定位选中行（检测数据通常只追加，前行不变）；
      // 定位不到（记录被替换）则清空，避免把码绑到已不存在的旧行快照
      if (this.selectedRow) {
        const old = this.selectedRow;
        const oldSeq = old.record && old.record.seq;
        let hit = null;
        if (oldSeq !== '' && oldSeq !== undefined) {
          for (let i = 0; i < this.records.length; i++) {
            if (this.records[i].seq === oldSeq) { hit = { record: this.records[i], index: i }; break; }
          }
        } else if (old.index < this.records.length && this.records[old.index].seq === '') {
          hit = { record: this.records[old.index], index: old.index };
        }
        this.selectedRow = hit;
      }
      this.refreshBindings();
    },
    /** 路径取文件名（Windows 与 POSIX 分隔符都兼容） */
    baseName (path) {
      const parts = String(path || '').split(/[\\/]/);
      return parts[parts.length - 1] || path;
    },

    /* ==================== 扫码与绑定 ==================== */

    /** 扫码组件回填：识别成功后填入待绑定码（未确认的旧码直接覆盖，扫码节奏即逐个迭代） */
    onScanCode (code) {
      this.pendingCode = code;
      this.manualCode = '';
    },
    /** 手动输入码值填入待绑定码（扫码不可用降级入口） */
    useManualCode () {
      const code = this.manualCode.trim();
      if (!code) {
        this.$message.warning('请先输入码值');
        return;
      }
      this.pendingCode = code;
      this.manualCode = '';
    },
    /** 表格行点选：记录待绑定行（record 引用 + 下标，确认绑定用） */
    onRowChange (row) {
      this.selectedRow = row ? { record: row, index: this.records.indexOf(row) } : null;
    },
    /**
     * 行标识（绑定 recordKey）：序号优先（人可读、检测数据追加行后仍稳定），
     * 空序号回退行下标。前缀为数据源标识（文件路径），同一文件重开页面绑定标记不丢。
     */
    rowKey (index, record) {
      const seq = record && record.seq;
      return this.sourceKey + ':' + (seq !== '' && seq !== undefined ? 'seq:' + seq : 'idx:' + index);
    },
    /** 行的当前绑定（无返回 null）；按 recordKey 在当前数据源绑定数组中匹配 */
    rowBinding (row) {
      if (!this.sourceKey) return null;
      const key = this.rowKey(this.records.indexOf(row), row);
      for (let i = 0; i < this.bindings.length; i++) {
        if (this.bindings[i].recordKey === key) return this.bindings[i];
      }
      return null;
    },
    /**
     * 确认绑定：一码一行（saveBinding 写入前清理同码与同 recordKey 旧绑定，重绑即覆盖）。
     * 同码已绑定其他行时先确认提示，避免误扫覆盖。
     */
    async confirmBind () {
      const code = this.pendingCode.trim();
      const row = this.selectedRow;
      if (!code) {
        this.$message.warning('请先扫码或输入码值');
        return;
      }
      if (!row) {
        this.$message.warning('请先在表格中点选要绑定的记录行');
        return;
      }
      let old = null;
      try {
        old = await findBindingByCode(code);
      } catch (e) {
        old = null; // 查询失败不阻断：写入端 saveBinding 自会清理同码旧绑定
      }
      const doSave = async () => {
        try {
          await saveBinding({
            code,
            sourceKey: this.sourceKey,
            sourceName: this.sourceName,
            record: row.record,
            recordKey: this.rowKey(row.index, row.record),
            boundAt: this.nowStr()
          });
          this.$message.success('已绑定 ' + this.codePreview(code) + ' → #' + (row.record.seq || row.index + 1));
          this.pendingCode = '';
          this.selectedRow = null;
          this.refreshBindings();
          this.loadBindingList();
        } catch (e) {
          this.$message.warning('绑定失败：' + ((e && e.message) || '未知原因'));
        }
      };
      if (old) {
        this.$confirm('该码已绑定 #' + ((old.record && old.record.seq) || '-') +
          '（数据源「' + (old.sourceName || old.batchFileName || '未命名') + '」），重新绑定将覆盖。', '码已绑定', { type: 'warning' })
          .then(doSave)
          .catch(() => {});
      } else {
        doSave();
      }
    },
    /** 解绑/删除一条绑定：当前数据源的同步刷新行标记，列表刷新 */
    async unbind (binding) {
      if (!binding) return;
      try {
        await deleteBinding(binding.id);
        this.$message.success('已解绑 ' + this.codePreview(binding.code));
        this.refreshBindings();
        this.loadBindingList();
      } catch (e) {
        this.$message.warning('解绑失败：' + ((e && e.message) || '未知原因'));
      }
    },
    /** 刷新当前数据源的绑定数组（行绑定状态标记与统计用） */
    async refreshBindings () {
      if (!this.sourceKey) {
        this.bindings = [];
        return;
      }
      try {
        this.bindings = await findBindingsBySource(this.sourceKey);
      } catch (e) {
        this.bindings = []; // 查询失败降级为无标记，不影响绑定写入
      }
    },
    /** 加载本机绑定列表（最近 50 条，倒序） */
    async loadBindingList () {
      this.bindingListLoading = true;
      try {
        this.bindingList = await listBindings(BINDING_LIST_MAX);
      } catch (e) {
        this.bindingList = [];
      }
      this.bindingListLoading = false;
    },

    /* ==================== 展示辅助 ==================== */

    /** 码值预览：超长截断（表格列宽有限，完整码值在 title 悬浮展示） */
    codePreview (code) {
      const s = String(code || '');
      return s.length > 22 ? s.slice(0, 22) + '…' : s;
    },
    nowStr () {
      const d = new Date();
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
        pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    },
    /** 年份末位 → 推断完整年份（取不超过当前年份且末位匹配者，与查询页口径一致） */
    inferYear (code) {
      const last = Number(code);
      if (isNaN(last)) return '-';
      const cur = new Date().getFullYear();
      for (let y = cur; y > cur - 10; y--) {
        if (y % 10 === last) return String(y);
      }
      return String(2000 + last);
    }
  }
};
</script>

<style lang="less" scoped>
/* ==================== 数据源区 ==================== */
.err-tip {
  margin: 10px 0 0;
  font-size: 13px;
  color: #cf1322;
}

.source-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dev-tip {
  margin-bottom: 12px;
}

.source-path {
  margin: 10px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;

  .path-text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: Consolas, 'Courier New', monospace;
    color: #333;
  }

  .source-meta {
    flex-shrink: 0;
    font-size: 12px;
    color: #999;
  }
}

.stat-cards {
  margin-top: 14px;
  display: flex;
  gap: 12px;
}

.stat-card {
  flex: 1;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  background: #fafafa;

  .num {
    font-size: 22px;
    font-weight: 600;
    color: #333;
  }

  .label {
    margin-top: 2px;
    font-size: 12px;
    color: #999;
  }

  &.ok .num { color: #389e0d; }
  &.ng .num { color: #cf1322; }
  &.bound .num { color: #096dd9; }
}

/* ==================== 绑定操作区 ==================== */
.pending-bar {
  display: flex;
  align-items: center;
  gap: 8px;

  .manual-input {
    width: 320px;
  }
}

.pending-code-box {
  margin-top: 10px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fafafa;

  &.active {
    border-color: #409eff;
    background: #f0f7ff;
  }

  .pending-label {
    font-size: 12px;
    color: #999;
    flex-shrink: 0;
  }

  .pending-code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #333;
    word-break: break-all;
  }

  .pending-hint {
    font-size: 12px;
    color: #888;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .confirm-btn {
    margin-left: auto;
    flex-shrink: 0;
  }

  .clear-btn {
    flex-shrink: 0;
    padding: 0;
  }
}

.bind-tip {
  margin: 8px 0 10px;
  font-size: 13px;
  color: #666;
}

.record-table {
  .txt-ok { color: #389e0d; font-weight: 600; }
  .txt-ng { color: #cf1322; font-weight: 600; }

  .bound-code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 12px;
    color: #096dd9;
  }

  .unbound {
    font-size: 12px;
    color: #bbb;
  }

  .unbind-btn {
    margin-left: 6px;
    padding: 0;
    color: #cf1322;
  }
}

/* ==================== 绑定列表区 ==================== */
.binding-table {
  .txt-ok { color: #389e0d; font-weight: 600; }
  .txt-ng { color: #cf1322; font-weight: 600; }

  .bound-code {
    font-family: Consolas, 'Courier New', monospace;
    font-size: 12px;
    color: #096dd9;
  }

  .unbind-btn {
    padding: 0;
    color: #cf1322;
  }
}

.binding-empty {
  margin: 10px 0 0;
  font-size: 13px;
  color: #999;
  text-align: center;
}
</style>
