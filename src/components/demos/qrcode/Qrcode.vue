<template>
  <demo-page
    title="二维码生成"
    description="数据 → 二维码核心链路：QRCode.toDataURL(text, options) 把文本渲染成 PNG（base64）。覆盖单条生成、批量标签卡片（二维码 + 明文编号，为检测标签铺路）、JSON 编码三个场景。">
    <demo-block
      :index="1"
      title="单条数据 → 二维码"
      description="输入任意文本实时生成。纠错级别越高越抗污损但容量越小，标签场景建议 M。"
      :code="singleCode">
      <div class="single-bar">
        <el-input v-model="text" size="small" class="text-input" placeholder="如 SN-20260911-001" clearable></el-input>
        <el-select v-model="ecl" size="small" class="ecl-select">
          <el-option v-for="item in eclOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-input-number v-model="size" size="small" :min="128" :max="512" :step="32"></el-input-number>
        <el-button size="small" type="primary" :disabled="!dataUrl" @click="download(dataUrl, safeName(text))">下载 PNG</el-button>
      </div>
      <div class="preview-wrap">
        <img v-if="dataUrl" :src="dataUrl" class="qr-img" alt="二维码预览">
        <p v-else class="empty-tip">（输入内容后实时生成）</p>
        <p v-if="errTip" class="err-tip">{{ errTip }}</p>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="批量数据 → 标签卡片"
      description="每行一条数据，批量生成「序号 + 二维码 + 明文编号」卡片 —— 明文用于人工核对防错贴。点击二维码可单独下载。"
      :code="batchCode">
      <el-input v-model="batchText" type="textarea" :rows="6" placeholder="每行一条数据"></el-input>
      <div class="batch-bar">
        <el-button size="small" type="primary" @click="generateBatch">生成标签（{{ batchLines.length }} 条）</el-button>
        <el-button size="small" :disabled="!cards.length" @click="downloadAll">下载全部二维码</el-button>
      </div>
      <div v-if="cards.length" class="card-grid">
        <div v-for="card in cards" :key="card.index" class="label-card">
          <span class="card-index">#{{ card.index }}</span>
          <img :src="card.dataUrl" class="card-img" title="点击下载" alt="二维码" @click="download(card.dataUrl, safeName(card.text))">
          <span class="card-text" :title="card.text">{{ card.text }}</span>
        </div>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="结构化数据（JSON）编码"
      description="整条检测记录 JSON.stringify 后编码，扫码即得全部数据。容量上限：纠错 L 约 2953 字节（UTF-8），超了就改用「编号 + 查询链接」。"
      :code="jsonCode">
      <div class="json-bar">
        <el-button size="small" type="primary" @click="generateJson">编码下方检测记录</el-button>
        <span v-if="jsonLen" class="json-len" :class="{ over: jsonLen > 2953 }">编码后 {{ jsonLen }} 字节 / 上限约 2953 字节</span>
      </div>
      <pre class="json-pre">{{ jsonRecord }}</pre>
      <div v-if="jsonDataUrl" class="preview-wrap">
        <img :src="jsonDataUrl" class="qr-img" alt="JSON 二维码">
        <p class="empty-tip">用手机扫一扫，能读出完整 JSON</p>
      </div>
    </demo-block>
  </demo-page>
</template>

<script>
import QRCode from 'qrcode';
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

// 统一生成参数：margin 为四周静区（模块数），标准建议 4，标签紧凑可用 2
const buildOptions = (size, ecl) => ({
  width: size,
  margin: 2,
  errorCorrectionLevel: ecl,
  color: { dark: '#000000', light: '#ffffff' }
});

export default {
  name: 'Qrcode',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      text: 'SN-20260911-001',
      ecl: 'M',
      eclOptions: [
        { value: 'L', label: 'L 纠错（容量最大）' },
        { value: 'M', label: 'M 纠错（推荐）' },
        { value: 'Q', label: 'Q 纠错' },
        { value: 'H', label: 'H 纠错（最抗污损）' }
      ],
      size: 256,
      dataUrl: '',
      errTip: '',
      batchText: 'SN-20260911-001\nSN-20260911-002\nSN-20260911-003\nSN-20260911-004\nSN-20260911-005',
      cards: [],
      jsonRecord: {
        sn: 'SN-20260911-001',
        model: 'X100-Plus',
        result: 'OK',
        items: [
          { name: '耐压测试', value: '3.2kV', judge: 'OK' },
          { name: '绝缘电阻', value: '520MΩ', judge: 'OK' }
        ],
        date: '2026-09-11 08:32:15',
        line: 'A线-3号机'
      },
      jsonDataUrl: '',
      jsonLen: 0,
      singleCode: `import QRCode from 'qrcode';

// 文本 → PNG dataURL（base64），可直接给 <img :src>
const dataUrl = await QRCode.toDataURL('SN-20260911-001', {
  width: 256,                // 输出图片宽度 px
  margin: 2,                 // 四周静区（模块数）
  errorCorrectionLevel: 'M', // 纠错级别 L/M/Q/H
  color: { dark: '#000', light: '#fff' }
});

// 下载：a 标签 + download 属性
const a = document.createElement('a');
a.href = dataUrl;
a.download = 'SN-20260911-001.png';
a.click();`,
      batchCode: `// 批量：数组 → Promise.all 并发生成
const lines = ['SN-001', 'SN-002', 'SN-003'];
const urls = await Promise.all(
  lines.map(t => QRCode.toDataURL(t, { width: 200, margin: 2 }))
);
// urls[i] 即第 i 条数据的二维码，配合明文编号排版成标签`,
      jsonCode: `// 结构化数据：JSON.stringify 后编码，扫码即得全量数据
const str = JSON.stringify(record);

// 容量检查：QR 最大约 2953 字节（UTF-8，纠错 L）
const bytes = new Blob([str]).size;
if (bytes > 2953) throw new Error('超容量，改用「编号 + 查询链接」');

const dataUrl = await QRCode.toDataURL(str, { errorCorrectionLevel: 'L' });`
    };
  },
  computed: {
    batchLines () {
      return this.batchText.split('\n').map(l => l.trim()).filter(Boolean);
    }
  },
  watch: {
    text: 'generateSingle',
    ecl: 'generateSingle',
    size: 'generateSingle'
  },
  created () {
    this.generateSingle();
  },
  methods: {
    async generateSingle () {
      if (!this.text) {
        this.dataUrl = '';
        this.errTip = '';
        return;
      }
      try {
        this.dataUrl = await QRCode.toDataURL(this.text, buildOptions(this.size, this.ecl));
        this.errTip = '';
      } catch (e) {
        this.dataUrl = '';
        this.errTip = '生成失败：' + e.message;
      }
    },
    async generateBatch () {
      const lines = this.batchLines;
      if (!lines.length) {
        this.cards = [];
        return;
      }
      const urls = await Promise.all(lines.map(t => QRCode.toDataURL(t, buildOptions(200, 'M'))));
      this.cards = lines.map((text, i) => ({ index: i + 1, text, dataUrl: urls[i] }));
    },
    async generateJson () {
      const str = JSON.stringify(this.jsonRecord);
      this.jsonLen = new Blob([str]).size; // UTF-8 字节数（中文 3 字节/字）
      this.jsonDataUrl = await QRCode.toDataURL(str, buildOptions(320, 'L'));
    },
    download (dataUrl, filename) {
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    downloadAll () {
      // 间隔触发，避免浏览器拦截多文件下载
      this.cards.forEach((c, i) => {
        setTimeout(() => this.download(c.dataUrl, this.safeName(c.text)), i * 300);
      });
    },
    safeName (text) {
      return String(text).replace(/[\\/:*?"<>|]/g, '_') + '.png';
    }
  }
};
</script>

<style lang="less" scoped>
.single-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  .text-input { width: 260px; }
  .ecl-select { width: 170px; }
}

.preview-wrap {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 20px;

  .qr-img {
    width: 220px;
    height: 220px;
    padding: 8px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }

  .empty-tip { font-size: 13px; color: #999; }
  .err-tip { font-size: 13px; color: #f5222d; }
}

.batch-bar { margin-top: 12px; }

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.label-card {
  position: relative;
  width: 150px;
  padding: 10px 8px;
  text-align: center;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;

  .card-index {
    position: absolute;
    top: 4px;
    left: 6px;
    font-size: 12px;
    color: #999;
  }

  .card-img {
    display: block;
    width: 120px;
    height: 120px;
    margin: 0 auto;
    cursor: pointer;
  }

  .card-text {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.json-bar {
  display: flex;
  align-items: center;
  gap: 16px;

  .json-len { font-size: 13px; color: #666; }
  .json-len.over { color: #f5222d; }
}

.json-pre {
  margin: 12px 0 0;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.7;
  color: #595959;
  background: #fafafa;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
