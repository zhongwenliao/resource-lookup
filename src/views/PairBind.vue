<template>
  <demo-page title="码对绑定" description="先扫产品PVD码（1码），再扫油墨追溯码（2码）完成配对；绑定清单可导出 Excel 文档，多份文档的油墨追溯码可聚合进一个二维码，扫码即见全部配对。">
    <!-- 区块 1：扫码配对（1码=产品PVD码，2码=油墨追溯码，两码齐自动保存） -->
    <demo-block :index="1" title="扫码配对" description="先用扫码枪/摄像头扫产品PVD码（纯数字），再扫油墨追溯码，两码齐后自动保存配对（重绑即覆盖）。">
      <div class="doc-row">
        <span class="row-label">所属文档</span>
        <el-select v-model="docInput" filterable allow-create default-first-option clearable
          class="doc-select" size="small" placeholder="选择或输入文档名（如：2026-11-19 A线批次）">
          <el-option v-for="d in docs" :key="d.id" :value="d.name" :label="d.name" />
        </el-select>
      </div>
      <!-- 步骤行：当前待扫码步骤高亮；扫码枪在页面任意位置扫码自动填入高亮输入框 -->
      <div class="code-row" :class="{ active: step === 'digit' }">
        <span class="row-label step-tag">① 产品PVD码</span>
        <el-input v-model="digitInput" size="small" class="code-input"
          placeholder="产品PVD码（纯数字），扫码或手动输入" @keyup.enter.native="savePair" />
        <el-button size="small" icon="el-icon-camera" @click="openScan">摄像头</el-button>
      </div>
      <div class="code-row" :class="{ active: step === 'label' }">
        <span class="row-label step-tag">② 油墨追溯码</span>
        <el-input v-model="labelInput" size="small" class="code-input"
          placeholder="油墨追溯码，扫码或手动输入" @keyup.enter.native="savePair" />
        <el-button size="small" icon="el-icon-camera" @click="openScan">摄像头</el-button>
      </div>
      <div class="btn-row">
        <el-button type="primary" size="small" :loading="saving" @click="savePair">保存配对</el-button>
        <el-button size="small" @click="clearPair">清空重扫</el-button>
        <span class="tip-text">扫码枪在页面任意位置扫码，自动填入当前高亮步骤；配对成功后自动进入下一对</span>
      </div>
      <div v-if="lastMsg.text" class="pair-msg" :class="'msg-' + lastMsg.type">{{ lastMsg.text }}</div>
    </demo-block>

    <!-- 区块 2：绑定清单（需求 2：两码体现在文档上，可导出 Excel） -->
    <demo-block :index="2" title="绑定清单" description="按文档筛选本机全部配对，可导出 Excel 对照表。">
      <div class="rec-bar">
        <el-select v-model="filterDocId" size="small" class="filter-select" clearable placeholder="全部文档">
          <el-option v-for="d in docs" :key="d.id" :value="d.id" :label="d.name" />
        </el-select>
        <el-button type="primary" plain size="small" icon="el-icon-download" :loading="exporting"
          :disabled="!filteredPairs.length" @click="exportExcel">导出 Excel</el-button>
        <span class="rec-count">共 {{ filteredPairs.length }} 条配对</span>
      </div>
      <el-table :data="pagedPairs" size="mini" border>
        <el-table-column type="index" :index="indexAt" label="#" width="60" align="center" />
        <el-table-column prop="digitCode" label="产品PVD码" min-width="140" />
        <el-table-column prop="labelCode" label="油墨追溯码" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column label="所属文档" width="180">
          <template slot-scope="{ row }">{{ row.docName || '未分组' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="绑定时间" width="170" />
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" class="danger-link" @click="removePair(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="filteredPairs.length > PAGE_SIZE" class="rec-page" small
        layout="prev, pager, next" :total="filteredPairs.length" :page-size="PAGE_SIZE"
        :current-page.sync="page" />
    </demo-block>

    <!-- 区块 3：聚合二维码（需求 3 入口：完整功能在 /agg 页） -->
    <demo-block :index="3" title="聚合二维码" description="把多个文档的油墨追溯码聚合进一个二维码；内容自包含（任何扫码器可读出全部油墨追溯码），本项目扫码后自动成对展示各自的产品PVD码。">
      <el-button type="primary" size="small" icon="el-icon-full-screen" @click="$router.push('/agg')">前往聚合二维码</el-button>
    </demo-block>

    <scan-dialog :visible.sync="scanVisible" :continuous="true"
      :tip="step === 'digit' ? '对准产品PVD码（纯数字），识别后自动填入第 ① 步' : '对准油墨追溯码，识别后自动完成本对保存'"
      @scan="onScanCode" />
  </demo-page>
</template>

<script>
/**
 * 码对绑定页（按设计稿：双输入框两步配对）
 *
 * 业务：产品 PVD 码（1码，唯一数字码）与油墨追溯码（2码）1:1 配对，归属文档，
 * 清单可导出 Excel；聚合二维码入口跳 /agg 页。
 *
 * 交互约定（与设计稿一致）：
 * - 扫码枪/摄像头扫码按当前步骤（step）填入对应输入框；两码齐自动保存并进入下一对
 * - 手动输入可点「保存配对」；「清空重扫」重置两框
 * - 文档为「选择或输入名称」：已存在则归属，新名称自动创建（输入即建，无需先管理文档）
 * - 重绑即覆盖：savePairBinding 按 1:1 约定先删同 PVD 码/同油墨追溯码旧关系再写入
 */
import XLSX from 'xlsx';
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
import ScanDialog from '@/components/ScanDialog';
// 数字码校验：绑定页与溯源查询页共用的唯一判定（src/common/qc-code-rules.js）
import { isDigitCode } from '@/common/qc-code-rules';
// 扫码枪（USB/蓝牙 HID 键盘模式）全局输入监听，与绑定页共用同一实现
import { createScannerGun } from '@/common/scanner-gun';
import {
  saveDoc, listDocs,
  savePairBinding, findPairsByDoc, listPairBindings, deletePairBinding
} from '@/common/qc-db';

const PAGE_SIZE = 100;

export default {
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      PAGE_SIZE,
      docs: [], // 既有文档（下拉选项）
      docInput: '', // 所属文档名（可输入创建）
      digitInput: '', // ① 产品PVD码（纯数字）
      labelInput: '', // ② 油墨追溯码
      step: 'digit', // 当前扫码步骤：digit 待扫 PVD 码 / label 待扫油墨追溯码
      scanVisible: false,
      saving: false,
      pairs: [], // 配对记录全量（按时间倒序，本地分页）
      filterDocId: null, // null=全部文档 / 文档 id
      page: 1,
      exporting: false,
      lastMsg: { type: '', text: '' } // 最近一次配对反馈（成功/警告）
    };
  },
  computed: {
    /** 按文档筛选后的清单（导出与分页共用）；clearable 清空后值为 ''，一并视为全部 */
    filteredPairs () {
      if (this.filterDocId == null || this.filterDocId === '') return this.pairs;
      return this.pairs.filter(p => p.docId === this.filterDocId);
    },
    pagedPairs () {
      const start = (this.page - 1) * PAGE_SIZE;
      return this.filteredPairs.slice(start, start + PAGE_SIZE);
    }
  },
  async created () {
    await this.refreshAll();
  },
  mounted () {
    // 扫码枪全局监听（键盘 HID 模式）：页面任意位置扫码即填，不依赖输入框聚焦
    this._stopGun = createScannerGun(this.onGunCode);
  },
  beforeDestroy () {
    if (this._stopGun) {
      this._stopGun();
      this._stopGun = null;
    }
  },
  methods: {
    indexAt (i) {
      return (this.page - 1) * PAGE_SIZE + i + 1;
    },
    say (type, text) {
      this.lastMsg = { type: type, text: text };
    },
    nowStr () {
      const d = new Date();
      const p2 = n => (n < 10 ? '0' + n : '' + n);
      return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' +
        p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
    },
    async refreshAll () {
      try {
        const [docs, pairs] = await Promise.all([listDocs(), listPairBindings(1000)]);
        this.docs = docs;
        this.pairs = pairs;
        this.clampPage();
      } catch (e) {
        this.say('warn', '读取配对数据失败：' + e.message);
      }
    },
    clampPage () {
      const max = Math.max(1, Math.ceil(this.filteredPairs.length / PAGE_SIZE));
      if (this.page > max) this.page = max;
    },
    /* ---------- 扫码填入（三通道共用） ---------- */
    openScan () {
      this.scanVisible = true;
    },
    onGunCode (code) {
      this.fillByStep(code);
    },
    onScanCode (code) {
      this.fillByStep(code);
    },
    /**
     * 按当前步骤填码：digit 步只收纯数字（扫到非数字说明扫错对象），
     * label 步收任意码；两码齐即自动保存（扫码连扫节奏无需再点按钮）
     */
    fillByStep (raw) {
      const code = String(raw || '').trim();
      if (!code) return;
      if (this.step === 'digit') {
        if (!isDigitCode(code)) {
          return this.say('warn', '第 ① 步应扫产品PVD码（纯数字），已忽略：' + code);
        }
        this.digitInput = code;
        this.step = 'label';
        this.say('ok', '产品PVD码已录入：' + code + '，请扫油墨追溯码');
        return;
      }
      if (code === this.digitInput.trim()) {
        return this.say('warn', '油墨追溯码与产品PVD码相同，请扫标签上的码');
      }
      this.labelInput = code;
      this.savePair(); // 两码齐自动保存
    },
    /* ---------- 配对保存（需求 1 + 2） ---------- */
    clearPair () {
      this.digitInput = '';
      this.labelInput = '';
      this.step = 'digit';
      this.say('', '');
    },
    async savePair () {
      const digit = this.digitInput.trim();
      const label = this.labelInput.trim();
      if (!digit && !label) return;
      if (!digit || !label) {
        return this.say('warn', digit ? '还差油墨追溯码，请扫第 ② 步' : '还差产品PVD码，请扫第 ① 步');
      }
      if (!isDigitCode(digit)) {
        return this.say('warn', '产品PVD码应为纯数字（≥4 位）：' + digit);
      }
      if (digit === label) {
        return this.say('warn', '两个码相同，请核对后重扫');
      }
      this.saving = true;
      try {
        // 文档：名称已存在则归属，新名称自动创建（设计稿「选择或输入文档名」）
        let docId = null;
        let docName = '';
        const name = this.docInput.trim();
        if (name) {
          const exist = this.docs.find(d => d.name === name);
          if (exist) {
            docId = exist.id;
            docName = exist.name;
          } else {
            docId = await saveDoc({ name: name, createdAt: this.nowStr() });
            docName = name;
            await this.refreshAll();
          }
        }
        // 重绑即覆盖：savePairBinding 内部先删同 PVD 码/同油墨追溯码旧关系再写入
        await savePairBinding({
          digitCode: digit,
          labelCode: label,
          docId: docId,
          docName: docName,
          createdAt: this.nowStr()
        });
        this.say('ok', '配对成功：' + digit + ' ↔ ' + label + (docName ? '（' + docName + '）' : '（未分组）'));
        // 自动进入下一对：清空两框、回到第 ① 步（扫码连扫节奏）
        this.digitInput = '';
        this.labelInput = '';
        this.step = 'digit';
        await this.refreshAll();
      } catch (e) {
        this.say('warn', '保存失败：' + e.message);
      } finally {
        this.saving = false;
      }
    },
    /* ---------- 绑定清单 ---------- */
    removePair (row) {
      this.$confirm('删除配对：' + row.digitCode + ' ↔ ' + row.labelCode + '？', '解绑', { type: 'warning' })
        .then(() => deletePairBinding(row.id))
        .then(() => this.refreshAll())
        .then(() => this.$message.success('已删除'))
        .catch(e => {
          if (e && e.message) this.$message.error(e.message);
        });
    },
    /* ---------- Excel 对照表导出（需求 2） ---------- */
    async exportExcel () {
      if (!this.filteredPairs.length) return;
      this.exporting = true;
      try {
        const docLabel = (this.filterDocId == null || this.filterDocId === '')
          ? '全部文档'
          : (this.currentFilterDocName() || '未分组');
        // AOA 组表：标题行（系统名）+ 信息行（文档/导出时间）+ 明细——两码均在列
        const rows = [
          ['华源湘条码追溯系统 —— 码对绑定清单'],
          ['文档', docLabel, '导出时间', this.nowStr()],
          ['序号', '产品PVD码', '油墨追溯码', '所属文档', '绑定时间']
        ];
        this.filteredPairs.forEach((p, i) => {
          rows.push([i + 1, p.digitCode, p.labelCode, p.docName || '未分组', p.createdAt]);
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), '码对绑定清单');
        const stamp = this.nowStr().replace(/[-: ]/g, '');
        const fileName = '码对绑定清单-' + docLabel + '-' + stamp + '.xlsx';
        // 桌面版经主进程保存对话框写盘；浏览器 dev 无 electronAPI，降级为浏览器下载
        if (window.electronAPI && window.electronAPI.exportExcelFile) {
          const u8 = new Uint8Array(XLSX.write(wb, { bookType: 'xlsx', type: 'array' }));
          const r = await window.electronAPI.exportExcelFile(fileName, u8);
          if (r && r.ok) this.$message.success('已导出：' + r.path);
          else if (r && !r.canceled) this.$message.error((r && r.error) || '导出失败');
        } else {
          XLSX.writeFile(wb, fileName);
          this.$message.success('已导出（浏览器下载）：' + fileName);
        }
      } catch (e) {
        this.$message.error('导出失败：' + e.message);
      } finally {
        this.exporting = false;
      }
    },
    currentFilterDocName () {
      const doc = this.docs.find(d => d.id === this.filterDocId);
      return doc ? doc.name : '';
    }
  }
};
</script>

<style lang="less" scoped>
.doc-row,
.code-row,
.btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.row-label {
  flex: none;
  width: 104px;
  text-align: right;
  font-size: 13px;
  color: #666;
}

.doc-select {
  width: 320px;
}

/* 步骤行：当前待扫码步骤高亮（扫码枪自动填入目标） */
.code-row {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;

  &.active {
    background: #e6f7ff;
    border-color: #91d5ff;
  }

  .step-tag {
    color: #333;
    font-weight: 600;
  }

  .code-input {
    width: 380px;
  }
}

.btn-row {
  .tip-text {
    font-size: 12px;
    color: #999;
  }
}

.pair-msg {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  word-break: break-all;

  &.msg-ok {
    background: #f6ffed;
    color: #389e0d;
    border: 1px solid #b7eb8f;
  }

  &.msg-warn {
    background: #fff1f0;
    color: #cf1322;
    border: 1px solid #ffa39e;
  }
}

.rec-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  .filter-select {
    width: 200px;
  }

  .rec-count {
    font-size: 13px;
    color: #666;
  }
}

.rec-page {
  margin-top: 10px;
  text-align: right;
}

.danger-link {
  color: #f5222d;
}
</style>
