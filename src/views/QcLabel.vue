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

      <!-- 历史批次：本机 IndexedDB 留存的导入批次，可载入恢复 / 删除 -->
      <div class="batch-bar">
        <el-button size="small" icon="el-icon-folder-opened" @click="openBatchList">历史批次</el-button>
        <span v-if="currentBatchId" class="batch-flag">当前批次已存本机，解析与生成改动自动同步</span>
      </div>

      <!-- 解析结果：统计卡片 → 列映射 → 数据预览 -->
      <div v-if="stats" class="result-wrap">
        <!-- 检测记录统计：总数 / OK / NG -->
        <div class="stat-cards">
          <div class="stat-card"><span class="num">{{ stats.total }}</span><span class="label">检测记录</span></div>
          <div class="stat-card ok"><span class="num">{{ stats.ok }}</span><span class="label">OK 合格</span></div>
          <div class="stat-card ng"><span class="num">{{ stats.ng }}</span><span class="label">NG 不合格</span></div>
        </div>

        <!-- 列映射：判定列可手动改选，改后自动重识别其余列（历史批次载入无原始行，不显示） -->
        <div v-if="rows.length" class="mapping-bar">
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
      description="每条 OK 记录一个二维码（一物一码），按图纸编码规则（KBWK@@##*!%YMMDDXXXXX）拼装码值；标签明文印序号供人工核对防错贴。除浏览器打印外，还可导出 BarTender BTXML 打印任务，配合既有 .btw 模板批量打印。">

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
      <!-- 编码规则配置：项目/组件/试制阶段/颜色/供方首字母 + 年月日 + 五位流水码 -->
      <div class="rule-bar">
        <div class="rule-row">
          <span class="opt-label">项目名称</span>
          <el-input v-model="ruleKb" size="small" class="rule-kb-input" placeholder="如 King12-Basic"></el-input>
          <span class="opt-label">组件名称</span>
          <el-input v-model="ruleWk" size="small" class="rule-wk-input" placeholder="如 中框"></el-input>
          <span class="opt-label">试制阶段</span>
          <el-input v-model="ruleStage" size="small" class="rule-stage-input" placeholder="码 3/4/5/6/7"></el-input>
          <span class="opt-label">颜色</span>
          <el-input v-model="ruleColor" size="small" class="rule-color-input" placeholder="码 Q/Y"></el-input>
        </div>
        <div class="rule-row">
          <span class="opt-label">供方</span>
          <el-input v-model="ruleSupplier" size="small" class="rule-letter-input" placeholder="首字母"></el-input>
          <span class="opt-label">原材供方</span>
          <el-input v-model="ruleRaw" size="small" class="rule-letter-input" placeholder="首字母"></el-input>
          <span class="opt-label">阳极供方</span>
          <el-input v-model="ruleAnode" size="small" class="rule-letter-input" placeholder="首字母"></el-input>
          <span class="opt-label">流水码起始</span>
          <el-input-number v-model="ruleSerialStart" size="small" :min="0" :max="99999"
            controls-position="right" class="rule-serial-input"></el-input-number>
        </div>
        <div class="rule-row">
          <span class="opt-label">年份</span>
          <el-radio-group v-model="ruleYearMode" size="small">
            <el-radio label="auto">自动取当前</el-radio>
            <el-radio label="manual">手动</el-radio>
          </el-radio-group>
          <el-input v-if="ruleYearMode === 'manual'" v-model="ruleYearManual" size="small"
            class="rule-ym-input" placeholder="如 6"></el-input>
          <span class="opt-label">月份</span>
          <el-radio-group v-model="ruleMonthMode" size="small">
            <el-radio label="auto">自动取当前</el-radio>
            <el-radio label="manual">手动</el-radio>
          </el-radio-group>
          <el-input v-if="ruleMonthMode === 'manual'" v-model="ruleMonthManual" size="small"
            class="rule-ym-input" placeholder="如 9 / A"></el-input>
          <span class="opt-label">日期</span>
          <el-radio-group v-model="ruleDateSource" size="small">
            <el-radio label="record">取记录检测时间</el-radio>
            <el-radio label="manual">手动指定</el-radio>
          </el-radio-group>
          <el-date-picker v-if="ruleDateSource === 'manual'" v-model="ruleManualDate" size="small"
            type="date" value-format="yyyy-MM-dd" class="rule-date-picker" placeholder="二阳日期"></el-date-picker>
        </div>
        <p class="rule-tip">
          编码规则：项目 + 组件 + 试制阶段（填码值 3/4/5/6/7，填 V3/V4/VN1/VN2/LV 自动转码）+
          颜色（填码值 Q/Y，填 锖色/银色 自动转码）+ 供方/原材/阳极供方首字母 +
          年份末位 + 月份（1-9 月用数字，10/11/12 月用 A/B/C）+ 两位日期 + 五位流水码（逐条自动 +1）。
          码样例：<code>{{ ruleSample }}</code>
        </p>
      </div>
      <!-- BarTender 导出：OK 记录 → BTXML 打印任务脚本，配合既有 .btw 模板批量打印 -->
      <div class="btw-bar">
        <span class="opt-label">BarTender 模板</span>
        <el-input v-model="btwPath" size="small" class="btw-path-input"
          placeholder="本机 .btw 绝对路径，留空用内置模板"></el-input>
        <span class="opt-label">数据源名</span>
        <el-input v-model="btwField" size="small" class="btw-field-input"
          placeholder="模板中二维码绑定的具名数据源名"></el-input>
        <el-button type="warning" size="small" :disabled="!okRecords.length" @click="printBtxml">
          BarTender 打印（{{ okRecords.length }} 个）
        </el-button>
        <el-button type="warning" size="small" plain :disabled="!okRecords.length" @click="exportBtxml">
          导出 BTXML 文件
        </el-button>
      </div>
      <p class="btw-tip">
        「BarTender 打印」一键完成：自动调起本机 BarTender 按模板打印，无需命令行（仅安装包版本可用）。
        「导出 BTXML 文件」导出脚本备用：命令行 <code>BarTend /XMLScript=脚本.btxml</code> 或用 BarTender 直接打开。
        应用已内置「歌尔260701-1中框 锖色.btw」模板（启动后自动填入路径）；数据源名需与模板一致（歌尔模板为 BcQrcodeData）。
      </p>
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

    <!-- ==================== 历史批次弹层 ==================== -->
    <el-dialog title="历史批次（本机留存）" :visible.sync="batchListVisible" width="680px" append-to-body>
      <el-table :data="batchList" size="mini" border v-loading="batchLoading">
        <el-table-column prop="fileName" label="文件名" min-width="170" show-overflow-tooltip></el-table-column>
        <el-table-column prop="model" label="型号" min-width="120" show-overflow-tooltip></el-table-column>
        <el-table-column label="记录" width="70">
          <template slot-scope="s">{{ s.row.stats ? s.row.stats.total : '-' }}</template>
        </el-table-column>
        <el-table-column prop="importedAt" label="导入时间" width="160"></el-table-column>
        <el-table-column label="操作" width="140">
          <template slot-scope="s">
            <el-button type="primary" size="mini" plain @click="loadBatch(s.row.id)">载入</el-button>
            <el-button type="danger" size="mini" plain @click="removeBatch(s.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <p v-if="!batchList.length && !batchLoading" class="batch-empty">暂无历史批次</p>
    </el-dialog>
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
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
// 编码规则常量与纯函数：生成端 / 查询端共享的唯一事实来源（src/common/qc-code-rules.js）
import {
  pad2, pad5, MONTH_CODES, normalizeStage, normalizeColor
} from '@/common/qc-code-rules';
// 导入批次本地持久化（IndexedDB）：解析自动入库、历史批次载入/删除、规则码关联留存
import { saveBatch, listBatches, getBatch, deleteBatch } from '@/common/qc-db';

/* ==================== 常量配置 ==================== */
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

// 浏览器模式（npm run dev，无 Electron 主进程）下的默认模板路径：
// 无法探测本机路径，回退到开发机上的模板原位置；安装包/Electron 环境用内置模板，不经过此常量
const DEFAULT_BTW_PATH = 'E:\\xwechat_files\\wxid_qwxn8c1tnfo422_9f87\\msg\\file\\2026-09\\歌尔260701-1中框 锖色.btw';

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
      /* ---- 本地批次持久化（IndexedDB）---- */
      currentBatchId: null, // 当前批次在本地数据库中的 id（null 表示尚未入库）
      currentImportedAt: '', // 当前批次导入时间（入库时生成，更新时保留）
      batchListVisible: false, // 历史批次弹层
      batchLoading: false, // 历史批次列表加载中
      batchList: [], // 历史批次摘要列表 [{ id, fileName, model, importedAt, stats }]

      /* ---- 编码规则模式（KBWK@@##*!%YMMDDXXXXX）---- */
      ruleKb: '', // 1.项目名称，如 King12-Basic
      ruleWk: '', // 2.组件名称
      ruleStage: '', // 3.试制阶段：直接填码值（3/4/5/6/7），填 V3/V4/VN1/VN2/LV 自动转码
      ruleColor: '', // 4.颜色：直接填码值（Q/Y），填 锖色/银色 自动转码
      ruleSupplier: '', // 5.供方首字母
      ruleRaw: '', // 6.原材料供方首字母
      ruleAnode: '', // 7.阳极供方首字母
      ruleYearMode: 'auto', // 8.年份：auto 自动取当前年份末位 / manual 手动输入
      ruleYearManual: '', // manual 模式下的年份码（年份末位，如 6）
      ruleMonthMode: 'auto', // 9.月份：auto 自动取当前月份码 / manual 手动输入
      ruleMonthManual: '', // manual 模式下的月份码（1-9 数字 / 10-12 月 A/B/C）
      ruleDateSource: 'record', // 10.日期 DD 来源：record 取记录检测时间 / manual 手动指定二阳日期
      ruleManualDate: '', // manual 模式下的二阳日期（yyyy-MM-dd）
      ruleSerialStart: 1, // 11.五位流水码起始值，逐条自动 +1

      /* ---- BarTender 导出 ---- */
      btwPath: '', // .btw 模板绝对路径（BTXML 的 <Format> 引用它；Electron 下自动填入内置模板）
      btwField: 'BcQrcodeData', // 模板中二维码绑定的具名数据源名（歌尔模板为 BcQrcodeData）
      bundledBtw: [], // 内置模板列表 [{ name, path }]（Electron 主进程提供；浏览器模式为空）

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
  mounted () {
    // Electron 环境：取随应用打包的 .btw 模板（static/ 目录）并自动填入路径
    if (window.electronAPI && window.electronAPI.listBtwTemplates) {
      window.electronAPI.listBtwTemplates().then(list => {
        this.bundledBtw = list || [];
        if (!this.btwPath && this.bundledBtw.length) this.btwPath = this.bundledBtw[0].path;
      });
    } else if (!this.btwPath) {
      // 浏览器模式（npm run dev）：无主进程，回退到开发机上的模板路径
      this.btwPath = DEFAULT_BTW_PATH;
    }
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
    },
    /** 编码规则码样例：按当前配置拼一条（年份/月份自动取当前、日期取不到时回退今天、流水取起始值），供生成前核对 */
    ruleSample () {
      return this.buildRuleCode({ time: '' }, 0);
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
        // 新文件：清空上一次的生成结果与批次关联（新解析将作为新批次入库）
        this.qrReady = false;
        this.cards = [];
        this.currentBatchId = null;
        this.currentImportedAt = '';
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
      // 记录重建即同步本地批次：新解析自动入库，判定列改选覆盖更新当前批次
      this.syncBatch();
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
     * 编码规则校验：项目名称与组件名称必填（其余分段允许留空由供方后补）；
     * 年份/月份选「手动」时必须填码值，日期选「手动指定」时必须选择二阳日期。
     * 返回错误文案，空串表示通过。
     */
    ruleValidate () {
      if (!this.ruleKb.trim() || !this.ruleWk.trim()) {
        return '需先填写项目名称与组件名称';
      }
      if (this.ruleYearMode === 'manual' && !this.ruleYearManual.trim()) {
        return '年份已选「手动」，请填写年份码（年份末位，如 6）';
      }
      if (this.ruleMonthMode === 'manual' && !this.ruleMonthManual.trim()) {
        return '月份已选「手动」，请填写月份码（如 9 / A / B / C）';
      }
      if (this.ruleDateSource === 'manual' && !/^\d{4}-\d{1,2}-\d{1,2}$/.test(this.ruleManualDate || '')) {
        return '日期已选「手动指定」，请选择二阳日期';
      }
      return '';
    },
    /**
     * 解析编码规则中的 Y / M / DD 三段日期：
     *   Y 年份 —— auto 取当前年份末位，manual 取手输码值；
     *   M 月份 —— auto 取当前月份码（1-9 数字 / 10-12 月 A/B/C），manual 取手输码值；
     *   DD 日期 —— record 模式取该记录的检测时间（YYYY-MM-DD 开头），manual 模式取手选二阳日期，
     *              均取不到时回退今天。
     */
    ruleDateParts (r) {
      const now = new Date();
      // 年份：手动优先，否则当前年份末位
      const year = this.ruleYearMode === 'manual' && this.ruleYearManual.trim() !== ''
        ? this.ruleYearManual.trim()
        : String(now.getFullYear() % 10);
      // 月份：手动优先，否则当前月份码
      const month = this.ruleMonthMode === 'manual' && this.ruleMonthManual.trim() !== ''
        ? this.ruleMonthManual.trim()
        : MONTH_CODES[now.getMonth()];
      // 日期 DD：记录检测时间 / 手选二阳日期 / 回退今天
      let ymd = null;
      if (this.ruleDateSource === 'record' && r && r.time) {
        const m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(String(r.time));
        if (m) ymd = { y: +m[1], m: +m[2], d: +m[3] };
      }
      if (!ymd && this.ruleDateSource === 'manual' && this.ruleManualDate) {
        const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(this.ruleManualDate);
        if (m) ymd = { y: +m[1], m: +m[2], d: +m[3] };
      }
      if (!ymd) ymd = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
      return { year, month, day: pad2(ymd.d) };
    },
    /**
     * 按编码规则拼装单条码值（KBWK@@##*!%YMMDDXXXXX 共 11 段）：
     *   项目 + 组件 + 试制阶段码 + 颜色码 + 供方/原材/阳极供方首字母 +
     *   年份末位 + 月份码 + 两位日期 + 五位流水码（起始值 + idx，自动 +1）
     */
    buildRuleCode (r, idx) {
      const d = this.ruleDateParts(r);
      return this.ruleKb.trim() + this.ruleWk.trim() + normalizeStage(this.ruleStage) + normalizeColor(this.ruleColor) +
        this.ruleSupplier.trim() + this.ruleRaw.trim() + this.ruleAnode.trim() +
        d.year + d.month + d.day + pad5((this.ruleSerialStart || 0) + idx);
    },
    /**
     * 批量生成全部 OK 记录的二维码（编码规则码值）。
     * 分批 + setTimeout 让出主线程：上千条记录时进度条仍能刷新、界面不卡死。
     * 每条记录的规则码同时回写记录明细（r.ruleCode），生成完成后随批次持久化，
     * 供溯源查询端按码回查对应检测记录；重新生成时覆盖更新。
     */
    async generateAll () {
      const list = this.okRecords;
      if (!list.length) return;
      // 编码规则校验：项目/组件必填，手动日期需已选择
      const ruleErr = this.ruleValidate();
      if (ruleErr) { this.parseErr = ruleErr; return; }
      this.generating = true;
      this.progress = 0;
      this.qrReady = false;
      this.qrStore = {};
      const total = list.length;
      for (let i = 0; i < total; i++) {
        const r = list[i];
        try {
          const code = this.buildRuleCode(r, i);
          r.ruleCode = code; // 规则码关联回写（随批次入库，查询端 findByRuleCode 消费）
          this.qrStore[r.seq] = await QRCode.toDataURL(code, {
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
      // 规则码关联持久化（重新生成覆盖更新）
      this.syncBatch();
    },

    /* ==================== 本地批次持久化（IndexedDB） ==================== */

    /**
     * 当前批次同步入库：新解析（无 currentBatchId）新增，其后记录重建（判定列改选）、
     * 生成回写规则码均以同 id 覆盖更新。写入失败仅提示降级，不阻断解析与生成
     * （内存态数据仍可用于本次生成与打印）。
     */
    async syncBatch () {
      if (!this.stats || !this.records.length) return;
      if (!this.currentBatchId) this.currentImportedAt = this.nowStr();
      const batch = {
        id: this.currentBatchId || undefined, // undefined → 自增新键；有值 → 覆盖更新
        fileName: this.fileName,
        model: this.model,
        importedAt: this.currentImportedAt,
        stats: this.stats,
        records: this.records
      };
      try {
        this.currentBatchId = await saveBatch(batch);
      } catch (e) {
        this.currentBatchId = null;
        if (this.$message) {
          this.$message.warning('本机保存失败（' + ((e && e.message) || '未知原因') + '），本次数据仅内存可用');
        }
      }
    },
    /** 打开历史批次弹层并加载列表（按导入时间倒序，仅摘要不含明细） */
    async openBatchList () {
      this.batchListVisible = true;
      this.batchLoading = true;
      try {
        this.batchList = await listBatches();
      } catch (e) {
        this.batchList = [];
        if (this.$message) this.$message.warning('读取历史批次失败：' + ((e && e.message) || '未知原因'));
      }
      this.batchLoading = false;
    },
    /**
     * 载入历史批次：恢复文件名/型号/统计/记录明细（二维码需重新生成）。
     * 原始二维行不落库，故列映射区不显示、判定列改选不可用。
     */
    async loadBatch (id) {
      let batch = null;
      try {
        batch = await getBatch(id);
      } catch (e) {
        if (this.$message) this.$message.warning('读取批次失败：' + ((e && e.message) || '未知原因'));
        return;
      }
      if (!batch) {
        if (this.$message) this.$message.warning('该批次不存在（可能已被删除）');
        this.openBatchList();
        return;
      }
      this.fileName = batch.fileName;
      this.model = batch.model || '';
      this.stats = batch.stats;
      this.records = batch.records || [];
      this.rows = []; // 无原始行：隐藏列映射区
      this.currentBatchId = batch.id;
      this.currentImportedAt = batch.importedAt;
      this.qrReady = false;
      this.cards = [];
      this.parseErr = '';
      this.batchListVisible = false;
      if (this.$message) this.$message.success('已载入批次「' + (batch.fileName || '未命名') + '」，可重新生成二维码');
    },
    /** 删除历史批次；删除的是当前批次时解除当前关联 */
    removeBatch (id) {
      this.$confirm('确定删除该批次？删除后不可恢复。', '删除批次', { type: 'warning' })
        .then(async () => {
          try {
            await deleteBatch(id);
            if (this.currentBatchId === id) this.currentBatchId = null;
            this.openBatchList();
          } catch (e) {
            if (this.$message) this.$message.warning('删除失败：' + ((e && e.message) || '未知原因'));
          }
        })
        .catch(() => {});
    },
    nowStr () {
      const d = new Date();
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' +
        pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
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
    },

    /* ==================== BarTender BTXML 导出 ==================== */

    /** XML 转义（属性值与文本节点通用） */
    escapeXml (s) {
      return String(s).replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]
      ));
    },
    /**
     * 校验并生成 BTXML 脚本内容（直接打印与导出文件共用）。
     *   每条 OK 记录一个 <Print> 命令，二维码内容（与浏览器打印同款编码规则码值）
     *   写入模板的具名数据源（如 BcQrcodeData），二维码由 BarTender 按模板渲染。
     *   说明：.btw 为闭源二进制格式无法在浏览器端生成，BTXML 是 BarTender 官方自动化通道。
     * 返回 { xml, count }；校验失败返回 { error }
     */
    buildBtxml () {
      const list = this.okRecords;
      if (!list.length) return { error: '没有可打印的 OK 记录' };
      // 路径优先级：手填 > Electron 内置模板（static/ 随应用打包）> 浏览器模式默认路径
      const fallback = (this.bundledBtw.length ? this.bundledBtw[0].path : '') || DEFAULT_BTW_PATH;
      const path = this.btwPath.trim() || fallback;
      const field = this.btwField.trim() || 'BcQrcodeData';
      if (!/\.btw$/i.test(path)) {
        return { error: '模板路径需以 .btw 结尾（BarTender 标签格式文件）' };
      }
      // 编码规则校验，保证 BTXML 与浏览器打印内容一致
      const ruleErr = this.ruleValidate();
      if (ruleErr) return { error: ruleErr };
      const esc = this.escapeXml;
      const cmds = list.map((r, i) =>
        '  <Command Name="Label' + (i + 1) + '">\n' +
        '    <Print>\n' +
        '      <Format>' + esc(path) + '</Format>\n' +
        '      <NamedSubString Name="' + esc(field) + '">\n' +
        '        <Value>' + esc(this.buildRuleCode(r, i)) + '</Value>\n' +
        '      </NamedSubString>\n' +
        '    </Print>\n' +
        '  </Command>'
      ).join('\n');
      const xml = '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<XMLScript Version="2.0">\n' + cmds + '\n</XMLScript>\n';
      return { xml, count: list.length };
    },
    /**
     * 一键直接打印：主进程写临时 BTXML 并调起本机 BarTend.exe 执行（仅安装包/Electron 版可用）
     */
    async printBtxml () {
      const r = this.buildBtxml();
      if (r.error) { this.parseErr = r.error; return; }
      if (!(window.electronAPI && window.electronAPI.printBtxml)) {
        this.parseErr = '直接打印仅在安装包版本可用；当前浏览器模式请用「导出 BTXML 文件」';
        return;
      }
      const res = await window.electronAPI.printBtxml(r.xml);
      if (res && res.ok) {
        if (this.$message) this.$message.success('已调起 BarTender 打印（' + r.count + ' 个标签）');
      } else {
        this.parseErr = (res && res.error) || '调起 BarTender 失败';
      }
    },
    /**
     * 导出 BTXML 文件备用（命令行 BarTend /XMLScript=脚本.btxml 执行，或用 BarTender 直接打开）
     */
    exportBtxml () {
      const r = this.buildBtxml();
      if (r.error) { this.parseErr = r.error; return; }
      // \ufeff BOM：防止 Windows 下部分工具把无 BOM 的 UTF-8 按 ANSI 误读中文
      const blob = new Blob(['\ufeff' + r.xml], { type: 'application/xml;charset=utf-8' });
      const d = new Date();
      const stamp = '' + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) +
        '-' + pad2(d.getHours()) + pad2(d.getMinutes()) + pad2(d.getSeconds());
      const name = ('质检标签-' + (this.model || '未命名') + '-' + stamp + '.btxml')
        .replace(/[\\/:*?"<>|]/g, '_');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
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

// 历史批次入口行：弹层按钮 + 当前批次已入库标识
.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;

  .batch-flag {
    font-size: 12px;
    color: #1a7f37;
  }
}

.batch-empty {
  margin: 8px 0 0;
  font-size: 13px;
  color: #999;
  text-align: center;
}

// 编码规则配置面板：两行分段输入 + 规则说明与码样例
.rule-bar {
  margin-top: 12px;
  padding: 12px 14px;
  background: #f8f9fb;
  border: 1px solid #ebeef5;
  border-radius: 6px;

  .rule-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;

    & + .rule-row {
      margin-top: 10px;
    }
  }

  .opt-label {
    font-size: 13px;
    color: #666;
  }

  .rule-kb-input {
    width: 170px;
  }

  .rule-wk-input {
    width: 120px;
  }

  .rule-stage-input {
    width: 110px;
  }

  .rule-color-input {
    width: 90px;
  }

  .rule-letter-input {
    width: 70px;
  }

  .rule-ym-input {
    width: 80px;
  }

  .rule-date-picker {
    width: 140px;
  }

  .rule-serial-input {
    width: 110px;
  }

  .rule-tip {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.7;
    color: #999;

    code {
      padding: 1px 6px;
      font-family: Consolas, monospace;
      font-size: 12px;
      color: #b45309;
      background: #fdf6ec;
      border-radius: 3px;
      word-break: break-all;
    }
  }
}

// BarTender 导出栏：模板路径 + 具名数据源名 + 导出按钮
.btw-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;

  .opt-label {
    font-size: 13px;
    color: #666;
  }

  .btw-path-input {
    width: 320px;
  }

  .btw-field-input {
    width: 150px;
  }
}

// BarTender 导出说明：灰字小号，命令行片段用 code 样式
.btw-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.7;
  color: #999;

  code {
    padding: 1px 6px;
    font-family: Consolas, monospace;
    font-size: 12px;
    background: #f5f7fa;
    border-radius: 3px;
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
