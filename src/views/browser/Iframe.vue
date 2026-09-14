<template>
  <demo-page
    title="iframe 跨窗口通信"
    description="微前端、富文本编辑器、第三方嵌入、广告沙箱……只要涉及 iframe 就绕不开窗口间通信。本页带一个可运行的同源 iframe 演示：postMessage 双向收发、contentDocument 直接读写、定向回信协议，一次看全。">
    <demo-block
      :index="1"
      title="窗口引用链 —— 先拿到窗口，才能通信"
      description="iframe 通信的第一步永远是拿到目标 window 的引用，四条路径各管一段：">
      <div class="ref-chain">
        <div class="ref-item">
          <b>iframe.contentWindow</b>
          <span>父 → 子：拿到内嵌 iframe 的 window 对象（postMessage / 同源直接调用）</span>
        </div>
        <div class="ref-item">
          <b>iframe.contentDocument</b>
          <span>父 → 子 DOM：contentWindow.document 的快捷方式，<b>仅同源</b>可访问</span>
        </div>
        <div class="ref-item">
          <b>window.parent</b>
          <span>子 → 父：上一层窗口；跨域时只能 postMessage，不能碰它的 DOM</span>
        </div>
        <div class="ref-item">
          <b>window.top / window.frames</b>
          <span>top 是最顶层窗口（多层嵌套防「iframe 劫持」用它判断）；frames[i] 按索引取子窗口</span>
        </div>
      </div>
      <ul class="point-list">
        <li><b>同源 vs 跨域的分界</b> —— 同源：contentWindow / contentDocument 随便用，函数互调、DOM 互改都行；跨域：只剩 postMessage 一条路，强访问直接抛 <b>SecurityError</b></li>
        <li><b>onload 时机</b> —— 访问 iframe 内容必须等 load 事件（或子页 ready 回执）；load 前拿 contentDocument 可能是 about:blank 的空文档</li>
        <li><b>src about:blank</b> —— 未设 src 的 iframe 继承父页面源，仍可直访；设了跨域 src 后浏览器立刻切换源并锁权限</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="可运行演示 —— 同源 iframe 双向通信"
      description="下方真实嵌入了一个 iframe 子页面（public/iframe-child.html，原生实现）。父页按钮演示 postMessage 指令与同源直访；子页内按钮演示子 → 父发消息：">
      <div class="demo-row">
        <el-input v-model="msgText" size="small" style="width: 220px" placeholder="要发送的文本" />
        <el-button type="primary" size="small" @click="sendText">postMessage 文本 → 子页</el-button>
        <el-button type="warning" size="small" @click="sendSetCount">postMessage 指令 setCount → 子页</el-button>
        <el-button size="small" @click="requestCount">请求数据（echo 协议）</el-button>
      </div>
      <div class="demo-row">
        <el-button type="success" size="small" @click="readChildDom">同源直读子页 DOM</el-button>
        <el-button type="success" size="small" @click="writeChildDom">同源直改子页 DOM</el-button>
        <el-button size="small" @click="callChildApi">直调子页 window.childApi</el-button>
        <el-button size="small" @click="logs = []">清空日志</el-button>
      </div>
      <div class="iframe-wrap">
        <iframe
          ref="child"
          src="/iframe-child.html"
          class="child-frame"
          title="iframe 通信演示子页面"
          @load="onIframeLoad" />
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-dir">{{ log.type === 'out' ? '父→子' : log.type === 'in' ? '子→父' : '系统' }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（父页面日志：点击上方按钮，或点子页面里的按钮观察双向通信）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="postMessage 标准用法与安全要点"
      description="跨窗口通信的事实标准（Worker / iframe / window.open 弹窗通用）："
      :code="codePostMessage">
      <ul class="point-list">
        <li><b>targetOrigin 必须写具体源</b> —— 写 <b>'*'</b> 意味着任何嵌入你的页面都能收到（数据泄露）；同源可写 '/'；写错源消息<b>静默丢弃</b>不报错，排查时优先怀疑它</li>
        <li><b>收方三件套校验</b> —— e.origin（来源白名单）/ e.source（回信目标，别用 window.parent 猜）/ e.data（按 type 分发 + 结构校验，绝不 eval 或直接 innerHTML）</li>
        <li><b>回信要定向</b> —— e.source.postMessage(data, e.origin)，多层嵌套时 parent ≠ 发送者，用 e.source 才不会回错窗口</li>
        <li><b>Transferable</b> —— 第三个参数转移 ArrayBuffer 所有权，大块二进制跨窗口零拷贝（与 Worker 通信同一套机制）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="4"
      title="跨域通信方案演进 —— postMessage 之前的世界"
      description="历史上跨域 iframe 传数据的野路子，面试常考，现代项目只留 postMessage：">
      <ul class="point-list">
        <li><b>location.hash 轮询</b> —— 数据塞进子页 URL 的 # 后面，子页 setInterval 轮询自身 hash 变化；容量小、暴露在 URL、靠轮询费性能，但当年是唯一选择</li>
        <li><b>window.name 中转</b> —— window.name 在页面跳转后仍保留（约 2MB 容量）：子页先设 name 再跳回同源代理页，父页读代理页的 name；两次跳转的时序坑极多</li>
        <li><b>document.domain 降域</b> —— a.foo.com 与 b.foo.com 都设 document.domain='foo.com' 即可互访；只对<b>父子域</b>有效，且已被 Chrome 标记废弃（SameSite 时代易被绕过），新代码别用</li>
        <li><b>服务端代理</b> —— 与其让两个前端窗口通信，不如让 iframe 只跟自己后端通信（CORS 放行），数据经服务端中转，最稳但多一跳</li>
        <li><b>BroadcastChannel（现代补充）</b> —— 同源下多窗口 / 多 iframe 广播利器，比 postMessage 少一层握手；跨标签页同步见 /storage 模块</li>
        <li><b>SharedWorker（现代补充）</b> —— 多窗口共享一个 Worker 做消息中枢，适合高频双向同步（如多标签页协同编辑）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="5"
      title="嵌入与被嵌入 —— 安全属性速查"
      description="通信之外，iframe 的攻防边界同样重要：">
      <ul class="point-list">
        <li><b>sandbox 属性（嵌入方控制）</b> —— 不写则子页全权限；写了默认全禁，再按需放行：allow-scripts（跑 JS）/ allow-same-origin（保留源，与 allow-scripts 同用等于没沙箱，慎）/ allow-forms / allow-popups 等</li>
        <li><b>X-Frame-Options（被嵌入方响应头）</b> —— DENY 拒绝任何嵌入 / SAMEORIGIN 仅同源可嵌，防点击劫持的经典手段</li>
        <li><b>CSP frame-ancestors（现代替代）</b> —— 支持多域名白名单与协议匹配，优先级高于 X-Frame-Options</li>
        <li><b>iframe 劫持自检</b> —— 子页可用 <code>window.top !== window.self</code> 检测被恶意嵌入，配合 top.location = self.location 跳出（现代站更该配 frame-ancestors）</li>
        <li><b>loading="lazy"</b> —— 视口外的 iframe 延迟加载，首屏有大量 iframe（广告 / 埋点）时收益明显</li>
        <li><b>内存与销毁</b> —— 动态创建的 iframe 用完必须 remove 并置 src="about:blank"，否则其中的定时器 / 监听器会拖住整个页面不释放</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'BrowserIframe',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      msgText: 'hello 子页面',
      logs: [],
      iframeReady: false,
      codePostMessage: `// ---- 父页面 → iframe ----
const frame = document.querySelector('iframe');

// targetOrigin 写子页真实源；'*' 任何源都能收到（仅限不敏感数据）
frame.contentWindow.postMessage(
  { type: 'setCount', value: 42 },   // 传结构化对象，按 type 分发
  'https://child.example.com'
);

// ---- 父页面收消息 ----
window.addEventListener('message', (e) => {
  // 校验①：来源白名单，不过直接丢弃
  if (e.origin !== 'https://child.example.com') return;
  // 校验②：消息结构，只认白名单 type
  if (e.data && e.data.type === 'countChanged') {
    console.log('子页回执：', e.data.value);
  }
});

// ---- 子页面（iframe 内）----
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://parent.example.com') return;
  if (e.data && e.data.type === 'setCount') {
    render(e.data.value);
    // 回信必须定向：e.source 是发送方窗口，e.origin 是它的源
    e.source.postMessage({ type: 'countChanged', value: 0 }, e.origin);
  }
});

// 子 → 父主动发消息：window.parent（跨域时唯一的"引用"用法）
window.parent.postMessage({ type: 'hello' }, 'https://parent.example.com');

// ---- 同源时的特权写法（跨域全部抛 SecurityError）----
frame.contentDocument.getElementById('count').textContent = '42'; // 直改 DOM
frame.contentWindow.childApi.reset();                             // 直调函数
const val = frame.contentWindow.childApi.getCount();              // 直取返回值`
    };
  },
  mounted () {
    // 技术点：message 监听挂在 window 上，组件销毁必须摘除，否则其他页面的消息会串进来
    window.addEventListener('message', this.onMessage);
  },
  beforeDestroy () {
    window.removeEventListener('message', this.onMessage);
  },
  methods: {
    log (text, type) {
      const t = new Date();
      const time = t.toTimeString().slice(0, 8) + '.' + ('00' + t.getMilliseconds()).slice(-3);
      this.logs.push({ time, text, type });
    },
    // 父页面收消息：校验 origin（本演示同源，校验 location.origin 即可）
    onMessage (e) {
      if (e.origin !== location.origin) return;
      // 技术点：e.source 校验 —— 只认我们那个 iframe 发来的消息
      if (this.$refs.child && e.source !== this.$refs.child.contentWindow) return;
      const data = e.data;
      const text = typeof data === 'object' ? JSON.stringify(data) : String(data);
      this.log(`收到子页消息 ${text}（e.origin=${e.origin}）`, 'in');
    },
    onIframeLoad () {
      this.iframeReady = true;
      this.log('iframe onload —— 此后访问 contentDocument 才是子页真实文档', 'sys');
    },
    sendText () {
      this.$refs.child.contentWindow.postMessage(this.msgText, location.origin);
      this.log(`postMessage 文本 "${this.msgText}"（targetOrigin=${location.origin}）`, 'out');
    },
    sendSetCount () {
      const value = Math.floor(Math.random() * 100);
      this.$refs.child.contentWindow.postMessage({ type: 'setCount', value }, location.origin);
      this.log(`postMessage 指令 setCount=${value}，等子页 countChanged 回执`, 'out');
    },
    // echo 协议：请求-响应模式，靠 type 区分指令与回执
    requestCount () {
      if (!this.iframeReady) {
        this.log('iframe 尚未 load 完成，稍后再试', 'sys');
        return;
      }
      this.$refs.child.contentWindow.postMessage({ type: 'getCount' }, location.origin);
      this.log('已发 getCount，等待子页回信 count…', 'out');
    },
    // 同源特权①：直接读子页 DOM —— 跨域时这一行抛 SecurityError
    readChildDom () {
      try {
        const doc = this.$refs.child.contentDocument;
        const val = doc.getElementById('count').textContent;
        this.log(`直读子页 DOM 成功：counter=${val}（contentDocument.getElementById）`, 'out');
      } catch (err) {
        this.log(`直读失败：${err.name} —— 跨域时就是这样`, 'sys');
      }
    },
    // 同源特权②：直接改子页 DOM
    writeChildDom () {
      try {
        const doc = this.$refs.child.contentDocument;
        const el = doc.getElementById('count');
        el.textContent = Number(el.textContent) + 1000;
        el.classList.add('flash');
        this.log('直改子页 DOM：counter +1000（子页日志也会同步记录）', 'out');
      } catch (err) {
        this.log(`直改失败：${err.name}`, 'sys');
      }
    },
    // 同源特权③：直接调用子页暴露的函数，还能拿返回值
    callChildApi () {
      try {
        const api = this.$refs.child.contentWindow.childApi;
        const version = api.version;
        const count = api.getCount();
        this.log(`直调 childApi 成功：version=${version}，getCount()=${count}（跨域时 contentWindow 是受限代理）`, 'out');
      } catch (err) {
        this.log(`直调失败：${err.name}`, 'sys');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.ref-chain {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;

  .ref-item {
    flex: 1;
    min-width: 220px;
    padding: 10px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fafafa;

    b {
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
      color: #1890ff;
      font-family: Consolas, Monaco, monospace;
    }

    span {
      font-size: 12px;
      line-height: 1.6;
      color: #888;
    }
  }
}

.iframe-wrap {
  margin-bottom: 12px;
  border: 1px dashed #91d5ff;
  border-radius: 4px;
  background: #f0f9ff;
  padding: 6px;

  .child-frame {
    display: block;
    width: 100%;
    height: 320px;
    border: 0;
    border-radius: 3px;
    background: #fff;
  }
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
    flex-shrink: 0;
  }

  .log-dir {
    flex-shrink: 0;
    font-size: 12px;
  }

  .out { color: #52c41a; }
  .in { color: #1890ff; }
  .sys { color: #888; }

  .out .log-dir { color: #52c41a; }
  .in .log-dir { color: #1890ff; }
  .sys .log-dir { color: #bbb; }

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

  code {
    padding: 1px 6px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    color: #c7254e;
  }
}
</style>
