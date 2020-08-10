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
             @click="handleGoLink(aslide,i)">
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
  computed: {
    // // 侧边栏数据
    // aslideConfig() {
    //   return getAsideConfig().configAslide
    // }
  },
  data () {
    return {
      // 折叠
      folding: false,
      aslideConfig: [],
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
  created () {
    const { configAslide } = getAsideConfig();
    this.aslideConfig = { ...configAslide };
  },
  methods: {
    // 点击折叠按钮
    onClickMenuToggle () {
      this.folding = !this.folding;
      this.$emit('handMenuToggle', this.folding);
    },
    // 跳转链接
    handleGoLink (v, i) {
      if (v.children) {
        if (v['active']) {
          v.active = false;
        } else {
          this.$set(this.aslideConfig[i], 'active', true);
        }
      } else {
        if (v['active']) {
          v.active = false;
        } else {
          this.$set(this.aslideConfig[i], 'active', true);
        }
        this.$router.push({path: v.path});
      }
    }
  }
}
</script>
<style lang="less">

</style>
