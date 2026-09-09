<template>
  <demo-page
    title="双库总览对比：Element UI vs Ant Design Vue"
    description="本项目同时注册了两套组件库（见 main.js），同一场景分别实现，沉淀选型与用法差异。下表为关键维度对比：">
    <demo-block
      :index="1"
      title="对比总表"
      description="两库都是 Vue 2 生态主流中后台组件库，API 风格差异大于能力差异。">
      <el-table :data="compareRows" border size="small">
        <el-table-column prop="dimension" label="维度" width="150"></el-table-column>
        <el-table-column prop="element" label="Element UI 2.x"></el-table-column>
        <el-table-column prop="antd" label="Ant Design Vue 1.x"></el-table-column>
      </el-table>
    </demo-block>

    <demo-block
      :index="2"
      title="注册方式（main.js）"
      description="两库都支持全量注册与按需加载；演示项目为开箱即用选择全量注册。">
      <pre class="block-code-inline"><code>// Element UI
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

// Ant Design Vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
Vue.use(Antd);

// 按需加载（生产项目推荐）
// Element UI: babel-plugin-component
// Ant Design Vue: babel-plugin-import</code></pre>
    </demo-block>

    <demo-block
      :index="3"
      title="表单模型差异（最重要的心智区别）"
      description="Element 的表单数据放在组件 data 里，v-model 双向绑定，rules 声明在 el-form 上；antd 1.x 的表单数据由 form 实例托管，用 v-decorator 注册字段，是「受控模式」。迁移时最容易踩坑的就是这一点。">
      <div class="compare-cards">
        <div class="compare-card element">
          <h4>Element UI：数据在 data</h4>
          <pre><code>&lt;el-form :model="form" :rules="rules"&gt;
  &lt;el-form-item prop="name"&gt;
    &lt;el-input v-model="form.name" /&gt;
  &lt;/el-form-item&gt;
&lt;/el-form&gt;</code></pre>
        </div>
        <div class="compare-card antd">
          <h4>Ant Design Vue：数据在 form 实例</h4>
          <pre><code>&lt;a-form :form="form"&gt;
  &lt;a-form-item&gt;
    &lt;a-input v-decorator="['name', { rules }]" /&gt;
  &lt;/a-form-item&gt;
&lt;/a-form&gt;</code></pre>
        </div>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="同场景实战对照"
      description="表单与表格两大高频场景，两库各实现一遍：">
      <ul class="link-list">
        <li><router-link to="/ui/element-form">Element 表单 →</router-link></li>
        <li><router-link to="/ui/element-table">Element 表格 →</router-link></li>
        <li><router-link to="/ui/antd-form">Antd 表单 →</router-link></li>
        <li><router-link to="/ui/antd-table">Antd 表格 →</router-link></li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

export default {
  name: 'UiCompare',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      compareRows: [{
        dimension: '出品方',
        element: '饿了么前端团队',
        antd: '蚂蚁金服（Ant Design 的 Vue 实现）'
      }, {
        dimension: '设计语言',
        element: '中性扁平，CSS 变量主题（theme-chalk）',
        antd: 'Ant Design 规范，less 变量主题'
      }, {
        dimension: '表单验证',
        element: '声明式 rules + v-model（数据在组件）',
        antd: 'getFieldDecorator / v-decorator 受控（数据在 form 实例）'
      }, {
        dimension: '表格',
        element: 'el-table-column 逐列声明 + 作用域插槽',
        antd: 'columns 数组配置 + scopedSlots customRender'
      }, {
        dimension: '消息 / 确认',
        element: 'this.$message / this.$confirm',
        antd: 'this.$message / this.$confirm（API 形态一致）'
      }, {
        dimension: '按需加载',
        element: 'babel-plugin-component',
        antd: 'babel-plugin-import'
      }, {
        dimension: '组件前缀',
        element: 'el-',
        antd: 'a-'
      }]
    };
  }
};
</script>

<style lang="less" scoped>
.block-code-inline {
  margin: 0;
  padding: 14px 16px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.8;
  color: #595959;
  overflow-x: auto;
}

.compare-cards {
  display: flex;

  .compare-card {
    flex: 1;
    border-radius: 4px;
    padding: 12px 16px;

    &.element {
      margin-right: 12px;
      background: #f0f9eb;
      border: 1px solid #e1f3d8;

      h4 { color: #67c23a; }
    }

    &.antd {
      background: #f0f5ff;
      border: 1px solid #d6e4ff;

      h4 { color: #2f54eb; }
    }

    h4 {
      margin: 0 0 8px;
      font-size: 14px;
    }

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.7;
      color: #595959;
      overflow-x: auto;
    }
  }
}

.link-list {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  line-height: 2.2;
}
</style>
