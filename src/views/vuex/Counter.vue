<template>
  <demo-page
    title="Vuex 单向数据流"
    description="完整数据流：组件 dispatch action（异步）→ commit mutation（同步改 state）→ state 响应式更新视图。本页对接 store/counter.js 模块，辅助函数 mapXxx 全套演示。">
    <demo-block
      :index="1"
      title="计数器（namespaced 模块）"
      description="step 控制步长；「异步 +」走 action（500ms 后 commit），其余直接 commit mutation。"
      code="// store/counter.js（namespaced: true）
mutations: { INCREMENT (state, payload = 1) { state.count += payload; } },
actions: { asyncChange ({ commit }, { type, payload }) { ... } }

// 组件内（辅助函数映射）
...mapMutations('counter', ['INCREMENT', 'DECREMENT', 'RESET']),
...mapActions('counter', ['asyncChange'])

this.INCREMENT(this.step)          // 同步
this.asyncChange({ type: 'INCREMENT', payload: this.step }) // 异步">
      <div class="counter-panel">
        <div class="counter-num" :class="{ negative: count < 0 }">{{ count }}</div>
        <div class="counter-meta">
          <span>doubleCount（getter）：{{ doubleCount }}</span>
          <span>lastLog（getter）：{{ lastLog }}</span>
        </div>
        <div class="demo-inline">
          <span class="demo-label">步长：</span>
          <el-radio-group v-model="stepProxy" size="small">
            <el-radio-button :label="1">1</el-radio-button>
            <el-radio-button :label="5">5</el-radio-button>
            <el-radio-button :label="10">10</el-radio-button>
          </el-radio-group>
        </div>
        <div class="demo-inline">
          <el-button size="small" type="primary" @click="INCREMENT(step)">同步 +</el-button>
          <el-button size="small" type="primary" plain @click="DECREMENT(step)">同步 -</el-button>
          <el-button size="small" type="warning" :loading="asyncing" @click="doAsync">
            {{ asyncing ? '异步中…' : '异步 +（action）' }}
          </el-button>
          <el-button size="small" @click="RESET">重置</el-button>
        </div>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="操作历史（state 数组）"
      description="每次 mutation 都会记录一条日志，直观看到「组件 → mutation → state」的路径：">
      <ul class="log-list">
        <li v-for="(log, i) in history.slice(0, 8)" :key="i">{{ log }}</li>
        <li v-if="!history.length" class="empty">（还没有操作）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="规则速记"
      description="Vuex 的几条铁律：">
      <ul class="point-list">
        <li>mutation 必须同步，异步逻辑放 action</li>
        <li>改 state 只能通过 commit mutation，保证每次变更可追踪（devtools 时间旅行）</li>
        <li>派生数据用 getter，不要在组件里重复计算</li>
        <li>模块化 + namespaced: true 防止命名冲突；本项目的模块由 import.meta.glob 自动注册（见工程化演示）</li>
        <li>mapState / mapGetters 映射到 computed，mapMutations / mapActions 映射到 methods</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'VuexCounter',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      asyncing: false
    };
  },
  computed: {
    // state / getters 映射到 computed
    ...mapState('counter', ['count', 'step', 'history']),
    ...mapGetters('counter', ['doubleCount', 'lastLog']),
    // 本地数据与 store 双向同步的代理写法
    stepProxy: {
      get () {
        return this.step;
      },
      set (val) {
        this.CHANGE_STEP(val);
      }
    }
  },
  methods: {
    // mutations / actions 映射到 methods
    ...mapMutations('counter', ['INCREMENT', 'DECREMENT', 'RESET', 'CHANGE_STEP']),
    ...mapActions('counter', ['asyncChange']),
    doAsync () {
      this.asyncing = true;
      this.asyncChange({ type: 'INCREMENT', payload: this.step })
        .then(msg => this.$message.success(msg))
        .finally(() => {
          this.asyncing = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.counter-panel {
  .counter-num {
    font-size: 40px;
    font-weight: 700;
    color: #1890ff;
    line-height: 1.2;

    &.negative {
      color: #f5222d;
    }
  }

  .counter-meta {
    margin: 8px 0 16px;
    font-size: 13px;
    color: #888;

    span {
      margin-right: 24px;
    }
  }
}

.demo-label {
  font-size: 13px;
  color: #666;
  margin-right: 4px;
}

.log-list {
  margin: 0;
  padding: 12px 16px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.9;
  color: #555;
  list-style: none;

  .empty {
    color: #bbb;
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}
</style>
