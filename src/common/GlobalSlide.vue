<template>
  <div class="aside">
    <div class="menu">
      <h2>腾讯云智·天枢平台</h2>
      <dl class="menu-list">
        <dd class="act"
            v-for="menu in menuList"
            :key="menu.text">
          <a href="javascript:;" class="menu-lv2"
              :class="{act: menu === menuList[0]}">
            <span>{{ menu.text }}</span>
            <i v-if="menu.menus" class="white-down-icon">收起</i>
          </a>
          <ul class="menu-sub">
            <li v-for="item in menu.menus"
                :key="item.text">
                <a href="javascript:;" class="menu-lv3">
                  <span>{{ item.text }}</span>
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
export default {
  props: {
  },
  data () {
    return {
      // 折叠
      folding: false,
      // 菜单列表
      menuList: [{
        text: '实时监控'
      }, {
        text: '布控策略'
      }, {
        text: '检索追溯'
      }, {
        text: '数据分析',
        menus: [{
          text: '客群分析'
        }, {
          text: '用户分析'
        }]
      }, {
        text: '资源管理',
        menus: [{
          text: '设备管理'
        }, {
          text: '人脸库管理'
        }]
      }, {
        text: '系统管理',
        menus: [{
          text: '帐户权限'
        }, {
          text: '历史记录'
        }]
      }]
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
