<template>
  <demo-page
    title="动态路由参数"
    description="动态路由用 :id 占位（本页注册为 /router/params/:id?，? 表示可选参数）。重点：同组件间参数变化不会重新创建组件，必须 watch $route。">
    <demo-block
      :index="1"
      title="读取参数：$route.params / $route.query"
      description="params 来自路径占位符，query 来自 URL 问号后。当前路由快照："
      code="// router.js
path: '/router/params/:id?'

// 组件内读取
this.$route.params.id
this.$route.query.from">
      <ul class="route-list">
        <li><b>params.id</b>：{{ $route.params.id || '（空，因为是可选参数）' }}</li>
        <li><b>query</b>：{{ JSON.stringify($route.query) }}</li>
        <li><b>fullPath</b>：{{ $route.fullPath }}</li>
        <li><b>matched.length</b>：{{ $route.matched.length }}（匹配的路由记录数）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="编程式导航：$router.push"
      description="声明式 router-link 与编程式 $router.push 等价；params 配 name 用，query 配 path 或 name 都可。"
      code="// 路径字符串
this.$router.push('/router/params/100')

// 命名路由 + params（刷新后 params 丢失，除非路由里定义了占位符）
this.$router.push({ name: 'RouterParams', params: { id: 200 } })

// query 会拼在 URL 上，刷新不丢
this.$router.push({ path: '/router/params/300', query: { from: 'demo' } })">
      <div class="demo-inline">
        <el-input v-model.number="nextId" class="demo-input" size="small" placeholder="输入 id"></el-input>
        <el-button size="small" @click="goByPath">push 路径</el-button>
        <el-button size="small" type="primary" @click="goByName">push 命名路由</el-button>
        <el-button size="small" @click="goWithQuery">push 带 query</el-button>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="监听参数变化：watch $route"
      description="从 /router/params/1 跳到 /router/params/2 时组件被复用，生命周期钩子不会重新执行，参数变化只能靠 watch 捕获。用上面的按钮切换 id，观察下方日志："
      code="watch: {
  $route (to, from) {
    // 参数变化，重新拉取数据
    this.logs.unshift(`from ${from.params.id} → to ${to.params.id}`);
  }
}">
      <ul class="log-list">
        <li v-for="(log, i) in logs" :key="i">{{ log }}</li>
        <li v-if="!logs.length" class="empty">（还没有参数变化，试试上面的导航按钮）</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'RouterParams',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      nextId: 100,
      logs: []
    };
  },
  watch: {
    // 技术点：组件复用时监听路由参数变化
    $route (to, from) {
      this.logs.unshift(`${new Date().toLocaleTimeString()}  params.id: ${from.params.id || '空'} → ${to.params.id || '空'}`);
    }
  },
  methods: {
    goByPath () {
      this.$router.push(`/router/params/${this.nextId}`);
    },
    goByName () {
      this.$router.push({ name: 'RouterParams', params: { id: this.nextId } });
    },
    goWithQuery () {
      this.$router.push({ path: `/router/params/${this.nextId}`, query: { from: 'demo' } });
    }
  }
};
</script>

<style lang="less" scoped>
.route-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}

.demo-input {
  width: 140px;
  margin-right: 8px;
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
</style>
