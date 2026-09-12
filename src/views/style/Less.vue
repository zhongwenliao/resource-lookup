<template>
  <demo-page
    title="Less 与 scoped 样式"
    description="本项目的样式方案：Less 预处理（变量/嵌套/mixin/运算）+ scoped 隔离 + postcss-pxtorem 自动换算。">
    <demo-block
      :index="1"
      title="Less：变量、嵌套、mixin、运算"
      description="下方两张卡片由同一 mixin 生成，主题色只用一个变量 @brand，派生色用 Less 内置函数计算："
      code="@brand: #1890ff;          // 变量
.card-style() {            // mixin（带括号不输出）
  border: 1px solid @brand;
  border-radius: 4px;
}
.card {
  .card-style();           // 引用 mixin
  color: darken(@brand, 15%); // 颜色函数
  padding: 8px * 2;        // 运算
}">
      <div class="less-demo">
        <div class="card">
          <h4>卡片一</h4>
          <p>颜色来自变量 @brand 与 darken() 派生</p>
        </div>
        <div class="card light">
          <h4>卡片二</h4>
          <p>浅色变体：lighten(@brand, 35%)</p>
        </div>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="scoped 隔离与深度选择器"
      description="scoped 给当前组件所有元素加 data-v-hash 属性、样式选择器加属性限定，实现样式隔离。但要改「子组件内部元素」的样式时属性对不上，需要深度选择器穿透。下方输入框的边框色就是用 /deep/ 穿透 el-input 改的："
      code="/* scoped 原理 */
.demo-input[data-v-1a2b3c] { ... }

/* 穿透子组件（webpack 3 + vue-loader 13 用 /deep/） */
.demo-input /deep/ .el-input__inner {
  border-color: @brand;
}

/* vue-loader 15+ 推荐 ::v-deep，纯 CSS 可用 >>> */">
      <el-input
        v-model="demoText"
        class="demo-input"
        placeholder="我的边框被 /deep/ 穿透改成了品牌色"></el-input>
      <p class="demo-tip">输入内容：{{ demoText || '（试试输入）' }}</p>
    </demo-block>

    <demo-block
      :index="3"
      title="px2rem 移动端适配链路"
      description="本项目三件套：index.html 动态设置 rem 基准 → .postcssrc.js 的 postcss-pxtorem 自动把 demos 目录的 px 换算成 rem → 移动端随视口等比缩放，PC 端 1rem = 37.5px 保持原设计。"
      code="// index.html（PC 固定基准，移动端等比）
var fs = w > 750 ? 37.5 : w / 10;
document.documentElement.style.fontSize = fs + 'px';

// .postcssrc.js
'postcss-pxtorem': {
  include: /views/,   // 只处理演示目录
  rootValue: 37.5,    // 1rem = 37.5px
  propList: ['*'],
  minPixelValue: 2    // 小于 2px 不转换（避免 1px 边框失真）
}">
      <ul class="point-list">
        <li>组件库 CSS 来自 node_modules，不经过 postcss，保持原生 px（避免组件库样式被缩放）</li>
        <li>minPixelValue: 2 保护 1px 细边框</li>
        <li>设计稿基准 375px：设计稿量出的 px 直接写，无需心算</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'StyleLess',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      demoText: ''
    };
  }
};
</script>

<style lang="less" scoped>
// 技术点：Less 变量 + 内置颜色函数
@brand: #1890ff;

.less-demo {
  display: flex;

  .card {
    // 技术点：mixin 复用
    .card-style();

    flex: 1;
    margin-right: 12px;

    &:last-child {
      margin-right: 0;
    }

    h4 {
      margin: 0 0 6px;
      // 技术点：颜色函数 + 运算
      color: darken(@brand, 15%);
    }

    p {
      margin: 0;
      font-size: 13px;
      color: #666;
    }

    &.light {
      h4 {
        color: lighten(@brand, 20%);
      }
    }
  }
}

.card-style() {
  padding: 16px;
  border: 1px solid @brand;
  border-radius: 4px;
}

.demo-input {
  width: 360px;

  // 技术点：深度选择器穿透 scoped，改组件库内部样式
  /deep/ .el-input__inner {
    border-color: @brand;

    &:focus {
      border-color: darken(@brand, 10%);
    }
  }
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
</style>
