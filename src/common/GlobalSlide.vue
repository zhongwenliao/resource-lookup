<template>
  <div class="aside" data-focus="二级带tab">
    <div class="menu">
      <h2>资源共享</h2>
      <dl class="menu-list">
        <dd class="act">
          <a href="javascript:;" class="menu-lv2">
            <span>框架</span>
            <i class="white-down-icon">收起</i>
          </a>
          <ul class="menu-sub">
            <li>
                <a href="javascript:;" class="menu-lv3"><span>一级</span></a>
            </li>
            <li>
                <a href="javascript:;" class="menu-lv3 act"><span>一级带tab</span></a>
            </li>
            <li>
                <a href="javascript:;" class="menu-lv3"><span>二级</span></a>
            </li>
          </ul>
        </dd>
        <dd>
          <a href="javascript:;" class="menu-lv2"><span>登录页</span></a>
        </dd>
        <dd>
          <a href="javascript:;" class="menu-lv2"><span>布局</span></a>
        </dd>
      </dl>
    </div>
    <a href="javascript:void(0);"
       title="收起"
       class="btn-fold-menu"
       @click="onClickMenuToggle">收起</a>
  </div>
</template>
<script>
export default {
  props: {
  },
  data () {
    return {
      // 折叠
      folding: false
    };
  },
  methods: {
    // 点击折叠按钮
    onClickMenuToggle () {
      this.folding = !this.folding;
      this.$emit('handMenuToggle', this.folding);
    }
  }
}
</script>
<style lang="less">

</style>
