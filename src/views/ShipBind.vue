<template>
  <demo-page title="出货绑定（4码）" description="扫聚合二维码（3码）绑定出货码（4码）：一箱一个聚合码贴箱，出货码扫码即可展开箱内全部 1↔2 配对。">
    <!-- 区块 1：扫聚合码绑出货码（套娃第 4 级：扫 3码 → 绑 4码） -->
    <demo-block :index="1" title="扫聚合码绑出货码" description="摄像头扫聚合码（或从历史选择）载入箱内成员，再扫出货码，两码齐自动保存（出货码重绑即覆盖）。">
      <!-- 第 ① 步：聚合码（3码）——摄像头扫入或历史选择 -->
      <div class="code-row" :class="{ active: step === 'agg' }">
        <span class="row-label step-tag">① 聚合码</span>
        <el-select v-model="aggPick" size="small" class="agg-pick" placeholder="从历史聚合码选择"
          @change="onPickAgg">
          <el-option v-for="h in history" :key="h.id" :value="h.id"
            :label="(h.title || '（未命名）') + '（' + h.codes.length + ' 对）'" />
        </el-select>
        <el-button size="small" icon="el-icon-camera" @click="openScan">摄像头</el-button>
        <el-button size="small" v-if="aggInfo" @click="clearAgg">清除</el-button>
      </div>
      <div v-if="aggInfo" class="agg-loaded">
        <i class="el-icon-box"></i>
        <b>{{ aggInfo.title || '（未命名聚合）' }}</b>
        <span class="agg-sub">{{ aggInfo.codes.length }} 对 · 创建于 {{ aggInfo.createdAt }}</span>
        <span class="agg-sub" v-if="aggInfo.fromScan && !aggInfo.doc">（外来聚合码，本机库中无对应记录）</span>
      </div>
      <div v-if="aggInfo" class="member-list">
        <div v-for="c in aggInfo.codes" :key="c" class="member-item">{{ c }}</div>
      </div>
      <!-- 第 ② 步：出货码（4码） -->
      <div class="code-row" :class="{ active: step === 'ship' }">
        <span class="row-label step-tag">② 出货码</span>
        <el-input v-model="shipInput" size="small" class="ship-input"
          placeholder="扫/输出货码（4码）后自动保存" @keyup.enter.native="saveShip" />
        <el-button size="small" icon="el-icon-camera" @click="openScan">摄像头</el-button>
      </div>
      <div class="btn-row">
        <el-button type="primary" size="small" :loading="saving" :disabled="!aggInfo" @click="saveShip">保存绑定</el-button>
        <el-button size="small" @click="clearPair">清空重扫</el-button>
        <span class="tip-text">扫码枪在页面任意位置扫码，自动填入当前高亮步骤；绑定成功后自动进入下一箱</span>
      </div>
      <div v-if="lastMsg.text" class="ship-msg" :class="'msg-' + lastMsg.type">{{ lastMsg.text }}</div>
    </demo-block>

    <!-- 区块 2：出货绑定清单 -->
    <demo-block :index="2" title="出货绑定清单" description="本机全部出货绑定记录；扫出货码即可在溯源查询页展开对应聚合码内容。">
      <div class="rec-bar">
        <el-button size="small" icon="el-icon-refresh" @click="refreshAll">刷新</el-button>
        <span class="rec-count">共 {{ list.length }} 条绑定</span>
      </div>
      <el-table :data="list" size="mini" border>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="shipmentCode" label="出货码（4码）" min-width="150" />
        <el-table-column label="聚合码（3码）" min-width="200">
          <template slot-scope="{ row }">{{ row.aggTitle || '（未命名聚合）' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="绑定时间" width="170" />
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" class="danger-link" @click="removeShip(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </demo-block>

    <scan-dialog :visible.sync="scanVisible" :continuous="true"
      :tip="step === 'agg' ? '对准聚合二维码（3码，HYX-AGG 开头的多行码），识别后载入成员' : '对准出货码（4码），识别后自动完成本箱绑定'"
      @scan="onScanCode" />
  </demo-page>
</template>

<script>
/**
 * 出货绑定页（四级套娃第 4 级，v7）
 *
 * 业务链：装箱工序拿到贴好聚合码（3码）的箱子 → 本页扫 3码 载入成员 → 扫出货码（4码）
 * 落库 shipment-codes → 终端客户/质检扫 4码 即可展开箱内全部 1↔2 配对。
 *
 * 两步状态机：agg（待扫聚合码）→ ship（待扫出货码）→ 成功回 agg 进入下一箱。
 * 聚合码支持两条入口：摄像头扫物理聚合码（parseAggContent 解析，库里有记录则取标题）
 * 或历史聚合码下拉选择。出货码重绑即覆盖（saveShipment 先清后写）；同一聚合码
 * 可绑多个出货码（分批出货），不做聚合侧唯一限制。
 */
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
import ScanDialog from '@/components/ScanDialog';
// 聚合码内容解析与标识行常量：与生成端/查询端共享的唯一事实来源（src/common/qc-code-rules.js）
import { parseAggContent, AGG_HEADER } from '@/common/qc-code-rules';
import { createScannerGun } from '@/common/scanner-gun';
import {
  findAggByContent, listAggCodes,
  saveShipment, findShipmentByCode, listShipments, deleteShipment
} from '@/common/qc-db';

export default {
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      history: [], // 历史聚合码（下拉选择入口）
      aggPick: null, // 下拉选中的历史聚合码 id
      aggInfo: null, // 已载入的聚合码 { title, content, codes, createdAt, doc, fromScan }
      shipInput: '', // ② 出货码
      step: 'agg', // 两步状态机：agg 待扫聚合码 / ship 待扫出货码
      scanVisible: false,
      saving: false,
      list: [], // 出货绑定清单（时间倒序）
      lastMsg: { type: '', text: '' }
    };
  },
  async created () {
    // 扫码枪逐行缓冲（非响应式实例字段，仅内部累积用）
    this._aggBufLines = [];
    this._aggBufTimer = null;
    await this.refreshAll();
  },
  mounted () {
    // 扫码枪全局监听（键盘 HID 模式）：页面任意位置扫码即填当前步骤
    this._stopGun = createScannerGun(this.onGunCode);
  },
  beforeDestroy () {
    if (this._stopGun) {
      this._stopGun();
      this._stopGun = null;
    }
    clearTimeout(this._aggBufTimer); // 未收尾的聚合码缓冲随页面销毁一并丢弃
  },
  methods: {
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
        const [history, list] = await Promise.all([listAggCodes(50), listShipments(100)]);
        this.history = history;
        this.list = list;
      } catch (e) {
        this.say('warn', '读取出货绑定数据失败：' + e.message);
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
     * 按当前步骤填码：agg 步收聚合码（摄像头整段多行 / 扫码枪逐行上报）；
     * ship 步收出货码，两码齐即自动保存（扫码连扫节奏无需再点按钮）
     */
    fillByStep (raw) {
      const code = String(raw || '').trim();
      if (!code) return;
      if (this.step === 'agg') {
        if (code.indexOf('\n') >= 0) {
          // 摄像头整段扫入：直接解析
          const text = code.replace(/\r\n/g, '\n');
          const parsed = parseAggContent(text);
          if (!parsed) {
            return this.say('warn', '第 ① 步应扫聚合二维码（' + AGG_HEADER + ' 开头的多行码），已忽略');
          }
          this.resolveAggDoc(text, parsed.codes);
        } else {
          this.bufferAggLine(code); // 扫码枪逐行上报：进缓冲
        }
        return;
      }
      // ship 步：扫到聚合码内容说明扫错对象（扫了另一个箱的聚合码），提示不误绑
      if (code.indexOf('\n') >= 0) {
        return this.say('warn', '第 ② 步应扫出货码（4码），已忽略多行聚合码内容');
      }
      this.shipInput = code;
      this.saveShip(); // 两码齐自动保存
    },
    /* ---------- 聚合码载入（第 ① 步） ---------- */
    onPickAgg (id) {
      const hit = this.history.find(h => h.id === id);
      if (!hit) return;
      this.applyAgg({
        title: hit.title,
        content: hit.content,
        codes: hit.codes.slice(),
        createdAt: hit.createdAt,
        doc: hit,
        fromScan: false
      });
    },
    /**
     * 扫码枪对多行聚合码按行逐条上报（每行一次 Enter 终止）：
     * 以标识行开启缓冲累积成员行，静默 400ms 视为整段结束再解析
     */
    bufferAggLine (line) {
      if (line.toUpperCase() === AGG_HEADER) {
        this._aggBufLines = [line]; // 新一段聚合码开始
      } else if (this._aggBufLines && this._aggBufLines.length) {
        this._aggBufLines.push(line);
      } else {
        return this.say('warn', '第 ① 步应扫聚合二维码（' + AGG_HEADER + ' 开头的多行码），已忽略：' + line);
      }
      clearTimeout(this._aggBufTimer);
      this._aggBufTimer = setTimeout(() => this.flushAggBuffer(), 400);
    },
    /** 缓冲整段解析：拼回原文 → parseAggContent → 回查落库记录 */
    flushAggBuffer () {
      clearTimeout(this._aggBufTimer);
      const lines = this._aggBufLines || [];
      this._aggBufLines = [];
      if (!lines.length) return;
      const text = lines.join('\n');
      const parsed = parseAggContent(text);
      if (!parsed) return this.say('warn', '聚合码内容解析失败，请重新扫描');
      this.resolveAggDoc(text, parsed.codes);
    },
    async resolveAggDoc (text, codes) {
      try {
        // 原文精确回查落库记录（取标题/创建时间）；外来聚合码无记录也可继续绑出货码
        const doc = await findAggByContent(text);
        this.applyAgg({
          title: doc ? doc.title : '',
          content: text,
          codes: codes,
          createdAt: doc ? doc.createdAt : '',
          doc: doc,
          fromScan: true
        });
      } catch (e) {
        this.say('warn', '载入聚合码失败：' + e.message);
      }
    },
    applyAgg (info) {
      this.aggInfo = info;
      this.aggPick = info.doc ? info.doc.id : null;
      this.step = 'ship';
      this.say('ok', '聚合码已载入（' + info.codes.length + ' 对），请扫出货码');
    },
    clearAgg () {
      this.aggInfo = null;
      this.aggPick = null;
      this.step = 'agg';
    },
    clearPair () {
      this.clearAgg();
      this.shipInput = '';
      this.say('', '');
    },
    /* ---------- 出货绑定保存（第 ② 步，套娃第 4 级核心） ---------- */
    async saveShip () {
      const shipCode = this.shipInput.trim();
      if (!this.aggInfo) return this.say('warn', '请先扫/选聚合码（第 ① 步）');
      if (!shipCode) return;
      if (shipCode.indexOf('\n') >= 0) {
        return this.say('warn', '出货码应为单行码，请核对后重扫');
      }
      this.saving = true;
      try {
        // 重绑即覆盖：saveShipment 内部先删同出货码旧关系再写入
        await saveShipment({
          shipmentCode: shipCode,
          aggContent: this.aggInfo.content,
          aggTitle: this.aggInfo.title,
          createdAt: this.nowStr()
        });
        this.say('ok', '出货绑定成功：' + shipCode + ' ← ' +
          (this.aggInfo.title || '（未命名聚合）') + '（' + this.aggInfo.codes.length + ' 对）');
        // 自动进入下一箱：清空聚合码与出货码、回到第 ① 步
        this.clearPair();
        await this.refreshAll();
      } catch (e) {
        this.say('warn', '保存失败：' + e.message);
      } finally {
        this.saving = false;
      }
    },
    /* ---------- 绑定清单 ---------- */
    removeShip (row) {
      this.$confirm('删除出货绑定：' + row.shipmentCode + ' ← ' +
        (row.aggTitle || '（未命名聚合）') + '？', '解绑', { type: 'warning' })
        .then(() => deleteShipment(row.id))
        .then(() => this.refreshAll())
        .then(() => this.$message.success('已删除'))
        .catch(e => {
          if (e && e.message) this.$message.error(e.message);
        });
    }
  }
};
</script>

<style lang="less" scoped>
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
  width: 84px;
  text-align: right;
  font-size: 13px;
  color: #666;
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

  .agg-pick {
    width: 280px;
  }

  .ship-input {
    width: 380px;
  }
}

.agg-loaded {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  margin: 0 0 8px 94px;
  font-size: 14px;
  color: #333;

  i {
    margin-right: 6px;
    color: #409eff;
  }

  .agg-sub {
    margin-left: 10px;
    font-size: 12px;
    color: #999;
  }
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px 94px;
  max-height: 120px;
  overflow: auto;

  .member-item {
    padding: 2px 10px;
    background: #f0f5ff;
    border: 1px solid #adc6ff;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
}

.btn-row {
  .tip-text {
    font-size: 12px;
    color: #999;
  }
}

.ship-msg {
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

  .rec-count {
    font-size: 13px;
    color: #666;
  }
}

.danger-link {
  color: #f5222d;
}
</style>
