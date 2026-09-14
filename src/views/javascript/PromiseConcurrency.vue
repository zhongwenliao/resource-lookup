<template>
  <demo-page
    title="Promise 并发控制"
    description="Promise.all 全并发、allSettled 容错、race 竞速、any 首个成功——四个组合方法之外，更常被面试拷问的是「限制并发数的批量请求」。本页实现一个可运行的并发调度器。">
    <demo-block
      :index="1"
      title="并发调度器 —— 限制同时 3 个请求"
      description="10 个任务（每个耗时随机 0.5~1.5s），限制并发 3：观察同一时刻「执行中」永远 ≤ 3，全部完成后统计总耗时。"
      code="class ConcurrentScheduler {
  constructor (limit = 3) {
    this.limit = limit;      // 最大并发数
    this.active = 0;        // 当前执行中
    this.queue = [];        // 等待队列
  }
  add (taskFn) {
    // 技术点：返回新 Promise，把 resolve 存进队列
    // 由调度器在合适时机执行任务并透传结果
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this._next();
    });
  }
  _next () {
    // 有空位且队列非空 → 出队执行
    while (this.active < this.limit && this.queue.length) {
      const { taskFn, resolve, reject } = this.queue.shift();
      this.active++;
      taskFn().then(resolve, reject).finally(() => {
        this.active--;
        this._next(); // 腾出空位，补下一个
      });
    }
  }
}">
      <div class="demo-row">
        <el-button type="primary" size="small" :disabled="running" @click="start">开始 10 个任务（并发 3）</el-button>
        <el-button size="small" @click="reset">重置</el-button>
        <span class="stat">执行中：<b class="hl">{{ activeCount }}</b> / 3</span>
        <span class="stat">已完成：<b>{{ doneCount }}</b> / 10</span>
        <span class="stat">总耗时：<b>{{ elapsed || '—' }}</b></span>
      </div>
      <ul class="task-list">
        <li v-for="t in tasks" :key="t.id" :class="t.status">
          <span class="t-name">任务 {{ t.id }}</span>
          <span class="t-status">{{ statusText(t.status) }}</span>
          <span class="t-time">{{ t.cost }}</span>
        </li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="Promise 四兄弟对比"
      description="参数都是 Promise 数组，区别在「失败策略」与「返回结构」：">
      <ul class="point-list">
        <li><b>Promise.all</b> —— 全成功才成功（结果数组有序）；<b>任一失败立即 reject</b>，但其余请求不会取消（只是结果被丢弃），注意重复请求副作用</li>
        <li><b>Promise.allSettled</b> —— 等全部落定，永不 reject；返回 { status: 'fulfilled' | 'rejected', value / reason }[]，适合「批量操作 + 逐条汇报结果」</li>
        <li><b>Promise.race</b> —— 第一个落定者（无论成败）决定结果；超时控制经典用法：race([fetch(...), timeoutPromise])</li>
        <li><b>Promise.any</b> —— 第一个<b>成功</b>者决定结果，全失败才 reject（AggregateError）；多 CDN / 多源取最快</li>
        <li><b>取消是不存在的</b> —— Promise 一旦发起无法真正取消，AbortController 只能取消 fetch / axios 请求本身；race 的「超时」只是不再等结果，请求仍在跑</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="生产场景速查"
      description="并发控制的真实落地点：">
      <ul class="point-list">
        <li><b>批量上传</b> —— 大文件分片全并发会打挂弱网与服务器，限并发 3~5 是常规值（本项目 upload 模块即此思路）</li>
        <li><b>图片预加载</b> —— 首屏几十张图限并发加载，避免挤占关键请求带宽（配合 loading="lazy" 更省）</li>
        <li><b>接口聚合</b> —— 页面多个独立请求用 allSettled 并行 + 局部渲染，别串行 await（瀑布式请求是页面慢的常见元凶）</li>
        <li><b>p-limit</b> —— 生产直接用 p-limit 库（并发限制），p-queue（带优先级 / 重试的队列），原理即本页调度器</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

/**
 * 技术点：并发调度器 —— 限制同时在飞的 Promise 数量
 * 原理：包一层新 Promise，把 resolve/reject 存队列，由 _next 调度执行
 */
class ConcurrentScheduler {
  constructor (limit = 3) {
    this.limit = limit;
    this.active = 0;
    this.queue = [];
  }

  add (taskFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ taskFn, resolve, reject });
      this._next();
    });
  }

  _next () {
    while (this.active < this.limit && this.queue.length) {
      const { taskFn, resolve, reject } = this.queue.shift();
      this.active++;
      taskFn().then(resolve, reject).finally(() => {
        this.active--;
        this._next();
      });
    }
  }
}

export default {
  name: 'PromiseConcurrency',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      tasks: [],
      running: false,
      activeCount: 0,
      doneCount: 0,
      elapsed: ''
    };
  },
  methods: {
    statusText (status) {
      return { pending: '排队中', running: '执行中', done: '完成' }[status];
    },
    reset () {
      if (this.running) return;
      this.tasks = [];
      this.activeCount = 0;
      this.doneCount = 0;
      this.elapsed = '';
    },
    start () {
      if (this.running) return;
      this.reset();
      this.running = true;
      // 初始化 10 个任务
      this.tasks = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        status: 'pending',
        cost: ''
      }));
      const scheduler = new ConcurrentScheduler(3);
      const startTime = Date.now();
      const timer = setInterval(() => {
        this.activeCount = scheduler.active;
      }, 100);
      const jobs = this.tasks.map(t => {
        return scheduler.add(() => {
          t.status = 'running';
          const cost = 500 + Math.round(Math.random() * 1000);
          return new Promise(resolve => setTimeout(resolve, cost)).then(() => {
            t.status = 'done';
            t.cost = (cost / 1000).toFixed(1) + 's';
            this.doneCount += 1;
          });
        });
      });
      Promise.all(jobs).finally(() => {
        clearInterval(timer);
        this.activeCount = 0;
        this.elapsed = ((Date.now() - startTime) / 1000).toFixed(1) + 's';
        this.running = false;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 12px;

  .stat {
    font-size: 13px;
    color: #666;

    .hl {
      color: #f5222d;
      font-size: 16px;
    }
  }
}

.task-list {
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
    align-items: center;
    gap: 12px;
    line-height: 2;

    .t-name {
      width: 70px;
      color: #333;
    }

    .t-status {
      flex: 1;
    }

    .t-time {
      color: #999;
    }

    &.pending .t-status { color: #bbb; }
    &.running .t-status { color: #1890ff; }
    &.done .t-status { color: #52c41a; }
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
