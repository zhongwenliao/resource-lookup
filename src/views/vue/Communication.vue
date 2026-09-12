<template>
  <demo-page
    title="组件通信八式"
    description="Vue 2 中所有常用的组件通信方式。每种方式都有明确的适用边界：优先 props/$emit，跨层级用 provide/inject，全局状态用 Vuex，EventBus 慎用（难维护）。">
    <demo-block
      :index="1"
      title="props / $emit —— 父子通信（最常用）"
      description="父组件通过 props 下发数据，子组件通过 $emit 上抛事件。数据流向清晰，是应优先考虑的方式。"
      code="// 子组件：props 接收 + $emit 上抛
props: { init: Number },
this.$emit('change', this.count)

// 父组件：监听事件
<child-counter :init=&quot;5&quot; @change=&quot;onChildChange&quot; />">
      <child-counter :init="5" @change="onChildChange"></child-counter>
      <p class="demo-result">父组件收到子组件的值：<b>{{ childValue }}</b></p>
    </demo-block>

    <demo-block
      :index="2"
      title="$refs —— 父直接调用子组件实例"
      description="在父组件中通过 ref 拿到子组件实例，直接调用其方法。适合封装组件暴露命令式 API（如表单校验、聚焦），不要用它随意改子组件状态。"
      code="<child-clock ref=&quot;clock&quot; />
this.$refs.clock.tick()">
      <child-clock ref="clock"></child-clock>
      <el-button size="small" @click="$refs.clock.tick()">父组件命令子组件 tick 一次</el-button>
    </demo-block>

    <demo-block
      :index="3"
      title="EventBus —— 任意组件间事件总线"
      description="用一个空 Vue 实例作为事件中心，$emit 发布、$on 订阅。适合简单场景的跨组件通信；事件多了会难以追踪，务必在 beforeDestroy 中 $off 防止重复监听。"
      code="// bus.js
const bus = new Vue();
export default bus;

// 发送方
bus.$emit('greet', msg);
// 接收方（记得销毁时解绑）
bus.$on('greet', this.onGreet);
beforeDestroy () { bus.$off('greet', this.onGreet); }">
      <div class="demo-inline">
        <bus-sender></bus-sender>
        <bus-receiver></bus-receiver>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="provide / inject —— 跨层级注入"
      description="祖先组件 provide，任意后代 inject，无需逐层传递。默认非响应式；需要响应式时用 Vue.observable 包装。适合主题、国际化等全局配置。"
      code="provide () { return { themeState: this.themeState }; } // 祖先
inject: ['themeState'] // 任意后代">
      <div class="demo-inline">
        <el-button size="small" @click="switchTheme">切换主题色（祖先修改 provide）</el-button>
        <inject-child></inject-child>
      </div>
    </demo-block>

    <demo-block
      :index="5"
      title="$attrs / $listeners —— 属性与事件透传"
      description="中间层组件用 v-bind=&quot;$attrs&quot; v-on=&quot;$listeners&quot; 把父级传来的（未声明的）props 与事件原样透传给孙级，常用于二次封装组件库。配合 inheritAttrs: false 避免属性落到根元素上。"
      code="inheritAttrs: false,
<grand-child v-bind=&quot;$attrs&quot; v-on=&quot;$listeners&quot; />">
      <attr-child demo-text="来自祖父的 text" @grandpa-click="onGrandpaClick"></attr-child>
      <p class="demo-result">祖父收到孙组件事件次数：<b>{{ grandpaClicks }}</b></p>
    </demo-block>

    <demo-block
      :index="6"
      title="$parent / $children —— 直接访问相邻实例"
      description="子组件可读取 this.$parent 的数据/方法。耦合度高，仅适合工具型组件（如面包屑读取父级），业务代码不建议使用。"
      code="this.$parent.pageTitle">
      <parent-peek></parent-peek>
    </demo-block>

    <demo-block
      :index="7"
      title="Vuex —— 全局状态管理"
      description="跨页面、跨组件树共享状态的标准方案，完整数据流演示见侧边栏「Vuex 单向数据流」页面。">
      <router-link to="/vuex/counter" class="demo-link">前往 Vuex 演示 →</router-link>
    </demo-block>

    <demo-block
      :index="8"
      title="作用域插槽 —— 子组件把数据交给父组件渲染"
      description="严格说是「内容分发」而非通信，但它是子传父渲染数据的利器，详见「插槽三种用法」页面。">
      <router-link to="/vue/slots" class="demo-link">前往插槽演示 →</router-link>
    </demo-block>
  </demo-page>
</template>

<script>
import Vue from 'vue';
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';
// 技术点：EventBus —— 模块级空 Vue 实例作为事件中心
const bus = new Vue();

// 子组件：props 接收 + $emit 上抛
const ChildCounter = {
  props: {
    init: { type: Number, default: 0 }
  },
  template: `
    <div class="demo-inline">
      <el-button size="small" @click="count = count + 1">子组件内部 +1</el-button>
      <span class="demo-value">count = {{ count }}</span>
      <el-button size="small" type="primary" @click="$emit('change', count)">上抛给父组件</el-button>
    </div>
  `,
  data () {
    return { count: this.init };
  }
};

// 子组件：暴露命令式方法给父组件 $refs 调用
const ChildClock = {
  template: `
    <div class="demo-inline">
      <span class="demo-value">tick 次数：{{ ticks }}</span>
    </div>
  `,
  data () {
    return { ticks: 0 };
  },
  methods: {
    tick () {
      this.ticks += 1;
    }
  }
};

// EventBus 发送方
const BusSender = {
  template: '<el-button size="small" type="primary" @click="send">EventBus 发送消息</el-button>',
  methods: {
    send () {
      bus.$emit('greet', `你好，现在是 ${new Date().toLocaleTimeString()}`);
    }
  }
};

// EventBus 接收方（销毁时解绑，防止重复监听）
const BusReceiver = {
  template: '<span class="demo-value">收到：{{ msg || \'（等待 EventBus 消息）\' }}</span>',
  data () {
    return { msg: '' };
  },
  created () {
    bus.$on('greet', this.onGreet);
  },
  beforeDestroy () {
    bus.$off('greet', this.onGreet);
  },
  methods: {
    onGreet (msg) {
      this.msg = msg;
    }
  }
};

// inject 后代组件（themeState 由祖先 provide，Vue.observable 保证响应式）
const InjectChild = {
  inject: ['themeState'],
  template: `
    <span class="demo-value">
      后代注入的主题色：
      <b :style="{ color: themeState.color }">{{ themeState.color }}</b>
    </span>
  `
};

// 孙组件：$emit 的事件经 $listeners 直达祖父
const GrandChild = {
  template: `
    <el-button size="small" type="primary" @click="$emit('grandpa-click')">
      孙组件触发祖父事件
    </el-button>
  `
};

// 中间层：inheritAttrs: false + $attrs/$listeners 透传
const AttrChild = {
  inheritAttrs: false,
  components: { GrandChild },
  template: `
    <div class="demo-inline">
      <span class="demo-value">中间层收到 attr：{{ $attrs['demo-text'] }}</span>
      <grand-child v-bind="$attrs" v-on="$listeners"></grand-child>
    </div>
  `
};

// $parent 直接访问父实例
const ParentPeek = {
  template: `
    <div class="demo-inline">
      <el-button size="small" @click="peek">子组件读取父组件 pageTitle</el-button>
      <span class="demo-value">读到：{{ result || '（未读取）' }}</span>
    </div>
  `,
  data () {
    return { result: '' };
  },
  methods: {
    peek () {
      this.result = this.$parent.pageTitle;
    }
  }
};

export default {
  name: 'VueCommunication',
  components: {
    DemoPage,
    DemoBlock,
    ChildCounter,
    ChildClock,
    BusSender,
    BusReceiver,
    InjectChild,
    AttrChild,
    ParentPeek
  },
  provide () {
    // Vue.observable 让 provide 的数据变成响应式
    return { themeState: this.themeState };
  },
  data () {
    return {
      pageTitle: '组件通信八式（父组件数据）',
      themeState: Vue.observable({ color: '#1890ff' }),
      childValue: '（未收到）',
      grandpaClicks: 0
    };
  },
  methods: {
    onChildChange (val) {
      this.childValue = val;
    },
    switchTheme () {
      const colors = ['#1890ff', '#f5222d', '#52c41a', '#722ed1'];
      const next = colors[(colors.indexOf(this.themeState.color) + 1) % colors.length];
      this.themeState.color = next;
    },
    onGrandpaClick () {
      this.grandpaClicks += 1;
    }
  }
};
</script>

<style lang="less" scoped>
.demo-result {
  margin: 10px 0 0;
  font-size: 13px;
  color: #666;
}

.demo-link {
  font-size: 14px;
}
</style>
