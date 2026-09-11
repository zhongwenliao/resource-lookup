<template>
  <demo-page
    title="导航守卫"
    description="守卫分三类：全局（router.beforeEach）、路由独享（routes 里 beforeEnter）、组件内（beforeRouteEnter/Update/Leave）。本项目 router.js 中已用全局 beforeEach 同步页面标题。">
    <demo-block
      :index="1"
      title="组件内守卫 beforeRouteLeave —— 离开确认"
      description="在下方输入框输入任意内容（视为「未保存」），再点击侧边栏任意菜单切换页面，会被守卫拦截确认；清空内容后可直接离开。"
      code="beforeRouteLeave (to, from, next) {
  if (this.dirty) {
    const ok = window.confirm('有未保存的内容，确定离开？');
    next(ok); // 放行 / 取消
  } else {
    next();
  }
}">
      <div class="demo-inline">
        <el-input
          v-model="draft"
          class="demo-input"
          size="small"
          :placeholder="dirty ? '有未保存内容，离开会被拦截' : '输入内容后离开会被拦截'"></el-input>
        <el-button size="small" @click="draft = ''">清空（模拟已保存）</el-button>
      </div>
      <p class="demo-tip">当前状态：{{ dirty ? '未保存（dirty = true）' : '干净（dirty = false）' }}</p>
    </demo-block>

    <demo-block
      :index="2"
      title="三类守卫速查"
      description="按注册位置区分：">
      <ul class="point-list">
        <li><b>全局前置 beforeEach</b> —— router.beforeEach(to, from, next)，鉴权、埋点、改标题（本项目的用法见 router.js）</li>
        <li><b>全局解析 beforeResolve</b> —— 异步组件与守卫全部解析之后调用</li>
        <li><b>全局后置 afterEach</b> —— 无 next 参数，适合收尾（如关闭进度条）</li>
        <li><b>路由独享 beforeEnter</b> —— 写在单条路由配置里</li>
        <li><b>组件内 beforeRouteEnter</b> —— 此时组件实例还没创建，拿不到 this，要用 next(vm => ...) 回调访问实例</li>
        <li><b>组件内 beforeRouteUpdate</b> —— 同组件路由参数变化时触发（如 /params/1 → /params/2）</li>
        <li><b>组件内 beforeRouteLeave</b> —— 离开该组件路由时触发，表单未保存拦截的标准位置</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="执行顺序"
      description="一次导航的完整链路：">
      <pre class="order-code">beforeRouteLeave（组件内离开）
  → 全局 beforeEach
    → beforeRouteUpdate（组件复用时）
      → beforeEnter（路由独享）
        → beforeRouteEnter（组件内进入）
          → 全局 beforeResolve
            → 导航确认，DOM 更新
              → 全局 afterEach
                → next(vm => ...)（beforeRouteEnter 的回调）</pre>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

export default {
  name: 'RouterGuard',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      draft: ''
    };
  },
  computed: {
    dirty () {
      return this.draft.length > 0;
    }
  },
  // 技术点：组件内离开守卫 —— 未保存内容拦截
  beforeRouteLeave (to, from, next) {
    if (this.dirty) {
      const ok = window.confirm(`有未保存的内容，确定离开去「${to.meta.name}」吗？`);
      next(ok);
    } else {
      next();
    }
  }
};
</script>

<style lang="less" scoped>
.demo-input {
  width: 320px;
  margin-right: 8px;
}

.demo-tip {
  margin: 10px 0 0;
  font-size: 13px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}

.order-code {
  margin: 0;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.9;
  color: #595959;
}
</style>
