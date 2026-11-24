<template>
  <demo-page title="聚合二维码（3码）" description="扫多个油墨追溯码（2码）聚合进一个二维码：内容自包含全部 2码（任何扫码器可读出），本项目扫码后自动反查各自绑定的产品PVD码（1码）；聚合码再由下一道工序绑定到出货码（4码）。">
    <!-- 区块 1：新建聚合码（套娃第 3 级：扫 2码 → 带出 1↔2 对 → 生成聚合码） -->
    <demo-block :index="1" title="新建聚合码" description="扫油墨追溯码（2码）自动带出绑定的产品PVD码（1码）成对入列；也可扫/输产品PVD码反向带出。勾选成员后生成聚合二维码。">
      <div class="agg-bar">
        <el-input v-model="title" size="small" class="agg-title" placeholder="聚合标题，如：11月24日发运-2号箱" />
        <el-input v-model="manualInput" size="small" class="agg-input"
          placeholder="扫/输油墨追溯码（2码）或产品PVD码（1码）后回车" @keyup.enter.native="addManual" />
        <el-button size="small" @click="addManual">添加</el-button>
        <el-button size="small" icon="el-icon-camera" @click="scanVisible = true">扫码添加</el-button>
        <el-button type="primary" size="small" icon="el-icon-full-screen" :loading="generating"
          :disabled="!selectedCodes.length" @click="generate">生成聚合二维码（{{ selectedCodes.length }} 对）</el-button>
      </div>
      <div class="gun-tip">扫码枪在页面任意位置扫码即添加，无需聚焦输入框</div>
      <el-table ref="memberTable" :data="members" size="mini" border max-height="360"
        @selection-change="onSelectionChange">
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="labelCode" label="油墨追溯码（2码）" min-width="180">
          <template slot-scope="{ row }">
            <span :title="row.labelCode">{{ row.labelCode }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品PVD码（1码）" min-width="150">
          <template slot-scope="{ row }">
            <span v-if="row.digitCode">{{ row.digitCode }}</span>
            <span v-else class="pair-none">未绑定产品PVD码</span>
          </template>
        </el-table-column>
        <el-table-column label="所属文档" width="160">
          <template slot-scope="{ row }">{{ row.docName || '未分组' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" class="danger-link" @click="removeMember(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </demo-block>

    <!-- 区块 2：聚合码结果（预览 / 下载 / 复制；下一道工序扫此码绑定出货码） -->
    <demo-block v-if="aggResult" :index="2" title="聚合二维码结果" description="内容首行为 HYX-AGG 标识行，其后每行一个油墨追溯码（2码）；打印后贴箱，下一道工序扫它绑出货码。">
      <div class="agg-result">
        <div class="qr-box">
          <img :src="aggResult.dataUrl" alt="聚合二维码" class="qr-img" />
          <div class="qr-meta">{{ aggResult.title }} · {{ aggResult.codes.length }} 对 · {{ aggResult.createdAt }}</div>
        </div>
        <div class="agg-actions">
          <el-button size="small" icon="el-icon-download" @click="downloadQr">下载 PNG</el-button>
          <el-button size="small" icon="el-icon-document-copy" @click="copyContent">复制内容</el-button>
          <el-button type="primary" size="small" icon="el-icon-position" @click="$router.push('/ship')">去绑出货码</el-button>
        </div>
        <div class="agg-content">{{ aggResult.content }}</div>
      </div>
    </demo-block>

    <!-- 区块 3：历史聚合码（落库回查；已绑出货码的聚合码删除前提示） -->
    <demo-block :index="3" title="历史聚合码" description="聚合关系落本机库，可重新预览二维码或查看成员明细；删除仅删聚合关系，不影响码对绑定。">
      <div class="rec-bar">
        <el-button size="small" icon="el-icon-refresh" @click="refreshAll">刷新</el-button>
      </div>
      <el-table :data="history" size="mini" border>
        <el-table-column type="expand">
          <template slot-scope="{ row }">
            <div class="member-list">
              <div v-for="c in row.codes" :key="c" class="member-item">{{ c }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="聚合标题" min-width="200">
          <template slot-scope="{ row }">{{ row.title || '（未命名聚合）' }}</template>
        </el-table-column>
        <el-table-column label="成员对数" width="90" align="center">
          <template slot-scope="{ row }">{{ row.codes.length }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="150" align="center">
          <template slot-scope="{ row }">
            <el-button type="text" size="mini" @click="previewAgg(row)">重新预览</el-button>
            <el-button type="text" size="mini" class="danger-link" @click="removeAgg(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </demo-block>

    <scan-dialog :visible.sync="scanVisible" :continuous="true"
      tip="对准油墨追溯码（2码）自动带出产品PVD码成对入列；识别一个添加一个" @scan="onScanCode" />
  </demo-page>
</template>

<script>
/**
 * 聚合二维码页（四级套娃第 3 级，v7）
 *
 * 业务链：1码(产品PVD码)↔2码(油墨追溯码) 已在码对绑定页落库 → 本页由下一道工序的
 * 操作员**扫 2码** 从库中带出 1↔2 对，聚合成一个二维码（3码）→ 打印贴箱 →
 * 再下一道工序扫 3码 绑定出货码（4码，见 ShipBind 页）。
 *
 * 聚合码内容自包含：首行 HYX-AGG 标识行 + 每行一个 2码——通用扫码器即可读出全部成员；
 * 本系统扫码（溯源查询页）按成员逐个反查码对，成对展示 1↔2。聚合关系落 agg-codes 仓
 * （codes multiEntry 索引支撑成员反查，content 索引支撑扫码精确回查）。
 */
import QRCode from 'qrcode';
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
import ScanDialog from '@/components/ScanDialog';
// 聚合码内容编解码与 PVD 码校验：生成端 / 查询端共享的唯一事实来源（src/common/qc-code-rules.js）
import { buildAggContent, isDigitCode } from '@/common/qc-code-rules';
import {
  findPairByDigit, findPairByLabel,
  saveAggCode, listAggCodes, deleteAggCode, findShipmentsByAgg
} from '@/common/qc-db';

// 聚合码内容长度上限（字符）：qrcode byte 模式 + 纠错 M 上限约 2953 字节，
// 每行一个 2码 预留 41 字节估（40 位码 + 换行），2000 字符约容纳 48 对且留足余量
const MAX_CONTENT_LEN = 2000;

export default {
  components: { DemoPage, DemoBlock, ScanDialog },
  data () {
    return {
      title: this.defaultTitle(),
      manualInput: '',
      scanVisible: false,
      members: [], // 聚合成员 [{ labelCode(2码), digitCode(1码), docName }]，按 2码 去重
      selectedRows: [], // 勾选的成员行（生成范围，默认全选）
      generating: false,
      aggResult: null, // 最近生成/预览的聚合码 { title, content, dataUrl, codes, createdAt }
      history: [] // 历史聚合码记录
    };
  },
  computed: {
    /** 生成范围 = 勾选成员的 2码 列表（保持成员顺序，聚合码内容逐行有序） */
    selectedCodes () {
      return this.members.filter(m => this.isRowSelected(m)).map(m => m.labelCode);
    }
  },
  async created () {
    await this.refreshAll();
  },
  methods: {
    defaultTitle () {
      const d = new Date();
      const p2 = n => (n < 10 ? '0' + n : '' + n);
      return '聚合-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' +
        p2(d.getHours()) + p2(d.getMinutes()) + p2(d.getSeconds());
    },
    /** 勾选状态按 2码 判定（成员数组重建后 el-table 的行对象引用会变） */
    isRowSelected (row) {
      const map = {};
      this.selectedRows.forEach(r => { map[r.labelCode] = true; });
      return !!map[row.labelCode];
    },
    onSelectionChange (rows) {
      this.selectedRows = rows;
    },
    say (msg, type) {
      this.$message({ message: msg, type: type || 'info' });
    },
    nowStr () {
      const d = new Date();
      const p2 = n => (n < 10 ? '0' + n : '' + n);
      return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' +
        p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
    },
    async refreshAll () {
      try {
        this.history = await listAggCodes(50);
      } catch (e) {
        this.say('读取聚合数据失败：' + e.message, 'error');
      }
    },
    /* ---------- 成员管理（扫 2码 驱动） ---------- */
    addManual () {
      const code = this.manualInput.trim();
      if (!code) return;
      this.manualInput = '';
      this.addOneCode(code);
    },
    onScanCode (code) {
      this.addOneCode(String(code || '').trim());
    },
    /**
     * 单码加入：纯数字按 1码 反查带出 2码；否则按 2码 查码对带出 1码，
     * 未绑定产品PVD码的 2码 允许加入但标注（聚合码照常生成，扫码展示时该对缺 1码）
     */
    async addOneCode (code) {
      if (!code) return;
      try {
        if (isDigitCode(code)) {
          const pair = await findPairByDigit(code);
          if (!pair) return this.say('该产品PVD码未绑定油墨追溯码，请先在「码对绑定」页完成 1↔2 绑定', 'warning');
          this.pushMember(pair);
          return;
        }
        const pair = await findPairByLabel(code);
        if (pair) {
          this.pushMember(pair);
        } else {
          this.say('油墨追溯码 ' + code + ' 未绑定产品PVD码，已入列并标注', 'warning');
          this.pushMember({ labelCode: code, digitCode: '', docName: '' });
        }
      } catch (e) {
        this.say('查询码对失败：' + e.message, 'error');
      }
    },
    /** 按 2码 去重入列并默认勾选（重复扫码静默忽略） */
    pushMember (pair) {
      const label = String(pair.labelCode || '').trim();
      if (!label) return;
      if (this.members.some(m => m.labelCode === label)) {
        this.say('油墨追溯码已在成员列表中：' + label, 'info');
        return;
      }
      const member = { labelCode: label, digitCode: String(pair.digitCode || ''), docName: String(pair.docName || '') };
      // join 前记既有勾选（成员数组重建后按 2码 恢复），新成员默认勾选
      const keepSelected = {};
      this.selectedRows.forEach(r => { keepSelected[r.labelCode] = true; });
      keepSelected[label] = true;
      this.members = this.members.concat([member]);
      this.$nextTick(() => {
        this.members.forEach(row => {
          if (this.$refs.memberTable && keepSelected[row.labelCode]) {
            this.$refs.memberTable.toggleRowSelection(row, true);
          }
        });
      });
      this.say('已添加：' + label + (member.digitCode ? ' ↔ ' + member.digitCode : ''), 'success');
    },
    removeMember (row) {
      this.members = this.members.filter(m => m.labelCode !== row.labelCode);
      this.selectedRows = this.selectedRows.filter(r => r.labelCode !== row.labelCode);
    },
    /* ---------- 生成聚合二维码（套娃第 3 级核心） ---------- */
    async generate () {
      const codes = this.selectedCodes;
      if (!codes.length) return this.say('请先勾选要聚合的油墨追溯码', 'warning');
      const content = buildAggContent(codes);
      if (content.length > MAX_CONTENT_LEN) {
        return this.say('成员过多（内容 ' + content.length + ' 字符，上限 ' + MAX_CONTENT_LEN + '），请减少成员或拆分多个聚合码', 'warning');
      }
      this.generating = true;
      try {
        const dataUrl = await QRCode.toDataURL(content, {
          width: 320, margin: 1, errorCorrectionLevel: 'M'
        });
        const title = this.title.trim() || this.defaultTitle();
        const createdAt = this.nowStr();
        await saveAggCode({
          title: title,
          content: content,
          codes: codes,
          createdAt: createdAt
        });
        this.aggResult = { title: title, content: content, dataUrl: dataUrl, codes: codes, createdAt: createdAt };
        this.say('聚合码已生成并落库（' + codes.length + ' 对），可打印贴箱后交下一道工序绑出货码', 'success');
        await this.refreshAll();
      } catch (e) {
        this.say('生成失败：' + e.message, 'error');
      } finally {
        this.generating = false;
      }
    },
    /* ---------- 结果操作 ---------- */
    downloadQr () {
      if (!this.aggResult) return;
      const a = document.createElement('a');
      a.href = this.aggResult.dataUrl;
      a.download = (this.aggResult.title || '聚合二维码') + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    copyContent () {
      if (!this.aggResult) return;
      const done = () => this.say('聚合码内容已复制到剪贴板', 'success');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.aggResult.content).then(done, () => this.fallbackCopy(done));
      } else {
        this.fallbackCopy(done);
      }
    },
    /** Clipboard API 不可用（file:// / 旧内核）时降级为隐藏 textarea 复制 */
    fallbackCopy (done) {
      const ta = document.createElement('textarea');
      ta.value = this.aggResult.content;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        done();
      } catch (e) {
        this.say('复制失败，请手动选择内容复制', 'warning');
      }
      document.body.removeChild(ta);
    },
    /* ---------- 历史聚合码 ---------- */
    async previewAgg (row) {
      try {
        const dataUrl = await QRCode.toDataURL(row.content, {
          width: 320, margin: 1, errorCorrectionLevel: 'M'
        });
        this.aggResult = {
          title: row.title,
          content: row.content,
          dataUrl: dataUrl,
          codes: row.codes.slice(),
          createdAt: row.createdAt
        };
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        this.say('生成二维码失败：' + e.message, 'error');
      }
    },
    removeAgg (row) {
      // 删除前反查出货绑定：聚合码已被绑到出货码时必须让操作员知情
      findShipmentsByAgg(row.content).then(ships => {
        const tip = ships.length
          ? '聚合码「' + (row.title || '未命名') + '」已绑定了 ' + ships.length + ' 个出货码，删除后扫出货码将无法展开成员。确认删除？'
          : '删除聚合码「' + (row.title || '未命名') + '」？仅删除聚合关系，成员的码对绑定不受影响。';
        this.$confirm(tip, '删除聚合码', { type: 'warning' })
          .then(() => deleteAggCode(row.id))
          .then(() => this.refreshAll())
          .then(() => this.say('已删除', 'success'))
          .catch(e => {
            if (e && e.message) this.say(e.message, 'error');
          });
      }).catch(() => {
        this.$confirm('删除聚合码「' + (row.title || '未命名') + '」？', '删除聚合码', { type: 'warning' })
          .then(() => deleteAggCode(row.id))
          .then(() => this.refreshAll())
          .then(() => this.say('已删除', 'success'))
          .catch(e => {
            if (e && e.message) this.say(e.message, 'error');
          });
      });
    }
  }
};
</script>

<style lang="less" scoped>
.agg-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;

  .agg-title {
    width: 260px;
  }

  .agg-input {
    width: 320px;
  }
}

.gun-tip {
  margin-bottom: 10px;
  font-size: 12px;
  color: #999;
}

.agg-result {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;

  .qr-box {
    text-align: center;
  }

  .qr-img {
    display: block;
    width: 320px;
    height: 320px;
  }

  .qr-meta {
    margin-top: 6px;
    font-size: 12px;
    color: #888;
  }

  .agg-actions {
    display: flex;
    gap: 8px;
  }

  .agg-content {
    width: 100%;
    padding: 10px 12px;
    background: #fafafa;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 160px;
    overflow: auto;
  }
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 16px;

  .member-item {
    padding: 2px 10px;
    background: #f0f5ff;
    border: 1px solid #adc6ff;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
}

.pair-none {
  color: #bfbfbf;
}

.rec-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.danger-link {
  color: #f5222d;
}
</style>
