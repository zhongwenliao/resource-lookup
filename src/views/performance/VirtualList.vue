<template>
  <demo-page
    title="长列表虚拟滚动"
    description="一万条数据直接 v-for 渲染 = 卡顿甚至崩溃。虚拟滚动只渲染「视口内 + 上下缓冲区」的几十条，DOM 数量恒定，数据量再大也流畅。核心公式：totalHeight = list.length × itemHeight，用绝对定位把可见切片「贴」回正确的滚动位置。">
    <demo-block
      :index="1"
      title="定高虚拟列表 —— 10000 条数据实测"
      description="滚动下面的列表：DOM 里永远只有约 30 个节点（缓冲区上下各 5 条），顶部占位元素撑起总高度骗过滚动条。"
      code="// 核心三步（定高版）
// 1. 可见范围：startIndex = Math.floor(scrollTop / itemHeight)
// 2. 带缓冲切片：
//    start = Math.max(0, startIndex - buffer)
//    end = Math.min(len, visibleCount + startIndex + buffer)
// 3. 偏移量：translateY(start * itemHeight)
//    顶部占位 div 高度 = list.length * itemHeight 撑起滚动条">
      <div class="toolbar">
        <span class="stat">数据量：<b>10000</b> 条</span>
        <span class="stat">实际渲染 DOM：<b class="hl">{{ renderCount }}</b> 个</span>
        <span class="stat">可见区：300px / 条高 40px</span>
      </div>
      <div ref="wrap" class="v-list" @scroll="onScroll">
        <div :style="{ height: totalHeight + 'px' }"></div>
        <div class="v-inner" :style="{ transform: 'translateY(' + offset + 'px)' }">
          <div v-for="item in visibleList" :key="item.id" class="v-item" :class="{ active: item.id === selectedId }" @click="selectedId = item.id">
            <span class="idx">#{{ item.id }}</span>
            <span class="name">{{ item.name }}</span>
            <span class="city">{{ item.city }}</span>
          </div>
        </div>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="为什么快 + 进阶方案"
      description="虚拟滚动的本质是「用 O(可见数) 的 DOM 成本渲染 O(总量) 的数据」：">
      <ul class="point-list">
        <li><b>DOM 是瓶颈</b> —— 浏览器渲染成本随节点数线性上涨；1 万个节点光布局就几百 ms，滚动时每帧重排直接掉帧</li>
        <li><b>key 必须稳定</b> —— 用 id 而不是 index，切片变化时 Vue 才能复用节点而不是销毁重建</li>
        <li><b>滚动事件要 passive</b> —— Vue 的 @scroll 默认不阻止滚动，原生 addEventListener 要加 { passive: true }，避免阻塞滚动线程</li>
        <li><b>不定高方案</b> —— 每条高度未知时：预估高度先渲染，真实渲染后用 ResizeObserver / getBoundingClientRect 回填缓存，二分查找定位 startIndex（vue-virtual-scroller 的 DynamicScroller 即此原理）</li>
        <li><b>现成轮子</b> —— vue-virtual-scroller（Vue2/3）、vue-virtual-scroll-list；表格场景 element-ui 的 el-table-v2（Vue3 生态）或自研</li>
        <li><b>横向滚动同理</b> —— 换成 scrollLeft 与横向 translate 即可，时间轴、甘特图常用</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

const CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '西安', '重庆'];

export default {
  name: 'VirtualList',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      list: [],
      itemHeight: 40, // 定高：每条 40px
      viewportHeight: 300,
      buffer: 5, // 上下缓冲条数
      startIndex: 0,
      selectedId: null
    };
  },
  computed: {
    totalHeight () {
      return this.list.length * this.itemHeight;
    },
    visibleCount () {
      return Math.ceil(this.viewportHeight / this.itemHeight);
    },
    // 技术点：带缓冲的切片计算 —— 视口内 + 上下各 buffer 条，减少快速滚动白屏
    visibleList () {
      const start = Math.max(0, this.startIndex - this.buffer);
      const end = Math.min(this.list.length, this.startIndex + this.visibleCount + this.buffer);
      return this.list.slice(start, end);
    },
    // 切片在总列表中的偏移，translate 回正确的滚动位置
    offset () {
      return Math.max(0, this.startIndex - this.buffer) * this.itemHeight;
    },
    renderCount () {
      return this.visibleList.length;
    }
  },
  created () {
    // 构造 10000 条模拟数据
    const list = [];
    for (let i = 1; i <= 10000; i++) {
      list.push({
        id: i,
        name: `用户_${String(i).padStart(5, '0')}`,
        city: CITIES[i % CITIES.length]
      });
    }
    this.list = list;
  },
  methods: {
    onScroll (e) {
      // 技术点：scrollTop / itemHeight 向下取整 = 第一条可见索引
      this.startIndex = Math.floor(e.target.scrollTop / this.itemHeight);
    }
  }
};
</script>

<style lang="less" scoped>
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 10px;

  .stat {
    font-size: 13px;
    color: #666;

    .hl {
      color: #f5222d;
      font-size: 16px;
    }
  }
}

.v-list {
  position: relative;
  height: 300px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow-y: auto;

  .v-inner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    will-change: transform; // 提示浏览器走合成层，滚动更顺滑
  }

  .v-item {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background: #f5faff;
    }

    &.active {
      background: #e6f7ff;
    }

    .idx {
      width: 70px;
      color: #1890ff;
      font-weight: 600;
    }

    .name {
      flex: 1;
      color: #333;
    }

    .city {
      color: #999;
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
