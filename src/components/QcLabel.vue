<template>
  <demo-page
    title="质检二维码标签生成器"
    description="检测设备导出的 Excel → 合格品二维码标签：SheetJS 纯前端解析（数据不出本机），自动识别判定/序号/时间/测量列，筛出 OK 记录一物一码生成二维码，按标签纸规格排版后调起浏览器打印（也可另存为 PDF）。">
    <!-- ==================== 区块 1：上传检测数据 ==================== -->
    <demo-block
      :index="1"
      title="上传检测数据"
      description="支持 .xlsx / .xls。自动按「列中 OK/NG 占比」定位判定列，向左找序号列与时间列，向右收集测量列。">

      <!-- 拖拽 / 点击上传区 -->
      <el-upload drag action="#" accept=".xlsx,.xls" :auto-upload="false" :show-file-list="false"
        :on-change="onFileChange">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将检测设备导出的 Excel 拖到此处，或<em>点击选择</em></div>
      </el-upload>

      <!-- 解析 / 生成失败提示 -->
      <p v-if="parseErr" class="err-tip">{{ parseErr }}</p>

      <!-- 解析结果：统计卡片 → 列映射 → 数据预览 -->
      <div v-if="stats" class="result-wrap">
        <!-- 检测记录统计：总数 / OK / NG -->
        <div class="stat-cards">
          <div class="stat-card"><span class="num">{{ stats.total }}</span><span class="label">检测记录</span></div>
          <div class="stat-card ok"><span class="num">{{ stats.ok }}</span><span class="label">OK 合格</span></div>
          <div class="stat-card ng"><span class="num">{{ stats.ng }}</span><span class="label">NG 不合格</span></div>
        </div>

        <!-- 列映射：判定列可手动改选，改后自动重识别其余列 -->
        <div class="mapping-bar">
          <span>判定列：</span>
          <el-select v-model="judgeCol" size="small" class="col-select" @change="reDetect">
            <el-option v-for="o in colOptions" :key="o.value" :label="o.label" :value="o.value"></el-option>
          </el-select>
          <span class="mapping-info">
            序号列{{ seqCol >= 0 ? '第' + (seqCol + 1) + '列' : '未识别' }} ·
            时间列{{ timeCol >= 0 ? '第' + (timeCol + 1) + '列' : '未识别' }} ·
            测量列 {{ measureCols.length }} 项
          </span>
        </div>

        <!-- 前 5 条记录预览（测量列最多展示 4 列） -->
        <el-table :data="previewRows" size="mini" border class="preview-table">
          <el-table-column prop="seq" label="序号" width="70"></el-table-column>
          <el-table-column prop="time" label="检测时间" width="170"></el-table-column>
          <el-table-column prop="judge" label="判定" width="70">
            <template slot-scope="s"><span :class="s.row.judge === 'OK' ? 'txt-ok' : 'txt-ng'">{{ s.row.judge }}</span></template>
          </el-table-column>
          <el-table-column v-for="(m, i) in measurePreviewCols" :key="i" :label="'测量' + (i + 1)" width="90">
            <template slot-scope="s">{{ s.row.measures[i] }}</template>
          </el-table-column>
        </el-table>
      </div>
    </demo-block>

    <!-- ==================== 区块 2：生成二维码标签 ==================== -->
    <demo-block
      :index="2"
      title="生成二维码标签"
      description="每条 OK 记录一个二维码（一物一码），扫码可读出型号、序号、检测时间与全部测量值；标签明文印序号供人工核对防错贴。微信已不展示纯文本码内容，需微信扫码查看请选「网页链接」模式。">

      <!-- 操作栏：产品型号 / 标签规格 / 生成 / 打印 -->
      <div class="opt-bar">
        <span class="opt-label">产品型号</span>
        <el-input v-model="model" size="small" class="model-input" placeholder="如 25512-PRO款中框"></el-input>
        <span class="opt-label">标签规格</span>
        <el-select v-model="spec" size="small" class="spec-select">
          <el-option v-for="s in specOptions" :key="s.value" :label="s.label" :value="s.value"></el-option>
        </el-select>
        <el-button type="primary" size="small" :loading="generating" :disabled="!okRecords.length" @click="generateAll">
          {{ generating ? '生成中 ' + progress + '%' : '生成标签（' + okRecords.length + ' 个）' }}
        </el-button>
        <el-button type="success" size="small" :disabled="!qrReady" @click="printLabels">打印 / 导出 PDF</el-button>
      </div>
      <!-- 二维码内容模式：微信已不展示纯文本码内容，需微信扫码查看时选「网页链接」 -->
      <div class="qr-mode-bar">
        <span class="opt-label">二维码内容</span>
        <el-radio-group v-model="qrMode" size="small">
          <el-radio label="text">明文文本</el-radio>
          <el-radio label="url">网页链接（微信扫码可查看）</el-radio>
        </el-radio-group>
        <el-input v-if="qrMode === 'url'" v-model="viewUrl" size="small" class="view-url-input"
          placeholder="展示页地址，如 https://your-host/qr-view.html"></el-input>
      </div>
      <!-- 生成进度 + 就绪提示 -->
      <el-progress v-if="generating" :percentage="progress" class="gen-progress"></el-progress>
      <p v-if="qrReady" class="ready-tip">已生成 {{ okRecords.length }} 个二维码，点击「打印 / 导出 PDF」后在打印对话框中选择标签打印机，或选择「另存为 PDF」。</p>

      <!-- 二维码预览卡片（全部已生成，此处仅展示前 12 个） -->
      <div v-if="cards.length" class="card-grid">
        <div v-for="c in cards" :key="c.seq" class="label-card">
          <span class="card-seq">#{{ c.seq }}</span>
          <img :src="c.url" class="card-img" alt="二维码">
        </div>
      </div>
    </demo-block>
  </demo-page>
</template>

<script>
/**
 * 质检二维码标签生成器 —— 主页面
 *
 * 数据流：Excel 文件 → SheetJS 解析为二维数组 rows → 自动识别列（判定/序号/时间/测量）
 *        → 结构化 records → 筛出 OK 记录逐条生成二维码（缓存于 qrStore）
 *        → 按标签规格拼装打印 HTML → 隐藏 iframe 调起系统打印
 * 全程纯前端处理，检测数据不出本机。
 */
import XLSX from 'xlsx';
import QRCode from 'qrcode';
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

/* ==================== 常量配置 ==================== */
// 数字补零：9 -> '09'（时间格式化用）
const pad2 = n => (n < 10 ? '0' + n : '' + n);
// 预览表格最多显示的记录条数 / 测量列数
const PREVIEW_ROW_COUNT = 5;
const PREVIEW_MEASURE_COLS = 4;
// 二维码预览卡片数量（全部生成，界面仅预览前 N 个）
const CARD_PREVIEW_COUNT = 12;
// A4 排版每页标签数（3 列 × 8 行）
const A4_LABELS_PER_PAGE = 24;
// 批量生成分批大小：每生成 N 个刷新一次进度并让出主线程
const GEN_BATCH_SIZE = 20;
// 标签纸规格表：页面宽高与二维码尺寸（mm）；A4 / 小票纸排版走独立分支不在此表
const LABEL_SPECS = {
  '50x40': { w: 50, h: 40, qr: 30 },
  '40x30': { w: 40, h: 30, qr: 22 },
  '38x38': { w: 38, h: 38, qr: 28 },
  // 不干胶标签机：38×38mm 一枚的背胶标签卷，每枚一页、纯二维码 35mm 居中、四边各留 1.5mm（无序号文字）
  '38x38p': { w: 38, h: 38, qr: 35, plain: true }
};
// 小票纸（热敏连续纸）规格表：纸卷宽度与二维码尺寸（mm），页高不限、随内容连续走纸；
// 排版为「一行多个纯二维码密集平铺」，无明文文字（参考热敏小票纸实拍样式）
const RECEIPT_SPECS = {
  'receipt80': { w: 80, qr: 7, gap: 1 },
  'receipt58': { w: 58, qr: 5.5, gap: 0.8 },
  'receipt38': { w: 38, qr: 8, gap: 1 } // 38mm 窄卷纸：一行 4 个 8mm 码
};

export default {
  name: 'QcLabel',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      /* ---- Excel 解析结果 ---- */
      rows: [], // 原始二维数组（sheet_to_json header:1），rows[行][列]
      fileName: '', // 当前上传的文件名
      parseErr: '', // 解析/生成/打印错误提示，空串表示无错误

      /* ---- 列映射（列索引，-1 表示未识别）---- */
      judgeCol: -1, // 判定列（OK/NG）
      seqCol: -1, // 序号列
      timeCol: -1, // 检测时间列
      measureCols: [], // 测量值列索引数组

      /* ---- 结构化数据 ---- */
      records: [], // 记录：{ seq 序号, time 时间, judge 判定, measures 测量值[] }
      stats: null, // 统计：{ total 总数, ok 合格, ng 不合格 }

      /* ---- 标签生成选项 ---- */
      model: '', // 产品型号（默认从文件名猜测，可手动修改）
      spec: '50x40', // 当前标签规格
      specOptions: [ // 规格下拉选项（默认项排第一）
        { value: '50x40', label: '50×40mm（每页 1 个）' },
        { value: '40x30', label: '40×30mm（每页 1 个）' },
        { value: '38x38', label: '38×38mm（每页 1 个）' },
        { value: '38x38p', label: '38×38mm 不干胶（35mm 码居中）' },
        { value: 'a4', label: 'A4 排版（每页 24 个带裁切线）' },
        { value: 'receipt80', label: '小票纸 80mm（连续密集排列）' },
        { value: 'receipt58', label: '小票纸 58mm（连续密集排列）' },
        { value: 'receipt38', label: '小票纸 38mm（连续密集排列）' }
      ],
      qrMode: 'text', // 二维码内容模式：text 明文文本 / url 网页链接（微信扫码打开展示页）
      viewUrl: '', // url 模式的展示页地址（static/qr-view.html 部署后的 http 地址）

      /* ---- 生成状态 ---- */
      generating: false, // 是否正在批量生成二维码
      progress: 0, // 生成进度（百分比）
      qrReady: false, // 二维码是否全部就绪（打印按钮开关）
      cards: [] // 预览卡片：{ seq, url(dataURL) }
    };
  },
  created () {
    // 二维码缓存（故意不放 data：非响应式，避免上千条记录的 defineProperty 开销）
    this.qrStore = {};
  },
  computed: {
    /** 合格记录（仅 OK 参与二维码生成） */
    okRecords () {
      return this.records.filter(r => r.judge === 'OK');
    },
    /** 判定列下拉选项：每列取一个非空样例值展示，便于人工选列 */
    colOptions () {
      const maxCol = this.rows.reduce((m, r) => Math.max(m, r.length), 0);
      const opts = [];
      for (let c = 0; c < maxCol; c++) {
        const sampleRow = this.rows.find(r => r[c] !== null && r[c] !== undefined && String(r[c]).trim() !== '');
        const sample = sampleRow ? String(sampleRow[c]).slice(0, 10) : '空列';
        opts.push({ value: c, label: '第' + (c + 1) + '列 · ' + sample });
      }
      return opts;
    },
    /** 预览表格展示的测量列（截断，避免表格过宽） */
    measurePreviewCols () {
      return this.measureCols.slice(0, PREVIEW_MEASURE_COLS);
    },
    /** 预览表格数据（前 N 条） */
    previewRows () {
      return this.records.slice(0, PREVIEW_ROW_COUNT);
    },
    /** 当前标签纸规格尺寸；A4 / 小票纸排版返回 null（走独立排版分支） */
    currentSpec () {
      return LABEL_SPECS[this.spec] || null;
    }
  },
  methods: {
    /* ==================== 文件上传与解析 ==================== */

    /** 上传组件回调：读取文件为 ArrayBuffer 后交给 SheetJS 解析 */
    onFileChange (file) {
      const raw = file.raw;
      if (!raw) return;
      const reader = new FileReader();
      reader.onload = e => this.parseWorkbook(e.target.result, raw.name);
      reader.readAsArrayBuffer(raw);
    },
    /** 解析工作簿：取第一个 Sheet 转二维数组，猜测型号后进入列自动识别 */
    parseWorkbook (buf, name) {
      try {
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        this.rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
        this.fileName = name;
        this.model = this.guessModel(name);
        // 新文件：清空上一次的生成结果
        this.qrReady = false;
        this.cards = [];
        this.parseErr = '';
        this.autoDetect();
      } catch (e) {
        this.parseErr = '解析失败：' + (e && e.message ? e.message : '文件格式不支持');
        this.stats = null;
      }
    },
    /** 从文件名猜测产品型号：去扩展名 → 去导出时间戳（_2026_9_8 16_26_48）→ 去尾部日期（-3-28） */
    guessModel (name) {
      return name.replace(/\.[^.]+$/, '')
        .replace(/[-_ ]?\d{4}[_ ]\d.*$/, '')
        .replace(/[-_]\d{1,2}[-_]\d{1,2}$/, '');
    },
    /* ==================== 列自动识别 ==================== */

    /**
     * 自动识别判定列：统计每列中 OK/NG 值的个数，取最多的一列。
     * 有效判定值不足 3 个则认为不是检测设备导出的数据。
     */
    autoDetect () {
      const rows = this.rows;
      const maxCol = rows.reduce((m, r) => Math.max(m, r.length), 0);
      let judgeCol = -1;
      let judgeCount = 0;
      for (let c = 0; c < maxCol; c++) {
        let n = 0;
        rows.forEach(r => {
          const v = r[c];
          if (v !== null && v !== undefined && /^(ok|ng)$/i.test(String(v).trim())) n++;
        });
        if (n > judgeCount) {
          judgeCount = n;
          judgeCol = c;
        }
      }
      if (judgeCol < 0 || judgeCount < 3) {
        this.parseErr = '未找到判定列（OK/NG），请确认这是检测设备导出的数据';
        this.stats = null;
        return;
      }
      this.judgeCol = judgeCol;
      this.detectOthers();
    },
    /** 判定列手动改选后触发：基于新判定列重新识别其余列 */
    reDetect () {
      this.detectOthers();
    },
    /**
     * 以判定列为锚点识别其余列：
     *   时间列 —— 判定列左侧，Date 类型占比 > 50%（取最靠近判定列的命中者）
     *   序号列 —— 判定列左侧（跳过时间列），数值且递增比例 > 80%
     *   测量列 —— 判定列右侧，数值占比 > 80%（全部收集）
     */
    detectOthers () {
      const rows = this.rows;
      const judgeCol = this.judgeCol;
      // 只统计判定列有效的行，排除表头/汇总行等噪声
      const recRows = rows.filter(r => {
        const v = r[judgeCol];
        return v !== null && v !== undefined && /^(ok|ng)$/i.test(String(v).trim());
      });
      const maxCol = rows.reduce((m, r) => Math.max(m, r.length), 0);

      // 时间列：判定列左侧 Date 占比高的列
      let timeCol = -1;
      for (let c = judgeCol - 1; c >= 0; c--) {
        let total = 0;
        let dates = 0;
        recRows.forEach(r => {
          const v = r[c];
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            total++;
            if (v instanceof Date) dates++;
          }
        });
        if (total > recRows.length * 0.5 && dates > total * 0.5) {
          timeCol = c;
          break;
        }
      }

      // 序号列：判定列左侧（跳过时间列）数值且递增
      let seqCol = -1;
      for (let c = judgeCol - 1; c >= 0; c--) {
        if (c === timeCol) continue;
        let nums = 0;
        let inc = 0;
        let pairs = 0;
        let prev = null;
        recRows.forEach(r => {
          const v = r[c];
          if (v !== null && v !== undefined && v !== '' && !isNaN(Number(v))) {
            nums++;
            const n = Number(v);
            if (prev !== null) {
              pairs++;
              if (n > prev) inc++;
            }
            prev = n;
          }
        });
        if (nums > recRows.length * 0.5 && pairs > 0 && inc / pairs > 0.8) {
          seqCol = c;
          break;
        }
      }

      // 测量列：判定列右侧数值占比 > 80%
      const measureCols = [];
      for (let c = judgeCol + 1; c < maxCol; c++) {
        let total = 0;
        let nums = 0;
        recRows.forEach(r => {
          const v = r[c];
          if (v !== null && v !== undefined && String(v).trim() !== '') {
            total++;
            if (v !== '' && !isNaN(Number(v))) nums++;
          }
        });
        if (total > recRows.length * 0.5 && nums > total * 0.8) measureCols.push(c);
      }

      this.timeCol = timeCol;
      this.seqCol = seqCol;
      this.measureCols = measureCols;
      this.buildRecords();
    },
    /* ==================== 记录构建与格式化 ==================== */

    /** 按列映射把原始行转为结构化记录，并汇总统计数字 */
    buildRecords () {
      const records = [];
      this.rows.forEach(r => {
        const v = r[this.judgeCol];
        if (v === null || v === undefined) return;
        const judge = String(v).trim().toUpperCase();
        if (judge !== 'OK' && judge !== 'NG') return; // 跳过表头/噪声行
        // 序号：去掉 Excel 数值化带来的尾部 .0
        let seq = '';
        if (this.seqCol >= 0) {
          const sv = r[this.seqCol];
          seq = sv === null || sv === undefined ? '' : String(sv).replace(/\.0+$/, '');
        }
        const time = this.timeCol >= 0 ? this.formatTime(r[this.timeCol]) : '';
        const measures = this.measureCols.map(c => this.formatVal(r[c]));
        records.push({ seq, time, judge, measures });
      });
      this.records = records;
      const ok = records.filter(r => r.judge === 'OK').length;
      this.stats = { total: records.length, ok, ng: records.length - ok };
    },
    /** 时间格式化为 'YYYY-MM-DD HH:mm:ss'，兼容 Date 对象与 Excel 日期序列号 */
    formatTime (v) {
      if (v instanceof Date) {
        return v.getFullYear() + '-' + pad2(v.getMonth() + 1) + '-' + pad2(v.getDate()) + ' ' +
          pad2(v.getHours()) + ':' + pad2(v.getMinutes()) + ':' + pad2(v.getSeconds());
      }
      if (typeof v === 'number') {
        const d = XLSX.SSF.parse_date_code(v);
        if (d) {
          return d.y + '-' + pad2(d.m) + '-' + pad2(d.d) + ' ' + pad2(d.H) + ':' + pad2(d.M) + ':' + pad2(d.S);
        }
      }
      return v === null || v === undefined ? '' : String(v);
    },
    /** 测量值格式化：数值统一保留 3 位小数，非数值原样输出 */
    formatVal (v) {
      if (v === null || v === undefined || v === '') return '';
      const n = Number(v);
      return isNaN(n) ? String(v) : n.toFixed(3);
    },

    /* ==================== 二维码生成 ==================== */

    /**
     * 组装二维码内容：
     *   text 模式 —— 明文：型号 / 序号 / 时间 / 判定 / 全部测量值
     *     （注意：微信已不展示纯文本码内容，仅其他扫码 App 可读）
     *   url  模式 —— 展示页链接，记录数据以 base64url 编码放在 # 之后
     *     （hash 不会发送到服务器，数据仍不落库；微信扫码直接打开网页展示）
     */
    buildQrText (r) {
      if (this.qrMode === 'url') {
        return this.viewUrl.trim().replace(/#.*$/, '') + '#' + this.encodeRecord(r);
      }
      return '型号:' + this.model + '\n序号:' + r.seq + '\n时间:' + r.time + '\n判定:' + r.judge +
        (r.measures.length ? '\n测量:' + r.measures.join(',') : '');
    },
    /** 记录 → 紧凑 JSON → UTF-8 字节 → base64url（URL 安全、去填充），供展示页解码 */
    encodeRecord (r) {
      const json = JSON.stringify({ m: this.model, s: r.seq, t: r.time, j: r.judge, v: r.measures });
      const bin = String.fromCharCode.apply(null, new TextEncoder().encode(json));
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    },
    /**
     * 批量生成全部 OK 记录的二维码。
     * 分批 + setTimeout 让出主线程：上千条记录时进度条仍能刷新、界面不卡死。
     */
    async generateAll () {
      const list = this.okRecords;
      if (!list.length) return;
      // 链接模式必须先填展示页地址，否则生成的码扫码后无法打开
      if (this.qrMode === 'url' && !/^https?:\/\/\S+/i.test(this.viewUrl.trim())) {
        this.parseErr = '请先填写以 http(s):// 开头的展示页地址（static/qr-view.html 部署后的地址）';
        return;
      }
      this.generating = true;
      this.progress = 0;
      this.qrReady = false;
      this.qrStore = {};
      const total = list.length;
      for (let i = 0; i < total; i++) {
        const r = list[i];
        try {
          this.qrStore[r.seq] = await QRCode.toDataURL(this.buildQrText(r), {
            width: 400, margin: 1, errorCorrectionLevel: 'M'
          });
        } catch (e) {
          this.parseErr = '第 ' + r.seq + ' 条生成失败：' + e.message;
          this.generating = false;
          return;
        }
        if (i % GEN_BATCH_SIZE === GEN_BATCH_SIZE - 1) {
          this.progress = Math.round((i + 1) / total * 100);
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      this.progress = 100;
      // 全部生成完毕，仅预览前 N 个卡片
      this.cards = list.slice(0, CARD_PREVIEW_COUNT).map(r => ({ seq: r.seq, url: this.qrStore[r.seq] }));
      this.qrReady = true;
      this.generating = false;
    },

    /* ==================== 打印输出 ==================== */

    /** HTML 转义，防止记录值破坏打印页结构 */
    escapeHtml (s) {
      return String(s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
      ));
    },
    /**
     * 按当前规格拼装打印页 HTML（独立文档，@page 尺寸声明才能生效）：
     *   标签纸规格 —— 每页 1 个：二维码 + 明文序号
     *   小票纸规格 —— 连续纸：一行多个纯二维码密集平铺，无明文
     *   A4 排版   —— 每页 3 列 × 8 行 = 24 个，带边框裁切线，附时间/型号
     */
    buildPrintHtml () {
      const list = this.okRecords;
      const esc = this.escapeHtml;
      // ---- 分支 1：标签纸规格（每页 1 个）----
      if (this.currentSpec) {
        const { w, h, qr, plain } = this.currentSpec;
        const labels = list.map(r =>
          '<div class="label"><img src="' + this.qrStore[r.seq] + '" alt="">' + (plain ? '' : '<div class="seq">#' + esc(r.seq) + '</div>') + '</div>'
        ).join('');
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>质检标签</title><style>' +
          '@page{size:' + w + 'mm ' + h + 'mm;margin:0}' +
          'html,body{margin:0;padding:0}' +
          '.label{width:' + w + 'mm;height:' + h + 'mm;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;page-break-after:always}' +
          '.label:last-child{page-break-after:auto}' +
          '.label img{width:' + qr + 'mm;height:' + qr + 'mm}' +
          '.seq{font-family:Arial,sans-serif;font-weight:bold;font-size:11pt;margin-top:1mm}' +
          '</style></head><body>' + labels + '</body></html>';
      }
      // ---- 分支 2：小票纸连续排版（热敏纸：纯二维码密集平铺，高度随内容连续走纸）----
      const rc = RECEIPT_SPECS[this.spec];
      if (rc) {
        const { w, qr, gap } = rc;
        const cells = list.map(r => '<div class="c"><img src="' + this.qrStore[r.seq] + '" alt=""></div>').join('');
        return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>质检标签</title><style>' +
          // 「宽度 + auto 高度」为 Chromium 小票打印惯用写法：宽度固定，高度随内容连续走纸
          '@page{size:' + w + 'mm auto;margin:0}' +
          'html,body{margin:0;padding:0;width:' + w + 'mm;max-width:' + w + 'mm}' +
          // font-size:0 消除 inline-block 换行空隙，间距全部由 margin（mm）精确控制
          'body{box-sizing:border-box;padding:' + (gap / 2) + 'mm;font-size:0}' +
          '.c{display:inline-block;width:' + qr + 'mm;height:' + qr + 'mm;margin:' + (gap / 2) + 'mm;vertical-align:top}' +
          '.c img{width:100%;height:100%;display:block}' +
          '</style></head><body>' + cells + '</body></html>';
      }
      // ---- 分支 3：A4 排版（每页 24 个带裁切线）----
      const pages = [];
      for (let i = 0; i < list.length; i += A4_LABELS_PER_PAGE) pages.push(list.slice(i, i + A4_LABELS_PER_PAGE));
      const pageHtml = pages.map(recs =>
        '<div class="page">' + recs.map(r =>
          '<div class="label">' +
          '<img src="' + this.qrStore[r.seq] + '" alt="">' +
          '<div class="info">' +
          '<div class="line1"><span class="seq">#' + esc(r.seq) + '</span><span class="ok">OK</span></div>' +
          '<div class="date">' + esc(r.time) + '</div>' +
          '<div class="model">' + esc(this.model) + '</div>' +
          '</div></div>'
        ).join('') + '</div>'
      ).join('');
      return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>质检标签</title><style>' +
        '@page{size:A4;margin:8mm}' +
        'html,body{margin:0;padding:0}' +
        '.page{display:flex;flex-wrap:wrap;align-content:flex-start;width:194mm;height:281mm;page-break-after:always}' +
        '.page:last-child{page-break-after:auto}' +
        '.label{width:64.6mm;height:35.1mm;box-sizing:border-box;border:0.3mm solid #bbb;display:flex;align-items:center;padding:2mm;page-break-inside:avoid}' +
        '.label img{width:24mm;height:24mm;flex:none}' +
        '.info{margin-left:3mm;font-family:"Microsoft YaHei",Arial,sans-serif;min-width:0}' +
        '.line1{display:flex;align-items:center}' +
        '.seq{font-size:13pt;font-weight:bold}' +
        '.ok{font-size:10pt;font-weight:bold;color:#1a7f37;margin-left:3mm}' +
        '.date{font-size:8pt;color:#333;margin-top:1mm;word-break:break-all}' +
        '.model{font-size:7pt;color:#666;margin-top:1mm;word-break:break-all}' +
        '</style></head><body>' + pageHtml + '</body></html>';
    },
    /**
     * 调起系统打印：打印 HTML 写入隐藏 iframe（独立文档，@page 声明才能生效），
     * 待二维码图片加载后触发 print()，打印对话框关闭后延迟清理 iframe。
     */
    printLabels () {
      if (!this.qrReady) return;
      const html = this.buildPrintHtml();
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();
      const self = this;
      const doPrint = () => {
        // 留 400ms 等待二维码图片（dataURL）解码完成
        setTimeout(() => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (e) {
            self.parseErr = '打印失败：' + e.message;
          }
          // 延迟 60s 移除 iframe，留足用户在打印对话框中操作的时间
          setTimeout(() => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          }, 60000);
        }, 400);
      };
      if (doc.readyState === 'complete') doPrint();
      else iframe.onload = doPrint;
    }
  }
};
</script>

<style lang="less" scoped>
/* ==================== 上传区 ==================== */
// 上传拖拽区撑满卡片宽度（Element 默认固定 360px 宽，在卡片里显得局促）
/deep/ .el-upload,
/deep/ .el-upload-dragger {
  width: 100%;
}

.err-tip {
  margin-top: 12px;
  font-size: 13px;
  color: #f5222d;
}

/* ==================== 解析结果区 ==================== */
.result-wrap {
  margin-top: 20px;
}

// 统计卡片：总数 / OK（绿）/ NG（红）
.stat-cards {
  display: flex;
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 18px 0;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;

  .num {
    font-size: 26px;
    font-weight: 600;
    color: #333;
  }

  .label {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }

  &.ok .num {
    color: #1a7f37;
  }

  &.ng .num {
    color: #f5222d;
  }
}

// 列映射条：判定列下拉 + 识别结果说明
.mapping-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
  font-size: 13px;
  color: #666;

  .col-select {
    width: 200px;
  }

  .mapping-info {
    color: #999;
  }
}

// 数据预览表：判定值着色（OK 绿 / NG 红）
.preview-table {
  .txt-ok {
    color: #1a7f37;
    font-weight: 600;
  }

  .txt-ng {
    color: #f5222d;
    font-weight: 600;
  }
}

/* ==================== 标签生成区 ==================== */
// 操作栏：型号输入 + 规格选择 + 生成/打印按钮
.opt-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;

  .opt-label {
    font-size: 13px;
    color: #666;
  }

  .model-input {
    width: 200px;
  }

  .spec-select {
    width: 220px;
  }
}

// 二维码内容模式行：明文 / 网页链接切换，链接模式下展示地址输入
.qr-mode-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;

  .opt-label {
    font-size: 13px;
    color: #666;
  }

  .view-url-input {
    width: 340px;
  }
}

.gen-progress {
  margin-top: 14px;
}

.ready-tip {
  margin-top: 12px;
  font-size: 13px;
  color: #1a7f37;
}

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

// 二维码预览卡片：左上角悬浮序号 + 居中二维码图
.label-card {
  position: relative;
  width: 132px;
  padding: 12px 8px;
  text-align: center;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 6px;

  .card-seq {
    position: absolute;
    top: 4px;
    left: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }

  .card-img {
    display: block;
    width: 104px;
    height: 104px;
    margin: 0 auto;
  }
}
</style>
