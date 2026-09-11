<template>
  <demo-page
    title="自定义指令"
    description="指令用于对「纯 DOM 行为」做复用（聚焦、复制、拖拽、埋点等）。组件适合抽象「带 UI 的行为」，指令适合抽象「不带 UI 的 DOM 操作」。">
    <demo-block
      :index="1"
      title="v-focus —— 页面加载后自动聚焦"
      description="最经典的入门指令：在 inserted 钩子（元素插入 DOM 后）调用 el.focus()。"
      code="directives: {
  focus: {
    inserted (el) { el.focus(); }
  }
}

// 使用
<input v-focus />">
      <input v-focus class="demo-input" placeholder="页面加载后我自动获得了焦点">
    </demo-block>

    <demo-block
      :index="2"
      title="v-copy —— 点击复制指令值"
      description="指令的 binding.value 把数据传给指令；钩子里通过 vnode.context 拿到组件实例，可以调用组件的 $message 做反馈。"
      code="copy: {
  bind (el, binding, vnode) {
    el.handler = () => {
      copyToClipboard(binding.value);
      vnode.context.$message.success('已复制：' + binding.value);
    };
    el.addEventListener('click', el.handler);
  },
  unbind (el) { el.removeEventListener('click', el.handler); }
}

// 使用
<el-button v-copy="'要复制的文本'">点我复制</el-button>">
      <el-button v-copy="'前端技术沉淀 · v-copy 指令'" size="small" type="primary">
        点我复制文本
      </el-button>
    </demo-block>

    <demo-block
      :index="3"
      title="v-color —— 指令的 value 与动态更新"
      description="bind 只在首次绑定执行；数据变化要靠 update / componentUpdated 钩子同步 DOM。"
      code="color: {
  bind (el, binding) { el.style.color = binding.value; },
  update (el, binding) { el.style.color = binding.value; }
} ">
      <p v-color="color" class="demo-text">我的颜色由 v-color 指令控制：{{ color }}</p>
      <el-button size="small" @click="switchColor">换色</el-button>
    </demo-block>

    <demo-block
      :index="4"
      title="指令钩子速查"
      description="一个指令生命周期内可用的五个钩子：">
      <ul class="hook-list">
        <li><b>bind</b> —— 指令第一次绑定到元素时调用（只执行一次）</li>
        <li><b>inserted</b> —— 绑定元素插入父节点后调用（可安全操作 DOM 位置）</li>
        <li><b>update</b> —— 所在组件的 VNode 更新时调用</li>
        <li><b>componentUpdated</b> —— 所在组件 VNode 及其子 VNode 全部更新后调用</li>
        <li><b>unbind</b> —— 指令与元素解绑时调用（清理事件监听等副作用）</li>
      </ul>
      <p class="demo-tip">钩子参数：el（DOM 元素）、binding（value/oldValue/arg/modifiers）、vnode、oldVnode。</p>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

export default {
  name: 'VueDirective',
  components: { DemoPage, DemoBlock },
  directives: {
    // 自动聚焦
    focus: {
      inserted (el) {
        el.focus();
      }
    },
    // 点击复制 binding.value
    copy: {
      bind (el, binding, vnode) {
        el.handler = () => {
          const textarea = document.createElement('textarea');
          textarea.value = binding.value;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          // vnode.context 即使用指令的组件实例
          vnode.context.$message.success(`已复制：${binding.value}`);
        };
        el.addEventListener('click', el.handler);
      },
      unbind (el) {
        el.removeEventListener('click', el.handler);
      }
    },
    // 颜色控制：bind + update 保证数据变化同步
    color: {
      bind (el, binding) {
        el.style.color = binding.value;
      },
      update (el, binding) {
        el.style.color = binding.value;
      }
    }
  },
  data () {
    return {
      color: '#1890ff'
    };
  },
  methods: {
    switchColor () {
      const colors = ['#1890ff', '#f5222d', '#52c41a', '#722ed1', '#fa8c16'];
      const next = colors[(colors.indexOf(this.color) + 1) % colors.length];
      this.color = next;
    }
  }
};
</script>

<style lang="less" scoped>
.demo-input {
  width: 320px;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: #1890ff;
  }
}

.demo-text {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}

.hook-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}

.demo-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #999;
}
</style>
