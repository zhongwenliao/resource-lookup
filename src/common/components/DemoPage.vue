<template>
  <div class="demo-page">
    <header class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="description" class="page-desc">{{ description }}</p>
    </header>
    <slot></slot>
  </div>
</template>

<script>
// 页面级容器：统一「标题 + 描述 + 内容块」的文档式版式
export default {
  name: 'DemoPage',
  props: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="less" scoped>
.demo-page {
  max-width: 960px;
  padding: 32px 24px 48px;
  margin: 0 auto;
}

.page-header {
  padding-bottom: 20px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e8e8e8;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #262626;
}

.page-desc {
  max-width: 720px;
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.8;
  color: #888;
}
</style>
