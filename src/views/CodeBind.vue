<template>
  <demo-page
    title="扫码绑定"
    description="上传检测数据 Excel（或载入历史批次）后，逐个扫描实物二维码并在表格中点选对应检测记录，确认后建立「码值 ↔ 表格数据」绑定。外部码与本系统规则码均可绑定；绑定关系保存在本机，溯源查询页扫码时优先展示绑定数据。">
    <!-- ==================== 区块 1：上传检测数据 ==================== -->
    <demo-block :index="1" title="上传检测数据"
      description="支持 .xlsx / .xls，与标签生成页共用同一套列识别逻辑（判定/序号/时间/测量列自动识别）。解析结果自动存为本机批次，绑定快照引用该批次。">
      <el-upload drag action="#" accept=".xlsx,.xls" :auto-upload="false" :show-file-list="false"
        :on-change="onFileChange">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将检测设备导出的 Excel 拖到此处，或<em>点击选择</em></div>
      </el-upload>
      <p v-if="parseErr" class="err-tip">{{ parseErr }}</p>

      <div class="batch-bar">
        <el-button size="small" icon="el-icon-folder-opened" @click="openBatchList">历史批次</el-button>
        <span v-if="currentBatchId" class="batch-flag">当前批次：{{ fileName || '未命名' }}（{{ records.length }} 条）</span>
      </div>

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
      description="全部批次的绑定关系按绑定时间倒序（最近 50 条）。绑定存记录快照，来源批次删除后仍可查询展示。">
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
        <el-table-column label="来源批次" min-width="140" show-overflow-tooltip>
          <template slot-scope="s">{{ s.row.batchFileName || '未命名' }}</template>
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

    <!-- ==================== 历史批次弹层 ==================== -->
    <el-dialog title="历史批次（本机留存）" :visible.sync="batchListVisible" width="680px" append-to-body>
      <el-table :data="batchList" size="mini" border v-loading="batchLoading">
        <el-table-column prop="fileName" label="文件名" min-width="160" show-overflow-tooltip></el-table-column>
        <el-table-column prop="model" label="型号" min-width="110" show-overflow-tooltip></el-table-column>
        <el-table-column label="记录" width="60" align="center">
          <template slot-scope="s">{{ s.row.stats ? s.row.stats.total : '-' }}</template>
        </el-table-column>
        <el-table-column prop="importedAt" label="导入时间" width="150"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="s">
            <el-button type="text" size="mini" @click="loadBatch(s.row.id)">载入</el-button>
            <el-button type="text" size="mini" class="batch-del-btn" @click="removeBatch(s.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!batchList.length && !batchLoading" class="batch-empty">暂无历史批次</p>
    </el-dialog>

    <!-- ==================== 摄像头扫码弹层（公共组件） ==================== -->
    <scan-dialog :visible.sync="scanVisible" tip="将待绑定的二维码对准取景框，识别成功后自动填入待绑定码"
      @scan="onScanCode"></scan-dialog>
  </demo-page>
</template>

<script>
/**
 * 扫码绑定页 —— 把「已存在的二维码」与「Excel 表格行」建立绑定关系的路由页
 *
 * 数据流：上传 Excel（qc-excel 与生成页共用解析）→ 批次入库拿 batchId →
 *         摄像头扫码（ScanDialog）或手动输入得到码值（外部码原样存储，规则码顺带拆段提示）
 *         → 表格点选行 → saveBinding 落 IndexedDB（一码一行，重绑覆盖）
 *         → 溯源查询页扫码优先展示绑定记录。
 * 绑定存记录快照（非引用）：来源批次删除后绑定仍可独立查询。
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
  saveBatch, listBatches, getBatch, deleteBatch,
  saveBinding, findBindingByCode, findBindingsByBatch, listBindings, deleteBinding
} from '@/common/qc-db';

// 表格测量列最多展示列数（避免表格过宽）
const MEASURE_PREVIEW_COLS = 3;
// 本机绑定列表最多展示条数
const BINDING_LIST_MAX = 50;

export default {
  name: 'CodeBind',
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      /* ---- 批次数据 ---- */
      fileName: '', // 当前批次文件名
      records: [], // 记录：{ seq, time, judge, measures, ruleCode? }
      stats: null, // 统计：{ total, ok, ng }
      parseErr: '', // 解析错误提示，空串表示无错误
      currentBatchId: null, // 当前批次在本地数据库中的 id（null 表示尚未入库）

      /* ---- 绑定操作 ---- */
      scanVisible: false, // 摄像头扫码弹层
      manualCode: '', // 手动输入码值（扫码不可用降级入口）
      pendingCode: '', // 待绑定码（扫码/输入回填，确认后清空）
      selectedRow: null, // 待绑定行：{ record, index }（表格 current-change 记录）
      bindings: [], // 当前批次的绑定数组（行绑定状态标记用）

      /* ---- 本机绑定列表 ---- */
      bindingList: [], // 最近绑定（倒序，最多 50 条）
      bindingListLoading: false,

      /* ---- 历史批次弹层 ---- */
      batchListVisible: false,
      batchLoading: false,
      batchList: []
    };
  },
  computed: {
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
  created () {
    this.loadBindingList();
  },
  methods: {
    /* ==================== 上传解析与批次管理 ==================== */

    /** 上传组件回调：读取文件为 ArrayBuffer 后交给共享解析管线 */
    onFileChange (file) {
      const raw = file.raw;
      if (!raw) return;
      const reader = new FileReader();
      reader.onload = e => this.parseFile(e.target.result, raw.name);
      reader.readAsArrayBuffer(raw);
    },
    /** 解析并入库为批次（与生成页一致：解析即落库，绑定快照引用该批次） */
    async parseFile (buf, name) {
      let parsed = null;
      try {
        parsed = parseQcExcel(buf, name);
      } catch (e) {
        this.parseErr = '解析失败：' + ((e && e.message) || '文件格式不支持');
        this.stats = null;
        this.records = [];
        return;
      }
      this.parseErr = '';
      this.fileName = parsed.fileName;
      this.records = parsed.records;
      this.stats = parsed.stats;
      this.pendingCode = '';
      this.selectedRow = null;
      // 解析结果入库为批次（失败降级：绑定仍可进行，但重启后不可回看）
      try {
        this.currentBatchId = await saveBatch({
          fileName: parsed.fileName,
          model: parsed.model,
          importedAt: this.nowStr(),
          stats: parsed.stats,
          records: parsed.records
        });
      } catch (e) {
        this.currentBatchId = null;
        this.$message.warning('本机保存批次失败（' + ((e && e.message) || '未知原因') + '），本次仅内存可用');
      }
      this.refreshBindings();
    },
    /** 打开历史批次弹层并加载列表 */
    async openBatchList () {
      this.batchListVisible = true;
      this.batchLoading = true;
      try {
        this.batchList = await listBatches();
      } catch (e) {
        this.batchList = [];
        this.$message.warning('读取历史批次失败：' + ((e && e.message) || '未知原因'));
      }
      this.batchLoading = false;
    },
    /** 载入历史批次：恢复记录明细与该批次的绑定标记 */
    async loadBatch (id) {
      let batch = null;
      try {
        batch = await getBatch(id);
      } catch (e) {
        this.$message.warning('读取批次失败：' + ((e && e.message) || '未知原因'));
        return;
      }
      if (!batch) {
        this.$message.warning('该批次不存在（可能已被删除）');
        this.openBatchList();
        return;
      }
      this.fileName = batch.fileName;
      this.stats = batch.stats;
      this.records = batch.records || [];
      this.currentBatchId = batch.id;
      this.parseErr = '';
      this.pendingCode = '';
      this.selectedRow = null;
      this.batchListVisible = false;
      this.refreshBindings();
      this.$message.success('已载入批次「' + (batch.fileName || '未命名') + '」，可开始扫码绑定');
    },
    /** 删除历史批次（绑定存快照不受影响，仍可查询） */
    removeBatch (id) {
      this.$confirm('确定删除该批次？绑定关系保留（存有记录快照），批次明细删除后不可恢复。', '删除批次', { type: 'warning' })
        .then(async () => {
          try {
            await deleteBatch(id);
            if (this.currentBatchId === id) this.currentBatchId = null;
            this.openBatchList();
          } catch (e) {
            this.$message.warning('删除失败：' + ((e && e.message) || '未知原因'));
          }
        })
        .catch(() => {});
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
     * 行标识（绑定 recordKey）：序号优先（人可读、判定列改选后仍稳定），
     * 空序号回退行下标（批次记录数组原样存取，顺序稳定）。
     */
    rowKey (index, record) {
      const seq = record && record.seq;
      return this.currentBatchId + ':' + (seq !== '' && seq !== undefined ? 'seq:' + seq : 'idx:' + index);
    },
    /** 行的当前绑定（无返回 null）；按 recordKey 在当前批次绑定数组中匹配 */
    rowBinding (row) {
      if (!this.currentBatchId) return null;
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
            batchId: this.currentBatchId,
            batchFileName: this.fileName,
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
          '（批次「' + (old.batchFileName || '未命名') + '」），重新绑定将覆盖。', '码已绑定', { type: 'warning' })
          .then(doSave)
          .catch(() => {});
      } else {
        doSave();
      }
    },
    /** 解绑/删除一条绑定：当前批次的同步刷新行标记，列表刷新 */
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
    /** 刷新当前批次的绑定数组（行绑定状态标记与统计用） */
    async refreshBindings () {
      if (!this.currentBatchId) {
        this.bindings = [];
        return;
      }
      try {
        this.bindings = await findBindingsByBatch(this.currentBatchId);
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
/* ==================== 上传与批次区 ==================== */
.err-tip {
  margin: 10px 0 0;
  font-size: 13px;
  color: #cf1322;
}

.batch-bar {
  margin-top: 12px;
  display: flex;
  align-items: center;
}

.batch-flag {
  margin-left: 10px;
  font-size: 13px;
  color: #666;
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

.binding-empty,
.batch-empty {
  margin: 10px 0 0;
  font-size: 13px;
  color: #999;
  text-align: center;
}

.batch-del-btn {
  margin-left: 8px;
  padding: 0;
  color: #cf1322;
}
</style>
