<template>
  <demo-page
    title="二维码溯源查询"
    description="粘贴/输入或摄像头扫描二维码内容，自动识别两种内容模式（明文文本 / 编码规则）并解析展示质检溯源信息；编码规则码可回查本机批次中的关联检测记录。全程离线、不依赖服务器；查询成功的记录在本机离线留存，可随时回看。">
    <!-- ==================== 区块 1：码值输入 ==================== -->
    <demo-block :index="1" title="码值输入"
      description="支持粘贴含换行的多行明文码与单行编码规则码；可调用摄像头实时扫码，也支持扫码枪（键盘模式）即扫即查。">
      <el-input v-model="inputText" type="textarea" :rows="6" class="code-input"
        placeholder="粘贴或输入二维码内容：明文（型号:/序号:/时间:/判定:/测量:）或编码规则码（如 KBWKV3-3QHYX691400001）"></el-input>
      <div class="action-bar">
        <el-button type="primary" size="small" @click="doQuery">查 询</el-button>
        <el-button type="success" size="small" plain icon="el-icon-camera" @click="openScan">摄像头扫码</el-button>
        <span class="action-tip">扫码枪即扫即查（系统输入法需为英文）；无法识别的内容会给出原因，不会误报为某种模式</span>
      </div>
    </demo-block>

    <!-- ==================== 区块 2：解析结果 ==================== -->
    <demo-block v-if="result" :index="2" title="解析结果">
      <div class="mode-bar">
        <el-tag :type="modeTagType" size="small">{{ modeLabel }}</el-tag>
        <span v-if="result.cached" class="cache-flag">来自本机缓存</span>
        <span v-if="result.mode === 'rule' && result.data.prefixAmbiguous" class="guess-flag">项目/组件为推断结果</span>
      </div>
      <pre class="raw-code">{{ inputText }}</pre>

      <!-- 无法识别：原因 + 保留原始输入 -->
      <div v-if="result.mode === 'unknown'" class="unknown-box">
        <i class="el-icon-warning"></i> {{ result.error }}
      </div>

      <!-- 扫码绑定命中：码值已与本机表格数据绑定，直接展示绑定记录（优先于模式解析） -->
      <template v-else-if="result.mode === 'binding'">
        <div class="record-grid">
          <div class="record-cell"><span class="k">序号</span><span class="v">#{{ bindingRecord.seq || '-' }}</span></div>
          <div class="record-cell"><span class="k">检测时间</span><span class="v">{{ bindingRecord.time || '-' }}</span></div>
          <div class="record-cell">
            <span class="k">判定</span>
            <span class="v" :class="judgeClass">{{ bindingRecord.judge || '-' }}</span>
          </div>
          <div class="record-cell"><span class="k">绑定时间</span><span class="v">{{ result.data.boundAt || '-' }}</span></div>
          <div v-if="bindingRecord.machine" class="record-cell"><span class="k">检测设备</span><span class="v">{{ bindingRecord.machine }}</span></div>
        </div>
        <p class="bind-source">
          数据来源：扫码绑定（数据源「{{ result.data.sourceName || result.data.batchFileName || '未命名' }}」）；
          <router-link to="/bind" class="bind-manage-link">管理绑定</router-link>
        </p>
        <template v-if="bindingRecord.measures && bindingRecord.measures.length">
          <h3 class="sub-title">测量值（{{ bindingRecord.measures.length }}）</h3>
          <div class="measure-grid">
            <div v-for="(mv, i) in bindingRecord.measures" :key="i" class="measure-cell">
              <span class="k">测量 {{ i + 1 }}</span><span class="v">{{ mv === '' ? '-' : mv }}</span>
            </div>
          </div>
        </template>
        <p v-else class="no-measure">无测量值</p>
      </template>

      <!-- 明文文本：记录字段网格 -->
      <template v-else-if="result.mode === 'text'">
        <div class="record-grid">
          <div class="record-cell"><span class="k">型号</span><span class="v">{{ recordData.m || '-' }}</span></div>
          <div class="record-cell"><span class="k">序号</span><span class="v">#{{ recordData.s || '-' }}</span></div>
          <div class="record-cell"><span class="k">检测时间</span><span class="v">{{ recordData.t || '-' }}</span></div>
          <div class="record-cell">
            <span class="k">判定</span>
            <span class="v" :class="judgeClass">{{ recordData.j || '-' }}</span>
          </div>
        </div>
        <template v-if="recordData.v && recordData.v.length">
          <h3 class="sub-title">测量值（{{ recordData.v.length }}）</h3>
          <div class="measure-grid">
            <div v-for="(mv, i) in recordData.v" :key="i" class="measure-cell">
              <span class="k">测量 {{ i + 1 }}</span><span class="v">{{ mv === '' ? '-' : mv }}</span>
            </div>
          </div>
        </template>
        <p v-else class="no-measure">无测量值</p>
      </template>

      <!-- 编码规则：逐段含义表 + 本机批次关联记录回查 -->
      <template v-else-if="result.mode === 'rule'">
        <div class="rule-grid">
          <div v-for="row in ruleRows" :key="row.label" class="rule-cell">
            <span class="k">{{ row.label }}</span><span class="v">{{ row.value }}</span>
          </div>
        </div>
        <div v-if="result.data.prefixAmbiguous" class="prefix-fix">
          <span class="prefix-fix-label">组件名称：</span>
          <el-input v-model="customComponent" size="small" class="prefix-fix-input"
            placeholder="如 中框（需为合并前缀的尾部）"></el-input>
          <el-button size="small" @click="applyCustomComponent">重新拆分</el-button>
        </div>

        <!-- 关联检测记录：按码回查本机批次库（生成端生成时落库的规则码 ↔ 记录关联） -->
        <div v-loading="relatedLoading" class="related-box">
          <h3 class="sub-title">关联检测记录</h3>
          <template v-if="relatedHits && relatedHits.length">
            <div v-for="(hit, i) in relatedHits" :key="i" class="related-item">
              <div class="related-batch">
                <span class="b-file">{{ hit.batch.fileName || '未命名批次' }}</span>
                <span class="b-model">{{ hit.batch.model || '-' }}</span>
                <span class="b-time">导入于 {{ hit.batch.importedAt || '-' }}</span>
              </div>
              <div class="record-grid">
                <div class="record-cell"><span class="k">序号</span><span class="v">#{{ hit.record.seq || '-' }}</span></div>
                <div class="record-cell"><span class="k">检测时间</span><span class="v">{{ hit.record.time || '-' }}</span></div>
                <div class="record-cell">
                  <span class="k">判定</span>
                  <span class="v" :class="hit.record.judge === 'OK' ? 'txt-ok' : 'txt-ng'">{{ hit.record.judge || '-' }}</span>
                </div>
                <div v-if="hit.record.machine" class="record-cell"><span class="k">检测设备</span><span class="v">{{ hit.record.machine }}</span></div>
              </div>
              <template v-if="hit.record.measures && hit.record.measures.length">
                <div class="measure-grid">
                  <div v-for="(mv, mi) in hit.record.measures" :key="mi" class="measure-cell">
                    <span class="k">测量 {{ mi + 1 }}</span><span class="v">{{ mv === '' ? '-' : mv }}</span>
                  </div>
                </div>
              </template>
              <p v-else class="no-measure">无测量值</p>
            </div>
          </template>
          <p v-else-if="relatedHits && !relatedHits.length" class="no-related">
            未找到关联检测记录（标签可能先于数据入库，或生成配置变更后重新生成导致码值已更新）
          </p>
        </div>
      </template>
    </demo-block>

    <!-- ==================== 区块 3：最近查询（本机离线留存） ==================== -->
    <demo-block :index="3" title="最近查询"
      description="扫码与手动查询成功的记录（码值、解析结果、时间）保存在本机，重启应用后仍可直接回看，无需重新解析。">
      <div v-if="history.length" class="history-bar">
        <span class="history-count">共 {{ history.length }} 条（最多保留 20 条）</span>
        <el-button type="danger" size="mini" plain @click="clearHistory">清空历史</el-button>
      </div>
      <ul v-if="history.length" class="history-list">
        <li v-for="h in history" :key="h.text + h.time" class="history-item" @click="openHistory(h)">
          <el-tag :type="historyTagType(h.mode)" size="mini" class="history-mode">{{ historyModeLabel(h.mode) }}</el-tag>
          <span class="history-text">{{ firstLine(h.text) }}</span>
          <span class="history-time">{{ h.time }}</span>
          <i class="el-icon-arrow-right"></i>
        </li>
      </ul>
      <p v-else class="history-empty">暂无查询记录</p>
    </demo-block>

    <!-- ==================== 摄像头扫码弹层（公共组件） ==================== -->
    <scan-dialog :visible.sync="scanVisible" @scan="onScanCode"></scan-dialog>
  </demo-page>
</template>

<script>
/**
 * 二维码溯源查询页 —— 与标签生成页（QcLabel.vue）并列的路由页
 *
 * 数据流：输入/扫码码值 → 优先查本机扫码绑定库（code-bindings，命中直接展示绑定的表格记录）
 *         → 未绑定再 parseQrContent 识别模式（text/rule）→ 展示结构化溯源信息
 *         → 成功解析的记录写入 localStorage（qc-lookup-history，离线缓存，含解析结果）
 * 摄像头扫码走公共组件 ScanDialog（与绑定页共用）。全程纯前端、数据不出本机。
 */
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
import ScanDialog from '@/components/ScanDialog';
import { createScannerGun } from '@/common/scanner-gun';
import { parseQrContent } from '@/common/qr-parse';
import { pad2 } from '@/common/qc-code-rules';
import { findByRuleCode, findBindingByCode } from '@/common/qc-db';

// 查询历史 localStorage 键与容量（设计 D6：最近 20 条，去重置顶）
const HISTORY_KEY = 'qc-lookup-history';
const HISTORY_MAX = 20;

export default {
  name: 'QrLookup',
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      inputText: '', // 码值输入（含换行多行）
      result: null, // 解析结果：{ mode, data | error, cached 是否来自历史缓存 }
      customComponent: '', // 规则码前缀歧义时用户手动指定的组件名称
      relatedHits: null, // 规则码关联记录回查结果：null 未查 / [] 未命中 / 数组命中（多批次全部列出）
      relatedLoading: false, // 关联记录检索中
      history: [], // 查询历史：[{ text, time, mode, data }]，时间倒序
      scanVisible: false // 摄像头扫码弹层
    };
  },
  computed: {
    /** 绑定模式的记录字段（快照结构 { seq, time, judge, measures, machine }） */
    bindingRecord () {
      const d = (this.result && this.result.data) || {};
      const r = d.record || {};
      return {
        seq: r.seq,
        time: r.time,
        judge: r.judge,
        measures: Array.isArray(r.measures) ? r.measures : [],
        // 设备标识：绑定快照顶层（行级值优先整表标识的合成结果）优先，旧绑定回退记录内嵌值
        machine: d.machine || r.machine || ''
      };
    },
    /** 明文模式的记录字段（缺失字段展示 '-'） */
    recordData () {
      const d = (this.result && this.result.data) || {};
      return { m: d.m, s: d.s, t: d.t, j: d.j, v: Array.isArray(d.v) ? d.v : [] };
    },
    /** 判定值着色（明文与绑定两种模式取各自记录的判定） */
    judgeClass () {
      const j = this.result && this.result.mode === 'binding' ? this.bindingRecord.judge : this.recordData.j;
      return j === 'OK' ? 'txt-ok' : (j === 'NG' ? 'txt-ng' : '');
    },
    /** 编码规则逐段含义行 */
    ruleRows () {
      const d = this.result && this.result.data;
      if (!d) return [];
      const prefixText = d.prefixAmbiguous
        ? d.prefix + '（项目+组件合并前缀）'
        : d.project + (d.component ? '（组件：' + d.component + '）' : '');
      return [
        { label: '项目 / 组件', value: prefixText },
        { label: '试制阶段', value: d.stage.code + '（' + d.stage.name + '）' },
        { label: '颜色', value: d.color.code + '（' + d.color.name + '）' },
        { label: '供方', value: d.supplier },
        { label: '原材供方', value: d.raw },
        { label: '阳极供方', value: d.anode },
        { label: '年份', value: d.year + '（末位，推断 ' + this.inferYear(d.year) + '）' },
        { label: '月份', value: d.month + '（' + d.monthNum + ' 月）' },
        { label: '日期', value: d.day + ' 日' },
        { label: '流水号', value: d.serial },
        { label: '完整码值', value: d.code || (d.prefix + (d.stageSegment || d.stage.code) + d.color.code + d.supplier + d.raw + d.anode + d.year + d.month + d.day + d.serial) }
      ];
    },
    /** 结果区模式标签 */
    modeLabel () {
      return this.result ? this.historyModeLabel(this.result.mode) : '';
    },
    modeTagType () {
      return this.result ? this.historyTagType(this.result.mode) : 'info';
    }
  },
  created () {
    this.loadHistory();
  },
  mounted () {
    // 扫码枪（键盘模式）全局监听：页面任意位置扫码即回填查询，与摄像头扫码共用回填逻辑
    this._stopGun = createScannerGun(code => this.onScanCode(code));
  },
  beforeDestroy () {
    if (this._stopGun) this._stopGun();
  },
  methods: {
    /* ==================== 查询与解析 ==================== */

    /**
     * 触发查询：空输入提示不解析。优先查本机扫码绑定库（外部码/规则码都可能已绑定
     * 表格数据，绑定命中直接展示绑定记录）；未绑定再走模式解析。
     * 绑定库查询失败静默降级为解析流程（解析能力不受影响）。
     */
    async doQuery () {
      const text = this.inputText.trim();
      if (!text) {
        this.$message.warning('请先输入或扫描二维码内容');
        return;
      }
      let binding = null;
      try {
        binding = await findBindingByCode(text);
      } catch (e) {
        binding = null;
      }
      if (binding) {
        this.customComponent = '';
        this.relatedHits = null;
        this.result = { mode: 'binding', data: binding, cached: false };
        this.upsertHistory(text, 'binding', binding);
        return;
      }
      const parsed = parseQrContent(text);
      if (parsed.mode === 'unknown') {
        // 无法识别：展示原因并保留原始输入（输入框内容不动）
        this.result = { mode: 'unknown', error: parsed.error, cached: false };
        return;
      }
      this.customComponent = '';
      this.relatedHits = null;
      this.result = { mode: parsed.mode, data: parsed.data, cached: false };
      this.upsertHistory(text, parsed.mode, parsed.data);
      // 编码规则码：拆段展示之外回查本机批次关联记录
      if (parsed.mode === 'rule') this.fetchRelated(parsed.data);
    },

    /** 点击历史条目：优先直接展示缓存结果（无需重新解析），缓存缺失/损坏时回退重新解析 */
    openHistory (item) {
      this.inputText = item.text;
      if ((item.mode === 'text' || item.mode === 'rule' || item.mode === 'binding') &&
        item.data && typeof item.data === 'object') {
        this.customComponent = '';
        this.relatedHits = null;
        this.result = { mode: item.mode, data: item.data, cached: true };
        this.upsertHistory(item.text, item.mode, item.data); // 置顶并刷新时间
        if (item.mode === 'rule') this.fetchRelated(item.data);
        return;
      }
      this.doQuery(); // 缓存不可用 → 回退重新解析
    },

    /**
     * 规则码关联记录回查：按完整码值检索本机批次库
     * （生成端批量生成时落库的「规则码 ↔ 记录」关联，即 Excel 中对应的那条检测数据）。
     * 完整码值优先用解析时保留的原码（d.code）；旧缓存无 code 时按段重组
     * （stageSegment 含「阶段名-」段，缺失时回退纯阶段码，兼容历史数据）。
     * 未命中仅提示（拆段含义始终可用），检索失败静默降级为未查状态。
     */
    async fetchRelated (d) {
      const code = d.code || (d.prefix + (d.stageSegment || d.stage.code) + d.color.code + d.supplier + d.raw + d.anode +
        d.year + d.month + d.day + d.serial);
      this.relatedLoading = true;
      try {
        this.relatedHits = await findByRuleCode(code);
      } catch (e) {
        this.relatedHits = null;
      }
      this.relatedLoading = false;
    },

    /** 规则码前缀歧义：按用户填写的组件名称重新拆分前缀并同步回历史缓存 */
    applyCustomComponent () {
      const comp = this.customComponent.trim();
      const d = this.result && this.result.data;
      if (!comp || !d || !d.prefix || !d.prefix.endsWith(comp) || d.prefix.length <= comp.length) {
        this.$message.warning('组件名称需为合并前缀的尾部子串，且短于前缀本身');
        return;
      }
      d.project = d.prefix.slice(0, d.prefix.length - comp.length);
      d.component = comp;
      d.prefixAmbiguous = false;
      this.upsertHistory(this.inputText.trim(), 'rule', JSON.parse(JSON.stringify(d)));
    },

    /* ==================== 查询历史（localStorage 离线缓存） ==================== */

    loadHistory () {
      try {
        const list = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        this.history = Array.isArray(list) ? list : [];
      } catch (e) {
        this.history = []; // 缓存损坏：当作空列表，不影响查询功能
      }
    },
    persistHistory () {
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
      } catch (e) {
        // 存储不可用（隐私模式/已满）：历史仅本次会话内存可用
      }
    },
    /** 写入/刷新一条历史：同码值去重置顶并刷新时间与结果，最多保留 20 条 */
    upsertHistory (text, mode, data) {
      const list = this.history.filter(h => h.text !== text);
      list.unshift({ text, time: this.nowStr(), mode, data });
      this.history = list.slice(0, HISTORY_MAX);
      this.persistHistory();
    },
    clearHistory () {
      this.$confirm('确定清空全部本机查询记录？', '清空历史', { type: 'warning' })
        .then(() => {
          this.history = [];
          this.persistHistory();
          this.$message.success('已清空查询历史');
        })
        .catch(() => {});
    },
    nowStr () {
      const d = new Date();
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
        pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
    },
    firstLine (text) {
      const line = String(text || '').split(/\r?\n/)[0];
      return line.length > 46 ? line.slice(0, 46) + '…' : line;
    },
    historyModeLabel (mode) {
      return { text: '明文文本', rule: '编码规则', binding: '扫码绑定', unknown: '无法识别' }[mode] || mode;
    },
    historyTagType (mode) {
      return { text: '', rule: 'warning', binding: 'success', unknown: 'danger' }[mode] || 'info';
    },

    /* ==================== 摄像头扫码（公共组件 ScanDialog） ==================== */

    openScan () {
      this.scanVisible = true;
    },
    /** 扫码回填（摄像头/扫码枪共用）：识别成功后回填码值并触发查询 */
    onScanCode (code) {
      this.inputText = code;
      this.doQuery();
    },

    /* ==================== 展示辅助 ==================== */

    /** 年份末位 → 推断完整年份（取不超过当前年份且末位匹配者） */
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
/* ==================== 码值输入区 ==================== */
.code-input {
  margin-bottom: 12px;

  /deep/ textarea {
    font-family: Consolas, monospace;
    font-size: 13px;
  }
}

.action-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.action-tip {
  margin-left: 10px;
  font-size: 12px;
  color: #999;
}

/* ==================== 解析结果区 ==================== */
.mode-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.cache-flag {
  margin-left: 10px;
  font-size: 12px;
  color: #1a7f37;
}

.guess-flag {
  margin-left: 10px;
  font-size: 12px;
  color: #b45309;
}

.raw-code {
  margin: 0 0 14px;
  padding: 10px 12px;
  font-family: Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  color: #595959;
  background: #fafafa;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.unknown-box {
  padding: 14px 16px;
  font-size: 13px;
  color: #cf1322;
  background: #fff1f0;
  border: 1px solid #ffa39e;
  border-radius: 6px;
}

.record-grid {
  display: flex;
  flex-wrap: wrap;
}

.record-cell {
  width: calc(50% - 5px);
  margin-bottom: 10px;
  padding: 12px 14px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-sizing: border-box;

  &:nth-child(odd) {
    margin-right: 10px;
  }

  .k {
    display: block;
    margin-bottom: 4px;
    font-size: 12px;
    color: #999;
  }

  .v {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    word-break: break-all;

    &.txt-ok {
      color: #1a7f37;
    }

    &.txt-ng {
      color: #f5222d;
    }
  }
}

.sub-title {
  margin: 16px 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.measure-grid {
  display: flex;
  flex-wrap: wrap;
}

.measure-cell {
  width: calc(33.33% - 7px);
  margin-right: 10px;
  margin-bottom: 10px;
  padding: 10px 12px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-sizing: border-box;

  &:nth-child(3n) {
    margin-right: 0;
  }

  .k {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    color: #999;
  }

  .v {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    word-break: break-all;
  }
}

.no-measure {
  margin: 10px 0 0;
  font-size: 13px;
  color: #999;
}

.rule-grid {
  display: flex;
  flex-wrap: wrap;
}

.rule-cell {
  width: calc(50% - 5px);
  margin-bottom: 10px;
  padding: 10px 12px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-sizing: border-box;

  &:nth-child(odd) {
    margin-right: 10px;
  }

  .k {
    display: block;
    margin-bottom: 2px;
    font-size: 12px;
    color: #999;
  }

  .v {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    word-break: break-all;
  }
}

.prefix-fix {
  display: flex;
  align-items: center;
  margin-top: 12px;
  padding: 10px 12px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 6px;
}

.prefix-fix-label {
  font-size: 13px;
  color: #874d00;
  white-space: nowrap;
}

.prefix-fix-input {
  width: 220px;
  margin: 0 8px;
}

/* ==================== 规则码关联记录区 ==================== */
.related-box {
  margin-top: 16px;
  min-height: 40px;
}

.related-item {
  margin-bottom: 12px;
  padding: 12px 14px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
}

.related-batch {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #666;

  .b-file {
    font-weight: 600;
    color: #333;
    word-break: break-all;
  }
}

.no-related {
  margin: 8px 0 0;
  font-size: 13px;
  color: #999;
}

/* ==================== 最近查询区 ==================== */
.history-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-count {
  font-size: 12px;
  color: #999;
}

.history-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }
}

.history-mode {
  flex-shrink: 0;
  margin-right: 10px;
}

.history-text {
  flex: 1;
  overflow: hidden;
  margin-right: 10px;
  color: #333;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: Consolas, monospace;
}

.history-time {
  flex-shrink: 0;
  margin-right: 6px;
  font-size: 12px;
  color: #999;
}

.history-empty {
  margin: 0;
  padding: 16px 0;
  font-size: 13px;
  color: #999;
  text-align: center;
}

/* ==================== 绑定来源提示 ==================== */
.bind-source {
  margin: 10px 0 0;
  font-size: 13px;
  color: #666;
}

.bind-manage-link {
  color: #409eff;
}
</style>
