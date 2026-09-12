<template>
  <div class="demo-page">
    <div class="demo-header">
      <h2 class="demo-title">{{ title }}</h2>
      <p v-if="description" class="demo-desc">{{ description }}</p>
    </div>
    <slot></slot>
  </div>
</template>

<script>
/**
 * 演示页统一容器：标题 + 描述 + 内容区
 * 所有演示页共用同一结构，保证阅读体验一致
 */
export default {
  name: 'DemoPage',
  props: {
    title: { type: String, required: true },
    description: { type: String, default: '' }
  }
};
</script>

<style lang="less">
.demo-page {
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px;

  .demo-header {
    margin-bottom: 20px;

    .demo-title {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 600;
      color: #262626;
    }

    .demo-desc {
      margin: 0;
      font-size: 14px;
      line-height: 1.7;
      color: #666;
    }
  }
}
</style>
