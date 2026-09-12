<template>
  <demo-page
    title="Mixin 混入"
    description="mixin 把可复用的 data / methods / 生命周期钩子分发进多个组件。核心规则：生命周期钩子「都执行，mixin 在前」；data / methods 等选项「冲突时组件自身优先」。">
    <demo-block
      :index="1"
      title="同名选项：组件自身优先"
      description="timeMixin 与组件都定义了 mixinName，组件的值生效；showMixinInfo 来自 mixin，组件可直接调用。"
      code="const timeMixin = {
  data () { return { mixinName: 'timeMixin' }; },
  methods: { showMixinInfo () { ... } }
};

export default {
  mixins: [timeMixin],
  data () { return { mixinName: '组件自身（同名组件优先）' }; }
}">
      <div class="demo-inline">
        <el-button size="small" type="primary" @click="showMixinInfo">调用 mixin 里的方法</el-button>
        <span class="demo-value">当前 mixinName：{{ mixinName }}</span>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="生命周期钩子：合并执行，mixin 在前"
      description="mixin 与组件的同名钩子都会执行，mixin 的先执行。观察下方执行顺序日志。"
      code="// 执行顺序
// 1. timeMixin created
// 2. 组件自身 created">
      <div class="demo-inline">
        <el-button size="small" @click="logs = []">清空日志</el-button>
      </div>
      <ul class="log-list">
        <li v-for="(log, i) in logs" :key="i" :class="{ fromMixin: log.includes('mixin') }">
          {{ log }}
        </li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="mixin 的适用边界"
      description="mixin 解决「横向复用」，但来源不可见（隐式依赖），多了之后难以追溯某个方法来自哪个 mixin。经验法则：">
      <ul class="hook-list">
        <li>纯逻辑复用（格式化、校验）→ 工具函数</li>
        <li>带视图的行为复用（下拉加载、拖拽）→ 优先考虑 mixin，但保持小而聚焦</li>
        <li>跨组件状态共享 → Vuex</li>
        <li>DOM 级行为复用 → 自定义指令</li>
        <li>Vue 3 已用 Composition API 取代 mixin 的多数场景（本项目为 Vue 2 沉淀）</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 演示用 mixin：同名 data + 方法 + 生命周期钩子
const timeMixin = {
  data () {
    return {
      mixinName: 'timeMixin'
    };
  },
  created () {
    this.logs.push('[1] timeMixin created 先执行');
  },
  methods: {
    showMixinInfo () {
      this.$message.info(`showMixinInfo 来自 timeMixin，但读到的 mixinName 是：${this.mixinName}`);
    }
  }
};

export default {
  name: 'VueMixin',
  components: { DemoPage, DemoBlock },
  mixins: [timeMixin],
  data () {
    return {
      // 与 mixin 同名：组件自身优先
      mixinName: '组件自身（同名组件优先）',
      logs: ['[2] 组件自身 created 后执行']
    };
  }
};
</script>

<style lang="less" scoped>
.demo-value {
  font-size: 13px;
  color: #666;
}

.log-list {
  margin: 12px 0 0;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.9;
  color: #555;
  list-style: none;

  .fromMixin {
    color: #1890ff;
  }
}

.hook-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
