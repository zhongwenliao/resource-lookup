<template>
  <div class="aside">
    <div class="menu">
      <h2>资源查询</h2>
      <dl class="menu-list">
        <dd v-for="aslide in aslideConfig"
            :key="aslide.path">
          <a href="javascript:;" class="menu-lv2"
             :class="{'act qc-aside-select': aslide.meta.module === menuList[0]}">
            <span>{{ aslide.meta.name }}</span>
            <i v-if="aslide.children"
               style="line-height: 30px; padding-right: 10px;"
               class="pull-right"
               :class="aslide.children ? 'el-icon-arrow-right' : 'el-icon-arrow-down'"
               title="展开"
               @click="handleFold"></i>
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
  computed: {
    // 侧边栏数据
    aslideConfig() {
      return getAsideConfig().configAslide
    }
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
  created() {
    console.log(this.$route.meta);
  },
  methods: {
    // 点击折叠按钮
    onClickMenuToggle () {
      this.folding = !this.folding;
      this.$emit('handMenuToggle', this.folding);
    },
    handleGoLink (i) {
      this.$router.push({path: i.path});
      console.log('这里是调整');
    },
    handleFold() {
      console.log('折叠侧边栏');
    }
  }
}
</script>
<style lang="less">

</style>
