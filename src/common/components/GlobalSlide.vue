<template>
  <div class="aside">
    <div class="menu">
      <h2>资源查询</h2>
      <dl class="menu-list">
        <dd v-for="(aslide, i) in aslideConfig" :key="i" :class="{ act: aslide.active }">
          <a href="javascript:;" class="menu-lv2" :class="{ act: aslide.active }" @click="handleGoLink(aslide)">
            <span>{{ aslide.meta.name }}</span>
            <i
              v-if="aslide.children"
              class="pull-right icon-btn"
              :class="aslide.children && aslide.active ? 'el-icon-arrow-down' : 'el-icon-arrow-right'"
              @click="handleListToggle(aslide)"
              title="展开"
            ></i>
          </a>
          <ul class="menu-sub">
            <li v-for="sub in aslide.children" :key="sub.path">
              <a href="javascript:;" class="menu-lv3" @click="handleGoLink(sub)">
                <span>{{ sub.meta.name }}</span>
              </a>
            </li>
          </ul>
        </dd>
      </dl>
    </div>
    <a
      href="javascript:void(0);"
      :title="folding ? '展开' : '收起'"
      class="btn-fold-menu"
      :class="{ retract: folding }"
      @click="handleMenuToggle"
    ></a>
  </div>
</template>
<script>
import { getAsideConfig } from '@/router.js'

export default {
  data() {
    return {
      // 折叠
      folding: false,
      // 侧边栏数据
      aslideConfig: []
    }
  },
  created() {
    const { configAslide } = getAsideConfig()
    this.aslideConfig = [...configAslide]
  },
  methods: {
    // 点击菜单折叠
    handleMenuToggle() {
      this.folding = !this.folding
      this.$emit('handMenuToggle', this.folding)
    },
    // 点击列表按钮
    handleListToggle(v) {
      this.aslideConfig.forEach(i => {
        if (i.name === v.name) {
          this.$set(i, 'active', true)
        } else {
          i.active = false
        }
      })
    },
    // 跳转链接
    handleGoLink(v) {
      if (v.name !== this.$route.name) {
        this.$router.push(v)
      }
    }
  }
}
</script>
<style lang="less" scoped>
.icon-btn {
  line-height: 30px;
  padding-right: 10px;
}
</style>
