<template>
  <demo-page
    title="事件循环与异步执行顺序"
    description="JS 单线程，靠事件循环调度任务。面试必考、生产排坑必用（为什么 setTimeout(fn, 0) 不立即执行、Promise.then 在哪个阶段跑）。口诀：同步代码 → 微任务清空 → 一个宏任务 → 再清微任务，循环往复。">
    <demo-block
      :index="1"
      title="经典输出顺序题 —— 可运行验证"
      description="点击执行，右侧日志区打印真实顺序，先自己心里排一遍再对答案："
      code="console.log('1 同步');

setTimeout(() => console.log('6 宏任务'), 0);

Promise.resolve().then(() => {
  console.log('3 微任务');
  return Promise.resolve(); // 技术点：返回 thenable，多一轮微任务
}).then(() => console.log('5 微任务'));

console.log('2 同步');
// 输出：1 → 2 → 3 → 5 → 6
// 注意 4 在哪？见下方「then 回合」说明">
      <div class="demo-row">
        <el-button type="primary" size="small" @click="runQuiz">执行这段代码</el-button>
        <el-button size="small" @click="logs = []">清空日志</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（点击执行，观察输出顺序）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="任务队列全景图"
      description="一次 tick 的完整调度流程：">
      <ul class="point-list">
        <li><b>调用栈</b> —— 同步代码逐行执行，栈空了才去取任务</li>
        <li><b>宏任务队列</b> —— setTimeout / setInterval / setImmediate(Node) / I/O / UI 渲染事件，每轮 tick 只取<b>一个</b></li>
        <li><b>微任务队列</b> —— Promise.then/catch/finally / queueMicrotask / MutationObserver，每轮 tick <b>清空全部</b>（包括执行中新增的）</li>
        <li><b>then 回合（thenable job）</b> —— then 返回 Promise 时要等「两个 then 回合」才 resolve，所以嵌套 Promise 的 then 比平级 then 晚一轮（上例中 5 晚于 3 的原因）</li>
        <li><b>渲染时机</b> —— 渲染（rAF → style → layout → paint）发生在宏任务之间、微任务清空之后；微任务里改 DOM 不会中途渲染，长任务（&gt;50ms）直接掉帧</li>
        <li><b>Node 差异</b> —— Node 11+ 的 setTimeout / setInterval 与浏览器一致（每宏任务后清微任务）；process.nextTick 优先级高于所有微任务</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="生产排坑清单"
      description="事件循环不只是面试题，日常 bug 的隐形来源：">
      <ul class="point-list">
        <li><b>setTimeout(fn, 0) ≠ 立即</b> —— 最低约 4ms（嵌套 5 层后），且要等当前宏任务 + 微任务跑完；想「尽快」用 queueMicrotask / Promise.resolve().then</li>
        <li><b>微任务死循环</b> —— then 里无限新增微任务，页面直接卡死（宏任务永远轮不到，渲染也轮不到）</li>
        <li><b>Vue nextTick 的位置</b> —— Vue 2.7 的 nextTick 是微任务（Promise.then）；改数据后 DOM 不是同步更新，要拿更新后 DOM 必须放 nextTick 里</li>
        <li><b>长任务让位</b> —— 大计算拆片：setTimeout(0) 让出主线程（会闪帧）；requestIdleCallback / scheduler（React 原理）更优雅</li>
        <li><b>await 只是语法糖</b> —— await fn 等价 Promise.resolve(fn()).then(后续)，后续代码是微任务；async 函数内 try/catch 能捕获 await 的 reject</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'EventLoop',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      logs: []
    };
  },
  methods: {
    log (text, type) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false }) + '.' + String(Date.now() % 1000).padStart(3, '0');
      this.logs.push({ time, text, type });
    },
    runQuiz () {
      this.logs = [];
      this.log('1. 同步代码（script）', 'sync');
      setTimeout(() => this.log('6. setTimeout 宏任务', 'macro'), 0);
      Promise.resolve().then(() => {
        this.log('3. 微任务 then①', 'micro');
        return Promise.resolve();
      }).then(() => this.log('5. 微任务 then③（隔了一个 then 回合）', 'micro'));
      Promise.resolve().then(() => this.log('4. 微任务 then②（平级，先注册先执行）', 'micro'));
      this.log('2. 同步代码（script 结束）', 'sync');
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
