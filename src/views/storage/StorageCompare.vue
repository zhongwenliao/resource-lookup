<template>
  <demo-page
    title="浏览器存储方案对比"
    description="cookie / localStorage / sessionStorage / IndexedDB / Cache Storage 各有边界：容量、过期、跨标签页、异步。选错方案是「登出后数据残留」「标签页不同步」这类诡异 bug 的常见根源。">
    <demo-block
      :index="1"
      title="localStorage / sessionStorage 实测"
      description="写入、读取、跨标签页行为一次看全（打开两个浏览器标签页对比）："
      code="// localStorage：持久化，同源所有标签页共享
localStorage.setItem('key', JSON.stringify({ time: Date.now() }));
const data = JSON.parse(localStorage.getItem('key') || 'null');

// sessionStorage：标签页隔离 —— 新标签页（非同标签打开）读不到
sessionStorage.setItem('key', '只在当前标签页可见');

// 技术点：storage 事件 —— 只在其他标签页触发（本页写入本页不触发）
window.addEventListener('storage', e => {
  // e.key / e.oldValue / e.newValue / e.storageArea
});">
      <div class="demo-row">
        <el-button size="small" type="primary" @click="writeStorage">写入两个存储</el-button>
        <el-button size="small" @click="readStorage">读取</el-button>
        <el-button size="small" @click="clearStorage">清空</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text" :class="log.type">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（操作上方按钮，观察读写与跨页事件）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="五类存储能力矩阵"
      description="选型速查（容量为 Chrome 参考值）：">
      <ul class="point-list">
        <li><b>cookie</b> —— 4KB；每次同源请求自动携带（浪费带宽）；可设过期 / domain / path / httpOnly / secure / sameSite；仅适合「需要服务端读取」的状态（会话 ID、CSRF token）</li>
        <li><b>localStorage</b> —— 约 5MB；持久化、同源共享、同步 API；存主题偏好 / token / 非敏感配置；JSON 序列化存对象</li>
        <li><b>sessionStorage</b> —— 约 5MB；标签页隔离、关页即失；适合「一次会话」的草稿 / 向导步骤 / 临时筛选条件</li>
        <li><b>IndexedDB</b> —— 数百 MB 起；异步事务型数据库，支持索引 / 游标 / 二进制；离线应用 / 大数据缓存（本项目地图瓦片离线即此方案）</li>
        <li><b>Cache Storage</b> —— 配 Service Worker 的请求级缓存（Request/Response 对），PWA 离线的核心（见本项目 PWA 模块）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="生产踩坑清单"
      description="十年老兵的血泪经验：">
      <ul class="point-list">
        <li><b>storage 事件不触发本页</b> —— 想做「多标签页同步登出」：A 页写 localStorage，B 页监听 storage 事件刷新；但写入页自身不触发，别在这上面浪费时间排查</li>
        <li><b>JSON.parse 要兜底</b> —— localStorage 里存的是字符串，被用户 / 插件改坏后 JSON.parse 直接抛错，读取必须 try/catch + 默认值</li>
        <li><b>敏感数据别进 localStorage</b> —— XSS 一旦发生，localStorage 里的 token 直接被偷；httpOnly cookie（JS 读不到）+ 短有效期 + refresh 机制更稳</li>
        <li><b>容量超限静默失败</b> —— setItem 超额抛 QuotaExceededError，写操作要 try/catch；Safari 隐私模式下 setItem 直接抛错（历史上曾静默丢弃）</li>
        <li><b>同步 API 阻塞主线程</b> —— localStorage 读写是同步的，大 JSON（几百 KB）序列化会卡帧；高频读写考虑内存缓存 + 防抖落盘</li>
        <li><b>登出要清干净</b> —— localStorage / sessionStorage / IndexedDB / Cookie 各自独立，登出逻辑漏清一处就是数据残留事故</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

const LS_KEY = 'demo_storage_ls';
const SS_KEY = 'demo_storage_ss';

export default {
  name: 'StorageCompare',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      logs: []
    };
  },
  created () {
    // 技术点：storage 事件只在「其他标签页」修改时触发，本页写入不触发
    this._storageHandler = (e) => {
      if (e.key === LS_KEY) {
        this.log('storage', `其他标签页修改了 ${e.key}：${e.oldValue || '空'} → ${e.newValue || '空'}`);
      }
    };
    window.addEventListener('storage', this._storageHandler);
  },
  beforeDestroy () {
    window.removeEventListener('storage', this._storageHandler);
  },
  methods: {
    log (type, text) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      this.logs.unshift({ time, type, text });
      if (this.logs.length > 20) {
        this.logs.pop();
      }
    },
    writeStorage () {
      const payload = { time: Date.now(), from: '本页写入' };
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(payload));
        sessionStorage.setItem(SS_KEY, '只在当前标签页可见');
        this.log('write', `已写入 localStorage（${LS_KEY}）与 sessionStorage（${SS_KEY}）`);
        this.log('tip', '再开一个标签页到本页写入，本页会收到 storage 事件');
      } catch (e) {
        // 技术点：隐私模式 / 容量超限的兜底
        this.log('error', `写入失败：${e.name}（隐私模式或容量超限）`);
      }
    },
    readStorage () {
      try {
        const ls = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
        const ss = sessionStorage.getItem(SS_KEY);
        this.log('read', `localStorage：${ls ? JSON.stringify(ls) : '（空）'}`);
        this.log('read', `sessionStorage：${ss || '（空）'}`);
      } catch (e) {
        this.log('error', `读取解析失败：${e.message}（存储内容被改坏时要兜底）`);
      }
    },
    clearStorage () {
      localStorage.removeItem(LS_KEY);
      sessionStorage.removeItem(SS_KEY);
      this.log('write', '已清空两个 key');
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.msg-log {
  margin: 0;
  padding: 12px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  max-height: 240px;
  overflow-y: auto;
  font-size: 13px;

  li {
    display: flex;
    gap: 10px;
    line-height: 1.9;
  }

  .log-time {
    color: #bbb;
    font-size: 12px;
  }

  .log-text {
    color: #555;
    word-break: break-all;

    &.tip { color: #1890ff; }
    &.error { color: #f5222d; }
  }

  .empty {
    color: #bbb;
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
