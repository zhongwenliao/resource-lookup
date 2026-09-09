<template>
  <section class="demo-block">
    <div class="block-header">
      <h3 class="block-title">
        <span class="block-index">{{ index }}.</span> {{ title }}
      </h3>
      <p v-if="description" class="block-desc">{{ description }}</p>
    </div>
    <div class="block-demo">
      <slot></slot>
    </div>
    <pre v-if="code" class="block-code"><code>{{ code }}</code></pre>
  </section>
</template>

<script>
/**
 * 演示块：块标题 + 说明 + 可交互演示区 + 代码要点
 * code 传字符串时展示代码片段，方便对照实现
 */
export default {
  name: 'DemoBlock',
  props: {
    index: { type: [Number, String], default: 1 },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    code: { type: String, default: '' }
  }
};
</script>

<style lang="less">
.demo-block {
  margin-bottom: 24px;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;

  .block-header {
    padding: 16px 20px 0;

    .block-title {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 600;
      color: #262626;

      .block-index {
        color: #1890ff;
        margin-right: 4px;
      }
    }

    .block-desc {
      margin: 0;
      font-size: 13px;
      line-height: 1.7;
      color: #888;
    }
  }

  .block-demo {
    padding: 20px;
  }

  .block-code {
    margin: 0;
    padding: 14px 20px;
    background: #fafafa;
    border-top: 1px dashed #e8e8e8;
    border-radius: 0 0 4px 4px;
    font-size: 12px;
    line-height: 1.7;
    color: #595959;
    overflow-x: auto;
  }
}
</style>
