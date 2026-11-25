<template>
  <demo-page title="码对绑定" description="先扫产品PVD码（1码），再扫油墨追溯码（2码）完成配对；装箱场景可切换「出货直绑」，扫产品PVD码直接绑出货码（4码），不必先有油墨追溯码。绑定清单可导出 Excel 文档，多份文档的油墨追溯码可聚合进一个二维码，扫码即见全部配对。">
    <!-- 区块 1：扫码配对（1码=产品PVD码，2码=油墨追溯码/4码=出货码，两码齐自动保存） -->
    <demo-block :index="1" title="扫码配对" description="先用扫码枪/摄像头扫产品PVD码（纯数字），再按绑定模式扫油墨追溯码或出货码，两码齐后自动保存（重绑即覆盖）。">
      <div class="doc-row">
        <span class="row-label">所属文档</span>
        <el-select v-model="docInput" filterable allow-create default-first-option clearable
          class="doc-select" size="small" placeholder="选择或输入文档名（如：2026-11-19 A线批次）">
          <el-option v-for="d in docs" :key="d.id" :value="d.name" :label="d.name" />
        </el-select>
      </div>
      <div class="mode-row">
        <span class="row-label">绑定模式</span>
        <el-radio-group v-model="bindMode" size="small" @change="onModeChange">
          <el-radio-button label="pair">油墨配对（1↔2）</el-radio-button>
          <el-radio-button label="ship">出货直绑（1↔4）</el-radio-button>
        </el-radio-group>
      </div>
      <!-- 油墨时效管控：仅油墨配对模式，超时锁定第 ② 步油墨追溯码录入 -->
      <div v-if="bindMode === 'pair'" class="ink-bar" :class="inkExpired ? 'ink-warn' : 'ink-ok'">
        <i :class="inkExpired ? 'el-icon-warning' : 'el-icon-circle-check'"></i>
        <span v-if="!inkChangedAt">首次使用请先确认油墨状态：更换油墨后点击右侧按钮开始 4 小时时效计时</span>
        <span v-else-if="inkExpired">油墨已超过 4 小时，请更换油墨后点击「已更换油墨」确认，否则无法录入油墨追溯码</span>
        <span v-else>油墨时效正常（剩余 {{ inkRemainText }}）</span>
        <el-button v-if="inkExpired || !inkChangedAt" type="danger" size="mini" @click="confirmInk">已更换油墨</el-button>
        <el-button v-else type="text" size="mini" class="ink-reset" @click="confirmInk">已更换油墨？点击重置计时</el-button>
      </div>
      <!-- 步骤行：当前待扫码步骤高亮；扫码枪在页面任意位置扫码自动填入高亮输入框 -->
      <div class="code-row" :class="{ active: step === 'digit' }">
        <span class="row-label step-tag">① 产品PVD码</span>
        <el-input v-model="digitInput" size="small" class="code-input"
          placeholder="产品PVD码（纯数字），扫码或手动输入" @keyup.enter.native="saveCurrent" />
        <el-button size="small" icon="el-icon-camera" @click="openScan">摄像头</el-button>
      </div>
      <div class="code-row" :class="{ active: step === 'label' }">
        <span class="row-label step-tag">② {{ bindMode === 'pair' ? '油墨追溯码' : '出货码' }}</span>
        <el-input v-model="labelInput" size="small" class="code-input"
          :placeholder="bindMode === 'pair' ? '油墨追溯码，扫码或手动输入' : '出货码（4码），扫码或手动输入'"
          :disabled="bindMode === 'pair' && inkExpired" @keyup.enter.native="saveCurrent" />
        <el-button size="small" icon="el-icon-camera" :disabled="bindMode === 'pair' && inkExpired"
          @click="openScan">摄像头</el-button>
      </div>
      <div class="btn-row">
        <el-button type="primary" size="small" :loading="saving" @click="saveCurrent">
          {{ bindMode === 'pair' ? '保存配对' : '保存直绑' }}</el-button>
        <el-button size="small" @click="clearPair">清空重扫</el-button>
        <span class="tip-text">扫码枪在页面任意位置扫码，自动填入当前高亮步骤；{{ bindMode === 'pair' ? '配对成功后自动进入下一对' : '直绑成功后自动进入下一件' }}</span>
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

    <!-- 区块 3：出货直绑清单（v8：产品装箱场景，1码 ↔ 4码 直绑记录） -->
    <demo-block :index="3" title="出货直绑清单" description="产品装箱直绑记录（产品PVD码 → 出货码）；直绑独立于油墨配对链路，互不影响。">
      <div class="rec-bar">
        <el-select v-model="filterDocId" size="small" class="filter-select" clearable placeholder="全部文档">
          <el-option v-for="d in docs" :key="d.id" :value="d.id" :label="d.name" />
        </el-select>
        <span class="rec-count">共 {{ filteredShipPairs.length }} 条直绑</span>
      </div>
      <el-table :data="pagedShipPairs" size="mini" border>
        <el-table-column type="index" :index="indexAtShip" label="#" width="60" align="center" />
        <el-table-column prop="digitCode" label="产品PVD码" min-width="140" />
        <el-table-column prop="shipmentCode" label="出货码（4码）" min-width="150" :show-overflow-tooltip="true" />
        <el-table-column label="所属文档" width="180">
          <template slot-scope="{ row }">{{ row.docName || '未分组' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="绑定时间" width="170" />
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" class="danger-link" @click="removeShipPair(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="filteredShipPairs.length > PAGE_SIZE" class="rec-page" small
        layout="prev, pager, next" :total="filteredShipPairs.length" :page-size="PAGE_SIZE"
        :current-page.sync="shipPage" />
    </demo-block>

    <!-- 区块 4：聚合二维码（需求 3 入口：完整功能在 /agg 页） -->
    <demo-block :index="4" title="聚合二维码" description="把多个文档的油墨追溯码聚合进一个二维码；内容自包含（任何扫码器可读出全部油墨追溯码），本项目扫码后自动成对展示各自的产品PVD码。">
      <el-button type="primary" size="small" icon="el-icon-full-screen" @click="$router.push('/agg')">前往聚合二维码</el-button>
    </demo-block>

    <scan-dialog :visible.sync="scanVisible" :continuous="true"
      :tip="step === 'digit' ? '对准产品PVD码（纯数字），识别后自动填入第 ① 步' : (bindMode === 'pair' ? '对准油墨追溯码，识别后自动完成本对保存' : '对准出货码，识别后自动完成本件直绑')"
      @scan="onScanCode" />
  </demo-page>
</template>

<script>
/**
 * 码对绑定页（双输入框两步配对 + 出货直绑 + 油墨时效管控）
 *
 * 业务：产品 PVD 码（1码，唯一数字码）与油墨追溯码（2码）1:1 配对，归属文档，
 * 清单可导出 Excel；装箱场景切换「出货直绑」模式：扫 PVD 码直接绑出货码（4码），
 * 不必先有油墨追溯码/聚合码（ship-pairs 仓，一个 PVD 同时只在一个箱，重绑即覆盖）；
 * 聚合二维码入口跳 /agg 页。
 *
 * 油墨时效管控（仅油墨配对模式）：喷码油墨须每 4 小时更换，操作工点「已更换油墨」
 * 记录时间戳（localStorage 单机计时），超时（或首次未确认）锁定第 ② 步油墨追溯码
 * 录入（输入框/摄像头禁用、扫码枪/摄像头扫码拒绝），确认后重新计时解锁。
 *
 * 交互约定：
 * - 绑定模式 radio 切换「油墨配对（1↔2）」/「出货直绑（1↔4）」，切换即清空重扫
 * - 扫码枪/摄像头扫码按当前步骤（step）填入对应输入框；两码齐自动保存并进入下一对/件
 * - 手动输入可点「保存配对/保存直绑」；「清空重扫」重置两框
 * - 文档为「选择或输入名称」：已存在则归属，新名称自动创建（输入即建，无需先管理文档）
 * - 重绑即覆盖：savePairBinding 先删同 PVD 码/同油墨追溯码旧关系再写入；
 *   saveShipPair 先删同 PVD 码旧直绑再写入
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
  savePairBinding, listPairBindings, deletePairBinding,
  saveShipPair, listShipPairBindings, deleteShipPairBinding
} from '@/common/qc-db';

const PAGE_SIZE = 100;
const INK_WINDOW_MS = 4 * 60 * 60 * 1000; // 油墨时效窗口：4 小时
const INK_LS_KEY = 'qc-ink-changed-at'; // 上次更换油墨时间戳（localStorage，单机计时）

export default {
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      PAGE_SIZE,
      docs: [], // 既有文档（下拉选项）
      docInput: '', // 所属文档名（可输入创建）
      bindMode: 'pair', // 绑定模式：pair 油墨配对（1↔2）/ ship 出货直绑（1↔4）
      digitInput: '', // ① 产品PVD码（纯数字，两模式共用）
      labelInput: '', // ② 油墨追溯码（pair 模式）/ 出货码（ship 模式）
      step: 'digit', // 当前扫码步骤：digit 待扫 PVD 码 / label 待扫第 ② 步码
      scanVisible: false,
      saving: false,
      pairs: [], // 配对记录全量（按时间倒序，本地分页）
      shipPairs: [], // 直绑记录全量（按时间倒序，本地分页）
      filterDocId: null, // null=全部文档 / 文档 id（配对与直绑清单共用）
      page: 1,
      shipPage: 1,
      exporting: false,
      inkChangedAt: 0, // 上次更换油墨时间戳（ms）；0=未确认过
      inkNow: Date.now(), // 当前时间（定时刷新，驱动时效状态条与剩余时间）
      lastMsg: { type: '', text: '' } // 最近一次配对/直绑反馈（成功/警告）
    };
  },
  computed: {
    /** 油墨时效是否过期（或首次未确认）——锁定 pair 模式第 ② 步油墨追溯码录入 */
    inkExpired () {
      return !this.inkChangedAt || (this.inkNow - this.inkChangedAt) >= INK_WINDOW_MS;
    },
    /** 时效内剩余时间文案（驱动状态条；由 inkNow 每 30s 刷新重算） */
    inkRemainText () {
      const left = INK_WINDOW_MS - (this.inkNow - this.inkChangedAt);
      if (left <= 0) return '';
      const min = Math.floor(left / 60000);
      const h = Math.floor(min / 60);
      const m = min % 60;
      return h > 0 ? h + '小时' + m + '分' : m + '分钟';
    },
    /** 按文档筛选后的清单（导出与分页共用）；clearable 清空后值为 ''，一并视为全部 */
    filteredPairs () {
      if (this.filterDocId == null || this.filterDocId === '') return this.pairs;
      return this.pairs.filter(p => p.docId === this.filterDocId);
    },
    pagedPairs () {
      const start = (this.page - 1) * PAGE_SIZE;
      return this.filteredPairs.slice(start, start + PAGE_SIZE);
    },
    /** 直绑清单同样按文档筛选（与配对清单共用筛选器） */
    filteredShipPairs () {
      if (this.filterDocId == null || this.filterDocId === '') return this.shipPairs;
      return this.shipPairs.filter(p => p.docId === this.filterDocId);
    },
    pagedShipPairs () {
      const start = (this.shipPage - 1) * PAGE_SIZE;
      return this.filteredShipPairs.slice(start, start + PAGE_SIZE);
    }
  },
  async created () {
    try {
      this.inkChangedAt = Number(localStorage.getItem(INK_LS_KEY)) || 0;
    } catch (e) {
      this.inkChangedAt = 0; // localStorage 不可用时视为未确认，走「已更换油墨」初始化
    }
    this.inkNow = Date.now();
    await this.refreshAll();
  },
  mounted () {
    // 扫码枪全局监听（键盘 HID 模式）：页面任意位置扫码即填，不依赖输入框聚焦
    this._stopGun = createScannerGun(this.onGunCode);
    // 油墨时效每 30s 刷新一次（剩余时间文案与过期判定，精度足够）
    this._inkTimer = setInterval(() => {
      this.inkNow = Date.now();
    }, 30000);
  },
  beforeDestroy () {
    if (this._stopGun) {
      this._stopGun();
      this._stopGun = null;
    }
    clearInterval(this._inkTimer);
    this._inkTimer = null;
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
    indexAtShip (i) {
      return (this.shipPage - 1) * PAGE_SIZE + i + 1;
    },
    async refreshAll () {
      try {
        const [docs, pairs, shipPairs] = await Promise.all([
          listDocs(), listPairBindings(1000), listShipPairBindings(1000)
        ]);
        this.docs = docs;
        this.pairs = pairs;
        this.shipPairs = shipPairs;
        this.clampPage();
        this.clampShipPage();
      } catch (e) {
        this.say('warn', '读取配对数据失败：' + e.message);
      }
    },
    clampPage () {
      const max = Math.max(1, Math.ceil(this.filteredPairs.length / PAGE_SIZE));
      if (this.page > max) this.page = max;
    },
    clampShipPage () {
      const max = Math.max(1, Math.ceil(this.filteredShipPairs.length / PAGE_SIZE));
      if (this.shipPage > max) this.shipPage = max;
    },
    /* ---------- 绑定模式与油墨时效 ---------- */
    /** 切换绑定模式：清空重扫，避免上一模式的半输入码串到新流程 */
    onModeChange () {
      this.clearPair();
    },
    /** 记录「已更换油墨」：写 localStorage 开始/重置 4 小时时效，解锁第 ② 步录入 */
    confirmInk () {
      const now = Date.now();
      this.inkChangedAt = now;
      this.inkNow = now;
      try {
        localStorage.setItem(INK_LS_KEY, String(now));
      } catch (e) {
        // localStorage 不可用（隐私模式等）：仅本次会话内生效，不阻断绑定
      }
      this.$message.success('已确认更换油墨，4 小时时效重新计时');
      if (this.bindMode === 'pair' && this.step === 'label') {
        this.say('ok', '油墨时效已更新，请扫油墨追溯码');
      }
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
     * 按当前步骤填码：digit 步只收纯数字（扫到非数字说明扫错对象）；
     * label 步按模式收油墨追溯码/出货码，两码齐即自动保存（扫码连扫节奏无需再点按钮）；
     * pair 模式下油墨时效过期（或未确认）时第 ② 步录入一律拒绝
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
        this.say('ok', '产品PVD码已录入：' + code + '，请扫' +
          (this.bindMode === 'pair' ? '油墨追溯码' : '出货码'));
        return;
      }
      if (this.bindMode === 'pair' && this.inkExpired) {
        return this.say('warn', '油墨已超过 4 小时（或未确认），请更换油墨并点击「已更换油墨」后继续绑定');
      }
      if (this.bindMode === 'ship' && code.indexOf('\n') >= 0) {
        return this.say('warn', '出货码应为单行码，请核对后重扫');
      }
      if (code === this.digitInput.trim()) {
        return this.say('warn', (this.bindMode === 'pair' ? '油墨追溯码' : '出货码') +
          '与产品PVD码相同，请扫' + (this.bindMode === 'pair' ? '标签上的码' : '箱上的码'));
      }
      this.labelInput = code;
      this.saveCurrent(); // 两码齐自动保存
    },
    /* ---------- 保存分流 ---------- */
    saveCurrent () {
      if (this.bindMode === 'pair') return this.savePair();
      return this.saveDirect();
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
      if (this.inkExpired) {
        return this.say('warn', '油墨已超过 4 小时（或未确认），请更换油墨并点击「已更换油墨」后保存');
      }
      this.saving = true;
      try {
        const doc = await this.resolveDoc();
        // 重绑即覆盖：savePairBinding 内部先删同 PVD 码/同油墨追溯码旧关系再写入
        await savePairBinding({
          digitCode: digit,
          labelCode: label,
          docId: doc.docId,
          docName: doc.docName,
          createdAt: this.nowStr()
        });
        this.say('ok', '配对成功：' + digit + ' ↔ ' + label +
          (doc.docName ? '（' + doc.docName + '）' : '（未分组）'));
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
    /* ---------- 出货直绑保存（v8：1码 ↔ 4码 装箱直绑） ---------- */
    async saveDirect () {
      const digit = this.digitInput.trim();
      const ship = this.labelInput.trim();
      if (!digit && !ship) return;
      if (!digit || !ship) {
        return this.say('warn', digit ? '还差出货码，请扫第 ② 步' : '还差产品PVD码，请扫第 ① 步');
      }
      if (!isDigitCode(digit)) {
        return this.say('warn', '产品PVD码应为纯数字（≥4 位）：' + digit);
      }
      if (ship.indexOf('\n') >= 0) {
        return this.say('warn', '出货码应为单行码，请核对后重扫');
      }
      if (digit === ship) {
        return this.say('warn', '两个码相同，请核对后重扫');
      }
      this.saving = true;
      try {
        const doc = await this.resolveDoc();
        // 重绑即覆盖：saveShipPair 内部先删同 PVD 码旧直绑再写入（一个 PVD 同时只在一个箱）
        await saveShipPair({
          digitCode: digit,
          shipmentCode: ship,
          docId: doc.docId,
          docName: doc.docName,
          createdAt: this.nowStr()
        });
        this.say('ok', '直绑成功：' + digit + ' → ' + ship +
          (doc.docName ? '（' + doc.docName + '）' : '（未分组）'));
        // 自动进入下一件：清空两框、回到第 ① 步
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
    /**
     * 文档归属共用（配对与直绑）：名称已存在则归属，新名称自动创建；
     * 创建后 refreshAll 会顺带刷新两份清单，调用方无需重复处理
     */
    async resolveDoc () {
      const name = this.docInput.trim();
      if (!name) return { docId: null, docName: '' };
      const exist = this.docs.find(d => d.name === name);
      if (exist) return { docId: exist.id, docName: exist.name };
      const docId = await saveDoc({ name: name, createdAt: this.nowStr() });
      await this.refreshAll();
      return { docId: docId, docName: name };
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
    removeShipPair (row) {
      this.$confirm('删除直绑：' + row.digitCode + ' → ' + row.shipmentCode + '？', '解绑', { type: 'warning' })
        .then(() => deleteShipPairBinding(row.id))
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
.mode-row,
.code-row,
.btn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

/* 油墨时效状态条：正常绿色 / 超时红色（超时锁定第 ② 步录入） */
.ink-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  &.ink-ok {
    background: #f6ffed;
    color: #389e0d;
    border: 1px solid #b7eb8f;
  }

  &.ink-warn {
    background: #fff1f0;
    color: #cf1322;
    border: 1px solid #ffa39e;
  }

  .ink-reset {
    color: #389e0d;
  }
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
