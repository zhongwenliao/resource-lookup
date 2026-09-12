<template>
  <demo-page
    title="插槽三种用法"
    description="插槽是 Vue 内容分发的核心机制：父组件决定「渲染什么」，子组件决定「渲染在哪」。Vue 2.6 起推荐 v-slot 统一语法。">
    <demo-block
      :index="1"
      title="默认插槽"
      description="父组件传入的内容会替换子组件 <slot> 标签；子组件 slot 内写的内容是「兜底内容」，父组件不传时显示。"
      code="// 子组件
<div class=&quot;card-body&quot;><slot>这是兜底内容</slot></div>

// 父组件
<fancy-card>父组件分发的内容</fancy-card>">
      <fancy-card>
        <p class="demo-result">父组件分发到默认插槽的内容</p>
      </fancy-card>
      <fancy-card></fancy-card>
      <p class="demo-tip">↑ 第二张卡片什么都没传，展示的是子组件的兜底内容</p>
    </demo-block>

    <demo-block
      :index="2"
      title="具名插槽"
      description="子组件用 name 命名多个出口，父组件用 v-slot:name（缩写 #name）定向填充。"
      code="// 子组件
<slot name=&quot;header&quot;>默认头部</slot>

// 父组件（Vue 2.6 语法）
<template v-slot:header>标题</template>">
      <fancy-card>
        <template v-slot:header>
          <b>具名插槽填充的头部</b>
        </template>
        默认插槽内容
        <template v-slot:footer>
          <i>具名插槽填充的底部</i>
        </template>
      </fancy-card>
    </demo-block>

    <demo-block
      :index="3"
      title="作用域插槽 —— 子传数据给父渲染"
      description="子组件在 slot 上绑定数据（slot props），父组件拿到数据自己决定怎么渲染。组件库的表格列自定义、列表项定制都基于它。"
      code="// 子组件：把数据绑在 slot 上
<slot name=&quot;footer&quot; :time=&quot;time&quot; :author=&quot;author&quot;>兜底</slot>

// 父组件：解构 slot props
<template v-slot:footer=&quot;{ time, author }&quot;>...</template>">
      <fancy-card>
        <template v-slot:footer="{ time, author }">
          <span class="demo-value">父组件渲染：作者 {{ author }}，卡片渲染时间 {{ time }}</span>
        </template>
      </fancy-card>
      <p class="demo-tip">↑ 底部内容由子组件提供数据、父组件定义渲染，点击下方按钮让子组件更新数据：</p>
      <el-button size="small" type="primary" @click="refreshTime">子组件刷新 time</el-button>
      <fancy-card v-if="showFresh" :key="timeKey">
        <template v-slot:footer="{ time }">
          <span class="demo-value">最新 time：{{ time }}</span>
        </template>
      </fancy-card>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 演示用子组件：三种插槽出口齐备
const FancyCard = {
  name: 'FancyCard',
  template: `
    <div class="fancy-card">
      <div class="card-header"><slot name="header">默认头部（兜底）</slot></div>
      <div class="card-body"><slot>这是默认插槽的兜底内容</slot></div>
      <div class="card-footer">
        <slot name="footer" :time="time" :author="author">底部（兜底）</slot>
      </div>
    </div>
  `,
  data () {
    return {
      time: new Date().toLocaleTimeString(),
      author: '沉淀者'
    };
  }
};

export default {
  name: 'VueSlots',
  components: { DemoPage, DemoBlock, FancyCard },
  data () {
    return {
      showFresh: false,
      timeKey: 0
    };
  },
  methods: {
    // 通过 key 重建子组件，模拟子组件数据更新后作用域插槽重新渲染
    refreshTime () {
      this.timeKey += 1;
      this.showFresh = true;
    }
  }
};
</script>

<style lang="less" scoped>
.fancy-card {
  margin-bottom: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  font-size: 14px;

  .card-header {
    padding: 10px 16px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
  }

  .card-body {
    padding: 16px;
  }

  .card-footer {
    padding: 10px 16px;
    background: #fafafa;
    border-top: 1px solid #f0f0f0;
  }
}

.demo-tip {
  margin: 8px 0 12px;
  font-size: 13px;
  color: #999;
}

.demo-value {
  font-size: 13px;
  color: #666;
}
</style>
