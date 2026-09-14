<template>
  <demo-page
    title="浏览器进程与线程"
    description="为什么一个标签页崩溃不会拖垮整个浏览器？为什么 JS 是单线程？为什么长任务会卡死页面？答案都在浏览器的进程/线程模型里。本页带一个可运行的「主线程 vs Web Worker」对比演示，亲眼看页面冻结与流畅的差别。">
    <demo-block
      :index="1"
      title="浏览器多进程架构"
      description="以 Chrome 为例：浏览器是一个多进程协作的系统，每个进程各司其职：">
      <div class="arch">
        <div class="arch-row">
          <div class="arch-box arch-main">
            <b>Browser 浏览器主进程（唯一）</b>
            <span>地址栏 / 书签 / 前进后退 / 文件访问，负责协调调度其他所有进程</span>
          </div>
        </div>
        <div class="arch-row">
          <div class="arch-box arch-hl">
            <b>渲染进程（每标签页/站点一个）</b>
            <span>页面渲染 / JS 执行 / DOM 事件，本页主角，内部还有多个线程</span>
          </div>
          <div class="arch-box">
            <b>GPU 进程</b>
            <span>合成层绘制 / WebGL / 视频解码，独立于渲染进程</span>
          </div>
          <div class="arch-box">
            <b>网络进程</b>
            <span>网络请求收发（早期在 Browser 进程内，后拆出独立）</span>
          </div>
          <div class="arch-box">
            <b>插件进程</b>
            <span>每个插件独立进程，插件崩溃不拖垮浏览器</span>
          </div>
        </div>
      </div>
      <ul class="point-list">
        <li><b>为什么多进程</b> —— <b>稳定性</b>（渲染进程崩溃只挂一个标签页）/ <b>安全</b>（渲染进程跑在沙箱里，拿不到系统权限）/ <b>性能</b>（多核并行，进程间互不阻塞）</li>
        <li><b>站点隔离</b> —— 现代 Chrome 按「站点」而非「标签页」拆渲染进程，不同站点的 iframe 也各占一个进程，防止恶意页面读取隔壁站点的内存（Spectre 缓解手段之一）</li>
        <li><b>进程 vs 线程</b> —— 进程是资源分配单位（独立内存空间），线程是调度执行单位（共享所属进程的内存）；进程间通信要走 IPC，线程间直接读写共享内存（所以要多考虑竞态）</li>
        <li><b>更多进程</b> —— 打开任务管理器（Chrome 菜单 → 更多工具 → 任务管理器）能看到全部进程与内存占用，比任何文章都直观</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="渲染进程多线程"
      description="每个渲染进程内部的关键线程，以及它们如何互斥协作：">
      <ul class="point-list">
        <li><b>GUI 渲染线程</b> —— 解析 HTML/CSS、布局、绘制、合成；与 JS 引擎线程<b>互斥</b>：一个在跑，另一个挂起</li>
        <li><b>JS 引擎线程</b> —— V8 所在线程，单线程执行 JS；长任务霸占它时 GUI 挂起 → 掉帧卡顿（下方演示的核心）</li>
        <li><b>事件触发线程</b> —— 点击 / 键盘等事件到达后加入任务队列，等 JS 引擎空闲才执行回调 —— 所以卡顿期间你的点击不是丢了，是<b>排队</b>了（演示里能看到）</li>
        <li><b>定时器线程</b> —— setTimeout / setInterval 在这里计时，到点把回调放入任务队列（因此 setTimeout(fn, 0) 也至少要等当前任务跑完）</li>
        <li><b>HTTP 请求线程</b> —— XHR / fetch 的网络收发在独立线程，状态变化时回调入队，不阻塞 JS</li>
        <li><b>互斥的本质</b> —— JS 可以操作 DOM，若 GUI 正在绘制时 JS 同时改 DOM，画面就会撕裂；干脆互斥，这也是「JS 单线程」的根本原因</li>
        <li><b>注意</b> —— transform / opacity 动画会被提升到<b>合成器线程</b>执行，主线程忙时依然流畅；所以本页演示的旋转指针特意用 requestAnimationFrame 驱动（走主线程），冻结效果才真实可见</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="可运行演示 —— 主线程 vs Web Worker"
      description="旋转指针由 rAF（主线程）驱动。点「主线程计算」：指针冻结、点击全部排队；点「Worker 计算」：指针持续旋转、点击即时响应。计算期间请疯狂点「点我 +1」对比效果：">
      <div class="demo-row">
        <el-select v-model="count" size="small" style="width: 140px">
          <el-option :value="1e8" label="1 亿次（轻量）" />
          <el-option :value="5e8" label="5 亿次（标准）" />
          <el-option :value="1e9" label="10 亿次（重度）" />
        </el-select>
        <el-button type="danger" size="small" :disabled="busy" @click="runOnMain">主线程计算（会冻结）</el-button>
        <el-button type="primary" size="small" :disabled="busy" @click="runOnWorker">Worker 计算（不冻结）</el-button>
        <el-button size="small" @click="killWorker">销毁 Worker</el-button>
        <el-button size="small" @click="logs = []; clickCount = 0">清空日志</el-button>
      </div>
      <div class="status-bar">
        <span ref="spinner" class="spinner"></span>
        <span class="status-text">
          指针状态：<b>{{ busy ? (mode === 'main' ? '冻结中（GUI 被 JS 引擎阻塞）' : 'Worker 计算中，主线程空闲') : '正常旋转（rAF 驱动）' }}</b>
        </span>
        <el-button size="mini" type="warning" plain @click="onClickMe">点我 +1（已点 {{ clickCount }} 次）</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（点击上方按钮开始演示，计算期间狂点「点我 +1」观察排队差异）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="4"
      title="Web Worker 用法与进阶"
      description="把纯计算搬到独立线程的标准姿势（本页演示的真实实现）："
      :code="codeWorker">
      <ul class="point-list">
        <li><b>创建</b> —— new Worker(new URL('./process-worker.js', import.meta.url))，Vite / webpack5 构建期都会识别并单独打包 worker 文件</li>
        <li><b>通信是拷贝不是共享</b> —— postMessage 传参走<b>结构化克隆</b>（深拷贝），不能传函数 / DOM 节点；大 ArrayBuffer 可用 Transferable 转移所有权实现零拷贝</li>
        <li><b>真共享内存</b> —— SharedArrayBuffer + Atomics 可以让多线程读写同一块内存，但页面必须开启跨域隔离（COOP / COEP 响应头）</li>
        <li><b>三种 Worker</b> —— Dedicated（本页用的，页面私有）/ Shared（多标签页共享一个）/ Service（可拦截网络请求，PWA 离线缓存核心，见 /pwa 模块）</li>
        <li><b>Worker 的边界</b> —— 拿不到 window / document，不能操作 DOM；适合纯计算、数据清洗、图像编解码、大文件哈希（/upload 模块的秒传就是算 MD5 时用 Worker 防卡）</li>
        <li><b>进程间通信（IPC）</b> —— 浏览器各进程间走 Mojo / 管道消息传递；页面与 Worker 之间则是 postMessage，本质都是「消息传递」而非共享变量，天然避免竞态</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'BrowserProcess',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      count: 5e8,
      clickCount: 0,
      busy: false,
      mode: '', // main：主线程计算中 / worker：Worker 计算中
      logs: [],
      codeWorker: `// 主线程：创建 Worker（Vite 构建期自动单独打包 worker 文件）
const worker = new Worker(
  new URL('./process-worker.js', import.meta.url),
  { type: 'module' }
);

worker.onmessage = (e) => {
  // e.data 是 Worker 里 postMessage 的结构化克隆副本
  console.log('Worker 算完：', e.data.sum, '耗时', e.data.cost);
};

worker.postMessage({ count: 5e8 }); // 派发任务，主线程立即返回继续干活

worker.terminate(); // 用完主动销毁，释放线程资源

// ---- process-worker.js（Worker 线程内）----
// self.onmessage = (e) => {
//   const { count } = e.data;
//   let sum = 0;
//   for (let i = 0; i < count; i++) sum += i;
//   self.postMessage({ sum, cost: performance.now() - start });
// };`
    };
  },
  mounted () {
    this.startSpin();
  },
  beforeDestroy () {
    // 技术点：组件销毁必须清理 —— rAF 不取消会一直跑，Worker 不 terminate 会泄漏线程
    cancelAnimationFrame(this.rafId);
    if (this.worker) this.worker.terminate();
  },
  methods: {
    log (text, type) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0');
      this.logs.push({ time, text, type });
    },
    // rAF 驱动的旋转指针：回调在主线程执行，主线程被阻塞时动画立即冻结
    // （若用 CSS transform 动画会被合成器线程接管，冻结效果就看不到了）
    startSpin () {
      let start = null;
      const step = (t) => {
        if (start === null) start = t;
        const deg = ((t - start) / 800) * 360;
        if (this.$refs.spinner) {
          this.$refs.spinner.style.transform = `rotate(${deg}deg)`;
        }
        this.rafId = requestAnimationFrame(step);
      };
      this.rafId = requestAnimationFrame(step);
    },
    formatCount (n) {
      const map = { 1e8: '1 亿', 5e8: '5 亿', 1e9: '10 亿' };
      return map[n] || String(n);
    },
    heavyCalc (count) {
      const start = performance.now();
      let sum = 0;
      for (let i = 0; i < count; i++) sum += i;
      return { sum, cost: performance.now() - start };
    },
    // 方式一：主线程同步计算 —— JS 引擎霸占渲染进程，GUI 渲染线程挂起，页面冻结
    runOnMain () {
      if (this.busy) return;
      this.busy = true;
      this.mode = 'main';
      this.log(`主线程开始计算 ${this.formatCount(this.count)} 次加法 —— 页面即将冻结`, 'warn');
      // 技术点：setTimeout 延迟 50ms，让「开始」日志先渲染出来，再进入同步阻塞
      setTimeout(() => {
        const { sum, cost } = this.heavyCalc(this.count);
        this.log(`主线程算完：sum=${sum}，耗时 ${cost.toFixed(0)}ms（期间点击全部在排队，即将涌出）`, 'macro');
        this.busy = false;
        this.mode = '';
      }, 50);
    },
    // 懒创建 Worker：首次点击才建线程，之后复用
    ensureWorker () {
      if (!this.worker) {
        // 技术点：new URL + import.meta.url 是 Vite / webpack5 通用的 Worker 引入方式
        this.worker = new Worker(new URL('./process-worker.js', import.meta.url), { type: 'module' });
        this.worker.onmessage = (e) => {
          const { sum, cost } = e.data;
          this.log(`Worker 算完：sum=${sum}，耗时 ${cost.toFixed(0)}ms（主线程全程空闲，点击即时响应）`, 'micro');
          this.busy = false;
          this.mode = '';
        };
        this.log('Worker 已创建 —— 渲染进程内的独立线程（独立调用栈与内存）', 'sync');
      }
      return this.worker;
    },
    // 方式二：派发给 Worker —— 主线程只发消息，计算在另一条线程，页面流畅
    runOnWorker () {
      if (this.busy) return;
      this.busy = true;
      this.mode = 'worker';
      this.ensureWorker().postMessage({ count: this.count });
      this.log(`已派发给 Worker：${this.formatCount(this.count)} 次加法 —— 主线程立即返回`, 'warn');
    },
    killWorker () {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
        this.busy = false;
        this.mode = '';
        this.log('Worker 已销毁（terminate），线程资源释放', 'sync');
      } else {
        this.log('Worker 尚未创建', 'empty');
      }
    },
    // 点击回调本身也要等主线程空闲才执行：
    // 主线程计算期间点的次数，会在计算结束后「涌出」—— 这就是事件触发线程排队的证据
    onClickMe () {
      this.clickCount++;
      this.log(`点击 +1（第 ${this.clickCount} 次，${this.busy && this.mode === 'main' ? '排队后补执行' : '即时响应'}）`, 'sync');
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

.status-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;

  .status-text {
    flex: 1;
    color: #555;

    b {
      color: #262626;
    }
  }
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 3px solid #e8e8e8;
  border-top-color: #1890ff;
  border-radius: 50%;
  flex-shrink: 0;
}

.msg-log {
  margin: 0;
  padding: 12px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  max-height: 260px;
  overflow-y: auto;
  font-size: 13px;

  li {
    display: flex;
    gap: 12px;
    line-height: 1.9;
  }

  .log-time {
    color: #bbb;
    font-size: 12px;
  }

  .sync { color: #262626; }
  .micro { color: #1890ff; }
  .macro { color: #fa8c16; }
  .warn { color: #f5222d; }

  .empty,
  .empty-log {
    color: #bbb;
  }
}

.arch {
  margin-bottom: 14px;

  .arch-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .arch-box {
    flex: 1;
    padding: 10px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    background: #fafafa;

    b {
      display: block;
      margin-bottom: 4px;
      font-size: 13px;
      color: #262626;
    }

    span {
      font-size: 12px;
      line-height: 1.6;
      color: #888;
    }
  }

  .arch-main {
    background: #e6f7ff;
    border-color: #91d5ff;
  }

  .arch-hl {
    background: #f6ffed;
    border-color: #b7eb8f;
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
