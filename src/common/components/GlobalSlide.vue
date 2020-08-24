<template>
  <div class="aside">
    <div class="menu">
      <h2>资源查询</h2>
      <dl class="menu-list">
        <dd v-for="(aslide, i) in aslideConfig"
            :key="i"
            :class="{'act': aslide.active}">
          <a href="javascript:;"
             class="menu-lv2"
             :class="{'act': aslide.active}"
             @click="handleGoLink(aslide)">
            <span>{{ aslide.meta.name }}</span>
            <i v-if="aslide.children"
               style="line-height: 30px; padding-right: 10px;"
               class="pull-right"
               :class="aslide.children && aslide.active? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
               title="展开"></i>
          </a>
          <ul class="menu-sub">
            <li v-for="sub in aslide.children"
                :key="sub.path">
                <a href="javascript:;"
                   class="menu-lv3"
                   @click="handleGoLink(sub)">
                  <span>{{ sub.meta.name }}</span>
                </a>
            </li>
          </ul>
        </dd>
      </dl>
    </div>
    <a href="javascript:void(0);"
       :title="folding ? '展开' : '收起' "
       class="btn-fold-menu"
       :class="{retract: folding}"
       @click="onClickMenuToggle"></a>
  </div>
</template>
<script>
import { getAsideConfig } from '@/router.js';

export default {
  props: {
  },
  data () {
    return {
      // 折叠
      folding: false,
      // 侧边栏数据
      aslideConfig: []
    };
  },
  created () {
    const { configAslide } = getAsideConfig();
    this.aslideConfig = [ ...configAslide ];
  },
  methods: {
    // 点击折叠按钮
    onClickMenuToggle () {
      this.folding = !this.folding;
      this.$emit('handMenuToggle', this.folding);
    },
    // 跳转链接
    handleGoLink (v) {
      this.aslideConfig.forEach(e => {
        if (e.name === v.name) {
          this.$set(e, 'active', true);
        } else {
          e.active = false;
        }
      });
      this.$router.push({path: v.path});
    }
  }
}
</script>
<style lang="less">

</style>
