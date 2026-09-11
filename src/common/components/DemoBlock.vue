<template>
  <section class="demo-block">
    <header class="block-header">
      <span class="block-index">{{ index }}</span>
      <h2 class="block-title">{{ title }}</h2>
    </header>
    <p v-if="description" class="block-desc">{{ description }}</p>
    <div class="block-body">
      <slot></slot>
    </div>
    <pre v-if="code" class="block-code"><code>{{ code }}</code></pre>
  </section>
</template>

<script>
// 内容块容器：序号徽标 + 标题 + 描述 + 内容（可选代码示例）
export default {
  name: 'DemoBlock',
  props: {
    index: {
      type: [Number, String],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    code: {
      type: String,
      default: ''
    }
  }
};
</script>

<style lang="less" scoped>
.demo-block {
  padding: 20px 24px 24px;
  margin-bottom: 20px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

.block-header {
  display: flex;
  align-items: center;
}

.block-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-right: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #1890ff;
  border-radius: 50%;
}

.block-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.block-desc {
  margin: 8px 0 16px;
  font-size: 13px;
  line-height: 1.7;
  color: #888;
}

.block-code {
  margin: 16px 0 0;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.7;
  color: #595959;
  background: #fafafa;
  border: 1px dashed #e8e8e8;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
