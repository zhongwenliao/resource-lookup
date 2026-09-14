<template>
  <demo-page
    title="防抖与节流"
    description="高频事件（输入、滚动、拖拽、resize）的两个经典限流手段：防抖 debounce 只执行最后一次，节流 throttle 保证固定频率执行。一句话记忆：电梯等人齐了才关门 = 防抖；公交车每 10 分钟发一班车 = 节流。">
    <demo-block
      :index="1"
      title="防抖 —— 搜索联想场景"
      description="停止输入 500ms 后才发请求，观察「输入事件次数」与「实际请求次数」的差距："
      code="function debounce (fn, wait = 500) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);        // 技术点：每次触发先作废上一次
    timer = setTimeout(() => {
      fn.apply(this, args);     // 安静 wait 毫秒后才真正执行
    }, wait);
  };
}">
      <div class="demo-row">
        <el-input
          v-model="keyword"
          placeholder="连续输入试试（模拟搜索联想请求）"
          style="width: 320px"
          @input="onInput" />
        <span class="stat">输入事件：<b>{{ inputCount }}</b> 次</span>
        <span class="stat">实际请求：<b class="hl">{{ requestCount }}</b> 次</span>
      </div>
      <p class="demo-tip">最近一次请求参数：{{ lastKeyword || '—' }}</p>
    </demo-block>

    <demo-block
      :index="2"
      title="节流 —— 鼠标轨迹采样"
      description="鼠标在面板内移动时事件每次都触发，但采样点每 200ms 才记录一个（滚动加载、吸顶判断同理）："
      code="function throttle (fn, interval = 200) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {  // 技术点：距离上次执行够久才放行
      last = now;
      fn.apply(this, args);        // 间隔内到达的事件全部丢弃
    }
  };
}">
      <div class="move-panel" @mousemove="onMove">
        <span
          v-for="(dot, i) in dots"
          :key="i"
          class="dot"
          :style="{ left: dot.x + 'px', top: dot.y + 'px' }"></span>
        <div class="move-stat">
          <p>mousemove 事件：{{ moveCount }} 次</p>
          <p>采样点（200ms / 个）：{{ dots.length }} 个</p>
        </div>
      </div>
      <el-button size="small" style="margin-top: 10px" @click="clearDots">清空采样</el-button>
    </demo-block>

    <demo-block
      :index="3"
      title="场景速查与实现要点"
      description="面试高频，生产常用：">
      <ul class="point-list">
        <li><b>防抖场景</b> —— 搜索联想、表单实时校验、resize 结束后重算布局、拖拽结束才上报坐标</li>
        <li><b>节流场景</b> —— 滚动加载 / 吸顶、鼠标跟随动画、拖拽过程实时预览、滚动埋点</li>
        <li><b>实现要点</b> —— 闭包保存 timer / last 时间戳；防抖每次触发先 clear；组件销毁时必须 cancel，否则回调里操作已销毁组件会报错</li>
        <li><b>leading / trailing</b> —— 防抖可加「立即执行」选项（适合按钮防连点）；节流可加「尾部补执行」避免最后一次事件被丢</li>
        <li><b>现成轮子</b> —— lodash 的 debounce / throttle（含 maxWait、leading / trailing 配置），生产优先用轮子，原理要能手写</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

/**
 * 技术点：防抖 —— 闭包保存 timer，只有「安静了 wait 毫秒」才执行
 * 挂 cancel 方法供组件销毁时清理（闭包内的 timer 外部拿不到）
 */
function debounce (fn, wait = 500) {
  let timer = null;
  const debounced = function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, wait);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/**
 * 技术点：节流 —— 时间戳版，固定频率执行，间隔内的事件全部丢弃
 */
function throttle (fn, interval = 200) {
  let last = 0;
  const throttled = function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
  throttled.cancel = () => { last = 0; };
  return throttled;
}

export default {
  name: 'DebounceThrottle',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      keyword: '',
      inputCount: 0,
      requestCount: 0,
      lastKeyword: '',
      moveCount: 0,
      dots: []
    };
  },
  created () {
    // 技术点：在 created 挂到实例上，整个生命周期共用同一个 timer（放 data 会被响应式代理，没必要）
    this.debouncedRequest = debounce((val) => {
      this.requestCount += 1;
      this.lastKeyword = val;
    }, 500);
    this.throttledSample = throttle((e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      this.dots.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      if (this.dots.length > 300) {
        this.dots.shift(); // 防止无限增长
      }
    }, 200);
  },
  beforeDestroy () {
    // 销毁清理：不清掉的话，定时器回调会在组件销毁后继续执行
    this.debouncedRequest && this.debouncedRequest.cancel();
    this.throttledSample && this.throttledSample.cancel();
  },
  methods: {
    onInput (val) {
      this.inputCount += 1;
      this.debouncedRequest(val);
    },
    onMove (e) {
      this.moveCount += 1;
      this.throttledSample(e);
    },
    clearDots () {
      this.dots = [];
      this.moveCount = 0;
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  .stat {
    font-size: 13px;
    color: #666;

    .hl {
      color: #f5222d;
      font-size: 16px;
    }
  }
}

.demo-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #999;
}

.move-panel {
  position: relative;
  height: 220px;
  border: 1px dashed #91d5ff;
  border-radius: 4px;
  background: #f0f9ff;
  overflow: hidden;
  cursor: crosshair;

  .dot {
    position: absolute;
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    border-radius: 50%;
    background: #1890ff;
  }

  .move-stat {
    position: absolute;
    right: 10px;
    bottom: 8px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 3px;
    font-size: 12px;
    line-height: 1.8;
    color: #555;
    pointer-events: none;

    p {
      margin: 0;
    }
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
