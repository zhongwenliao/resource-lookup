<template>
  <div class="aside">
    <div class="menu">
      <h2>资源查询</h2>
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
                <a href="javascript:;" @click="handleGoLink" class="menu-lv3">
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
        text: '猜你喜欢'
      }, {
        text: '音乐资源',
        menus: [{
          text: '歌名'
        }, {
          text: '歌词'
        }]
      }, {
        text: '视频资源',
        menus: [{
          text: '电影'
        }, {
          text: '电视剧'
        }, {
          text: '综艺'
        }, {
          text: '动漫'
        }, {
          text: '其他'
        }]
      }, {
        text: '应用资源',
        menus: [{
          text: '安卓APP'
        }, {
          text: '苹果APP'
        }, {
          text: '桌面应用'
        }, {
          text: 'MAC专区'
        }]
      }, {
        text: '实体经营',
        menus: [{
          text: '手机卡'
        }, {
          text: '信用卡'
        }, {
          text: '贴膜'
        }]
      }, {
        text: '其他',
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
    },
    handleGoLink () {

    }
  }
}
</script>
<style lang="less">

</style>
