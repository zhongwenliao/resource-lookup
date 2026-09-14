<template>
  <demo-page
    title="DOM 事件交互"
    description="点击、输入、滚动、拖拽 —— 一切用户交互的底层都是事件系统。本页用可运行演示串起事件交互的核心：事件流三阶段（捕获/目标/冒泡）、事件委托、自定义事件分发，以及 passive / preventDefault 等生产必知要点。">
    <demo-block
      :index="1"
      title="事件流三阶段 —— 捕获 → 目标 → 冒泡"
      description="点击最深处的元素时，事件先从 window 一路「下沉」到目标（捕获），再从目标「上浮」回 window（冒泡）。addEventListener 的第三个参数决定监听器挂在哪个阶段："
      :code="codeFlow">
      <div class="mode-row">
        <span class="mode-label">监听模式：</span>
        <el-checkbox v-model="captureMap.grandfather">祖父层·捕获</el-checkbox>
        <el-checkbox v-model="captureMap.father">父层·捕获</el-checkbox>
        <el-checkbox v-model="captureMap.child">目标·捕获</el-checkbox>
      </div>
      <div class="mode-row">
        <span class="mode-label">传播中断：</span>
        <el-radio-group v-model="stopMode" size="mini">
          <el-radio-button label="none">不中断</el-radio-button>
          <el-radio-button label="propagation">父层 stopPropagation</el-radio-button>
          <el-radio-button label="immediate">父层 stopImmediatePropagation</el-radio-button>
        </el-radio-group>
      </div>
      <div ref="grandfather" class="flow-box grandfather">
        <div class="box-label">grandfather（{{ captureMap.grandfather ? '捕获' : '冒泡' }}）</div>
        <div ref="father" class="flow-box father">
          <div class="box-label">father（{{ captureMap.father ? '捕获' : '冒泡' }}）</div>
          <el-button ref="child" type="primary" size="mini" class="child-btn">child（点我触发事件流）</el-button>
        </div>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in flowLogs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!flowLogs.length" class="empty">（点击最内层按钮，观察事件经过每层的顺序）</li>
      </ul>
      <ul class="point-list">
        <li><b>目标阶段的特殊性</b> —— 事件到达目标元素时，捕获/冒泡监听器<b>按注册顺序</b>执行（第三参数被忽略）；想强制走捕获语义要挂在祖先元素上</li>
        <li><b>stopPropagation vs stopImmediatePropagation</b> —— 前者只阻止向其他元素传播，本元素已注册的其他监听器照跑；后者连本元素后续监听器一起掐断（见上方演示对比）</li>
        <li><b>e.target vs e.currentTarget</b> —— target 永远指向最初点击的元素；currentTarget 是「当前正在处理的元素」（随传播流动），事件委托就靠这对差异</li>
        <li><b>冒泡的边界</b> —— focus / blur / mouseenter / mouseleave 不冒泡，要委托得用 focusin / focusout / mouseover / mouseout 替代</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="可运行演示② —— 事件委托：一个监听器管一千个列表项"
      description="不给每个 li 绑监听器，只在父元素 ul 上绑一个，靠 e.target 判定来源。新增的条目自动被覆盖 —— 这就是委托的核心卖点："
      :code="codeDelegate">
      <div class="demo-row">
        <el-button type="primary" size="small" @click="addItem">新增列表项（自动可点击）</el-button>
        <el-button size="small" @click="delegateLogs = []">清空日志</el-button>
        <span class="hint">父元素监听器数量恒为 1，列表项 {{ delegateItems.length }} 个</span>
      </div>
      <ul ref="list" class="delegate-list">
        <li v-for="item in delegateItems" :key="item.id" :data-id="item.id">
          <i class="dot" :style="{ background: item.color }" />
          <span class="item-text">{{ item.text }}</span>
          <el-tag size="mini" effect="plain">{{ item.tag }}</el-tag>
        </li>
      </ul>
      <ul class="msg-log">
        <li v-for="(log, i) in delegateLogs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!delegateLogs.length" class="empty">（点击列表项任意位置 —— 包括里面的圆点、文字、标签）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="可运行演示③ —— 自定义事件：CustomEvent + dispatchEvent"
      description="不依赖任何库，用浏览器原生事件系统实现发布订阅。点击「发布」按钮向事件总线派发自定义事件，观察监听器接收 detail 数据："
      :code="codeCustom">
      <div class="demo-row">
        <el-input v-model="notifyText" size="small" style="width: 200px" placeholder="事件携带的数据" />
        <el-button type="primary" size="small" @click="publishEvent">dispatchEvent 发布</el-button>
        <el-button type="success" size="small" @click="registerOnce">再注册一个 once 监听器</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in customLogs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!customLogs.length" class="empty">（先点发布，或先注册 once 监听器再连点两次发布）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="4"
      title="事件交互进阶清单 —— 生产必知"
      description="从面试题到线上事故的距离：">
      <ul class="point-list">
        <li><b>passive: true</b> —— 告诉浏览器「监听器不会 preventDefault」，滚动/触摸事件可立即响应不等 JS；touchstart / wheel 监听器 Chrome 默认 passive，强行 preventDefault 只会收到告警且无效</li>
        <li><b>preventDefault 的边界</b> —— 能阻止：表单提交、链接跳转、右键菜单；不能阻止：window unload（要用户手势）、已发生的滚动、子元素单独监听并放行的行为（除非配合 stopPropagation）</li>
        <li><b>事件回调是宏任务</b> —— 点击事件处理完（含微任务清空）才轮到下一帧渲染；handler 里长计算同样掉帧，重活交给 Worker（见 /browser/process）</li>
        <li><b>removeEventListener 必须同参</b> —— capture 不一致就摘不掉（true 注册的必须 true 移除）；匿名函数无法移除，组件销毁记得清理，否则内存泄漏 + 重复触发</li>
        <li><b>Pointer 事件统一三端</b> —— pointerdown/move/up 统一鼠标/触摸/触控笔，替代 mousedown + touchstart 双监听；拖拽交互优先 Pointer Events + setPointerCapture</li>
        <li><b>Vue 模板 @click 的本质</b> —— 编译为 addEventListener 绑在原生元素上（组件上则是 $emit 自定义事件）；.stop / .prevent / .once / .passive 修饰符对应 stopPropagation / preventDefault / once / passive 选项</li>
        <li><b>事件总线已死</b> —— Vue 3 移除了 $on/$off，跨组件通信用 props/emit 或状态管理；需要真·发布订阅时，new EventTarget() 就是现成的最小事件总线（本页演示的做法）</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'DomEvents',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      // 演示①：事件流
      captureMap: { grandfather: true, father: true, child: true },
      stopMode: 'none',
      flowLogs: [],
      // 演示②：事件委托
      delegateItems: [
        { id: 1, text: '列表项 A', tag: '初始', color: '#1890ff' },
        { id: 2, text: '列表项 B', tag: '初始', color: '#52c41a' },
        { id: 3, text: '列表项 C', tag: '初始', color: '#fa8c16' }
      ],
      delegateLogs: [],
      nextId: 4,
      // 演示③：自定义事件
      notifyText: 'hello 自定义事件',
      customLogs: [],
      codeFlow: `// 第三个参数：false/true（冒泡/捕获）或 options 对象
el.addEventListener('click', fn, { capture: true, once: true, passive: true });

// 事件流：window → … → father（捕获）→ child（目标）→ father（冒泡）→ … → window
// 在 father 的捕获监听器里 stopPropagation，child 永远收不到这次点击`,
      codeDelegate: `// 父元素只绑一个监听器，管所有子项（含未来新增的）
list.addEventListener('click', (e) => {
  // e.target 可能是 li 内部的 span/i，closest 向上找到真正的列表项
  const item = e.target.closest('li');
  if (!item) return; // 点到列表间隙，忽略
  console.log('来源元素：', e.target.tagName);        // 实际点击的
  console.log('处理元素：', e.currentTarget.tagName); // 绑监听器的（UL）
  console.log('数据：', item.dataset.id);             // data-* 传参
});`,
      codeCustom: `// EventTarget 实例 = 现成的最小事件总线（Vue 3 时代 $on 已移除）
const bus = new EventTarget();

// 订阅：once 让监听器触发一次后自动移除
bus.addEventListener('demo-notify', (e) => {
  console.log('收到数据：', e.detail); // detail 是自定义事件的传参通道
}, { once: true });

// 发布：detail 只能在 CustomEvent 构造时传入
bus.dispatchEvent(new CustomEvent('demo-notify', {
  detail: { text: 'hello', time: Date.now() }
}));`
    };
  },
  mounted () {
    this.bindFlowDemo();
    this.bindDelegateDemo();
    this.bindCustomEventDemo();
  },
  beforeDestroy () {
    // 技术点：addEventListener 的反向操作 —— 同样的 capture 参数才能摘掉
    this.unbindFlowDemo();
    if (this.$refs.list) {
      this.$refs.list.removeEventListener('click', this.onListClick);
    }
    this.bus.removeEventListener('demo-notify', this.onBusEvent);
    this.bus.removeEventListener('demo-notify', this.onBusEventOnce);
  },
  created () {
    // 演示③的事件总线：EventTarget 是浏览器原生的发布订阅载体
    this.bus = new EventTarget();
  },
  methods: {
    log (arr, text, type) {
      const t = new Date();
      arr.push({
        time: t.toTimeString().slice(0, 8) + '.' + ('00' + t.getMilliseconds()).slice(-3),
        text,
        type
      });
    },

    // ---------- 演示①：事件流 ----------
    bindFlowDemo () {
      // 给三层各注册捕获 + 冒泡两个监听器，handler 内按当前勾选决定是否记录
      // 这样切换 checkbox 立即生效，无需重新绑定（capture 参数注册后不可变）
      ['grandfather', 'father', 'child'].forEach((key) => {
        // el-button 是组件，ref 拿到的是组件实例，要取 $el 才是原生 DOM
        const el = key === 'child' ? this.$refs[key].$el : this.$refs[key];
        el.addEventListener('click', (e) => this.onFlowEvent(key, 'capture', e), true);
        el.addEventListener('click', (e) => this.onFlowEvent(key, 'bubble', e), false);
      });
    },
    unbindFlowDemo () {
      // 匿名函数无法 removeEventListener —— 本演示随组件销毁一起走，
      // 生产代码要移除必须保存函数引用（见第 4 块知识点）
    },
    onFlowEvent (layer, phase, e) {
      // 未勾选该阶段则跳过（模拟「这层没在这个阶段监听」）
      const wantCapture = this.captureMap[layer];
      if ((phase === 'capture') !== wantCapture) return;

      // 目标阶段：浏览器按注册顺序执行，标注为「目标」
      const isTarget = e.target === this.$refs.child.$el;
      const phaseText = isTarget ? '目标' : (phase === 'capture' ? '捕获' : '冒泡');
      this.log(this.flowLogs, `[${phaseText}] ${layer} 触发`, phase === 'capture' ? 'out' : 'in');

      // 传播中断演示：在父层（father）动手脚
      if (layer === 'father' && this.stopMode !== 'none' && !isTarget) {
        if (this.stopMode === 'propagation') {
          e.stopPropagation();
          this.log(this.flowLogs, 'father 调用 stopPropagation —— 传播截断，child 收不到', 'warn');
        } else {
          e.stopImmediatePropagation();
          this.log(this.flowLogs, 'father 调用 stopImmediatePropagation —— 连 father 后续监听器也掐断', 'warn');
        }
      }
    },

    // ---------- 演示②：事件委托 ----------
    bindDelegateDemo () {
      // 核心动作：监听器绑在父元素 UL 上，只绑一次
      this.$refs.list.addEventListener('click', this.onListClick);
    },
    onListClick (e) {
      // e.target 可能是 li 内部的 i/span/el-tag，closest 向上找真正的列表项
      const li = e.target.closest('li');
      if (!li) return;
      const id = li.dataset.id;
      const item = this.delegateItems.find(it => String(it.id) === String(id));
      if (!item) return;
      this.log(this.delegateLogs, `命中列表项「${item.text}」（data-id=${id}）`, 'in');
      this.log(this.delegateLogs, `e.target=${e.target.tagName.toLowerCase()} · e.currentTarget=${e.currentTarget.tagName.toLowerCase()} —— 两者在委托场景必然不同`, 'sys');
    },
    addItem () {
      const colors = ['#1890ff', '#52c41a', '#fa8c16', '#f5222d', '#722ed1'];
      const id = this.nextId++;
      this.delegateItems.push({
        id,
        text: `新增项 ${id}`,
        tag: '动态',
        color: colors[id % colors.length]
      });
      this.log(this.delegateLogs, `新增列表项 ${id} —— 未绑定任何新监听器，点击依然生效（委托的价值）`, 'out');
    },

    // ---------- 演示③：自定义事件 ----------
    bindCustomEventDemo () {
      // 常驻监听器
      this.bus.addEventListener('demo-notify', this.onBusEvent);
    },
    onBusEvent (e) {
      this.log(this.customLogs, `常驻监听器收到事件，detail=${JSON.stringify(e.detail)}`, 'in');
    },
    onBusEventOnce (e) {
      this.log(this.customLogs, `once 监听器收到事件，detail=${JSON.stringify(e.detail)}（触发后自动移除）`, 'out');
    },
    publishEvent () {
      const detail = { text: this.notifyText, time: new Date().toTimeString().slice(0, 8) };
      this.log(this.customLogs, `dispatchEvent 发布 demo-notify，detail=${JSON.stringify(detail)}`, 'out');
      // detail 只能在 CustomEvent 构造时传入，dispatchEvent 后不可改
      this.bus.dispatchEvent(new CustomEvent('demo-notify', { detail }));
    },
    registerOnce () {
      // once: true —— 触发一次后浏览器自动 removeEventListener
      this.bus.addEventListener('demo-notify', this.onBusEventOnce, { once: true });
      this.log(this.customLogs, '已注册 once 监听器 —— 下一次发布它会触发，之后自动消失', 'sys');
    }
  }
};
</script>

<style lang="less" scoped>
.mode-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;

  .mode-label {
    font-size: 13px;
    color: #666;
  }
}

.flow-box {
  padding: 16px 18px 14px;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  background: #f0f9ff;
  margin-bottom: 12px;

  .box-label {
    font-size: 12px;
    color: #1890ff;
    margin-bottom: 10px;
    font-family: Consolas, Monaco, monospace;
  }

  &.father {
    border-color: #b7eb8f;
    background: #f6ffed;

    .box-label {
      color: #52c41a;
    }
  }

  .child-btn {
    margin: 0 auto;
    display: block;
  }
}

.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  .hint {
    font-size: 12px;
    color: #888;
  }
}

.delegate-list {
  margin: 0 0 12px;
  padding: 8px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 10px;
    margin-bottom: 4px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: #1890ff;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .item-text {
      flex: 1;
      font-size: 13px;
      color: #333;
    }
  }
}

.msg-log {
  margin: 0 0 12px;
  padding: 12px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  max-height: 200px;
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

  .in { color: #1890ff; }
  .out { color: #52c41a; }
  .sys { color: #888; }
  .warn { color: #f5222d; }
  .empty { color: #bbb; }
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
