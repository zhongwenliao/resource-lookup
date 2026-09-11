<template>
  <div class="g-slide" :class="{ folded }">
    <div class="slide-scroll">
      <div v-for="group in asideGroups" :key="group.group" class="menu-group">
        <div class="group-title">{{ group.group }}</div>
        <router-link
          v-for="item in group.items"
          :key="item.path"
          :to="item.path"
          class="menu-item"
          active-class="act">
          <span>{{ item.meta.name }}</span>
        </router-link>
      </div>
    </div>
    <a href="javascript:;"
       class="btn-fold"
       :title="folded ? '展开' : '收起'"
       @click="$emit('handMenuToggle', !folded)">
      {{ folded ? '»' : '«' }} {{ folded ? '' : '收起菜单' }}
    </a>
  </div>
</template>

<script>
// 技术点：路由配置驱动侧边栏 —— 菜单数据来自 router.js 的 getAsideConfig，
// 新增页面只需在 routeConfig 中注册，菜单自动生成，无需改动本组件
import { getAsideConfig } from '@/router.js';

export default {
  name: 'GlobalSlide',
  props: {
    // 折叠状态由父组件 App.vue 持有，通过 prop 下发
    folded: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      asideGroups: []
    };
  },
  created () {
    const { groups } = getAsideConfig();
    this.asideGroups = groups;
  }
};
</script>

<style lang="less">
.g-slide {
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e8e8e8;
  transition: width 0.25s;
  overflow: hidden;

  &.folded {
    width: 0;
    border-right: none;
  }

  .slide-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 12px 0;
  }

  .menu-group {
    margin-bottom: 8px;
  }

  .group-title {
    padding: 8px 16px 4px;
    font-size: 12px;
    color: #999;
  }

  .menu-item {
    display: block;
    padding: 9px 16px 9px 24px;
    font-size: 14px;
    color: #333;
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;

    &:hover {
      background: #f5f5f5;
      color: #1890ff;
    }

    &.act {
      background: #e6f7ff;
      color: #1890ff;
      border-right: 2px solid #1890ff;
    }
  }

  .btn-fold {
    flex-shrink: 0;
    display: block;
    padding: 10px 16px;
    border-top: 1px solid #e8e8e8;
    font-size: 12px;
    color: #666;
    text-decoration: none;
    text-align: center;
    white-space: nowrap;

    &:hover {
      color: #1890ff;
      background: #f5f5f5;
    }
  }
}
</style>
