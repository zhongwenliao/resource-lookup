<template>
  <div class="aside" data-focus="二级带tab">
            <div id="menubar" role="menubar" tabindex="0" aria-labelledby="nav_title" aria-hidden="false" class="menu">
                <h2 id="nav_title" tabindex="-1">
                    典型页面
                </h2>
                <hr class="line-mod">
                <dl id="aside_nav" aria-orientation="vertical" role="menu" aria-activedescendant="ul_a_3" class="menu-list">
                    <dd role="menuitem" aria-haspopup="true" aria-expanded="false" class=" act" aria-selected="true">
                        <a aria-selected="false" role="menuitemradio" id="list_a_0" aria-controls="list_0" href="javascript:;" class="menu-lv2"><span>框架</span> <i aria-live="polite" class="white-down-icon">收起</i></a>
                        <ul role="menu" id="list_0" class="menu-sub" style="display: none;">
                            <li role="menuitem">
                                <a href="layout-leve-1.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>一级</span></a>
                            </li>
                            <li role="menuitem">
                                <a href="layout-leve-1-tab.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>一级带tab</span></a>
                            </li>
                            <li role="menuitem">
                                <a href="layout-leve-2.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>二级</span></a>
                            </li>
                            <li role="menuitem">
                                <a href="layout-leve-2-tab.html" aria-selected="false" role="menuitemradio" class="menu-lv3 act"><span>二级带tab</span></a>
                            </li>
                            <li role="menuitem">
                                <a href="layout-bread-crumb.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>面包屑</span></a>
                            </li>
                        </ul>
                    </dd>
                    <dd role="menuitem" aria-haspopup="false" aria-expanded="true">
                        <a aria-selected="false" role="menuitemradio" id="list_a_1" aria-controls="list_1" href="login.html" class="menu-lv2"><span>登录页</span> <!----></a> <!---->
                    </dd>
                    <dd role="menuitem" aria-haspopup="false" aria-expanded="true">
                        <a aria-selected="false" role="menuitemradio" id="list_a_2" aria-controls="list_2" href="layout.html" class="menu-lv2"><span>布局</span> <!----></a> <!---->
                    </dd>
                    <dd role="menuitem" aria-haspopup="true" aria-expanded="false">
                        <a aria-selected="false" role="menuitemradio" id="list_a_3" aria-controls="list_3" href="javascript:;" class="menu-lv2"><span>空白&amp;引导页&amp;</span> <i aria-live="polite" class="white-down-icon">收起</i></a>
                        <ul role="menu" id="list_3" class="menu-sub" style="display: none;">
                            <li role="menuitem">
                                <a id="ul_a_0" href="blank-1.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>空白一</span></a>
                            </li>
                            <li role="menuitem">
                                <a id="ul_a_1" href="http://10.100.65.223/open_proj/proj_qcloud_v2/seal/css/errorpage/errorpage.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>404</span></a>
                            </li>
                            <li role="menuitem">
                                <a id="ul_a_2" href="http://10.100.65.223/open_proj/proj_qcloud_v2/seal/css/errorpage/errorpage-502.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>502</span></a>
                            </li>
                        </ul>
                    </dd>
                    <dd role="menuitem" aria-haspopup="true" aria-expanded="false">
                        <a aria-selected="false" role="menuitemradio" id="list_a_4" aria-controls="list_4" href="javascript:;" class="menu-lv2"><span>概览页</span> <i aria-live="polite" class="white-down-icon">收起</i></a>
                        <ul role="menu" id="list_4" class="menu-sub" style="display: none;">
                            <li role="menuitem">
                                <a id="ul_a_0" href="overview-1.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>概览一</span></a>
                            </li>
                        </ul>
                    </dd>
                    <dd role="menuitem" aria-haspopup="true" aria-expanded="false">
                        <a aria-selected="false" role="menuitemradio" id="list_a_5" aria-controls="list_5" href="javascript:;" class="menu-lv2"><span>列表页</span> <i aria-live="polite" class="white-down-icon">收起</i></a>
                        <ul role="menu" id="list_5" class="menu-sub" style="display: none;">
                            <li role="menuitem">
                                <a id="ul_a_0" href="list-1-leve-1.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>列表一</span></a>
                            </li>
                            <li role="menuitem">
                                <a id="ul_a_1" href="list-2-leve-1-tab.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>tab+列表</span></a>
                            </li>
                            <li role="menuitem">
                                <a id="ul_a_2" href="list-3-leve-1-search-2.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>查询/检索+列表</span></a>
                            </li>
                        </ul>
                    </dd>
                    <dd role="menuitem" aria-haspopup="true" aria-expanded="false">
                        <a aria-selected="false" role="menuitemradio" id="list_a_6" aria-controls="list_6" href="javascript:;" class="menu-lv2"><span>详情页</span> <i aria-live="polite" class="white-down-icon">收起</i></a>
                        <ul role="menu" id="list_6" class="menu-sub" style="display: none;">
                            <li role="menuitem">
                                <a id="ul_a_0" href="detail-1-leve-2-tab.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>tab+表单</span></a>
                            </li>
                            <li role="menuitem">
                                <a id="ul_a_1" href="detail-3-leve-2.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>两列表单</span></a>
                            </li>
                            <li role="menuitem">
                                <a id="ul_a_2" href="detail-2-leve-2.html" aria-selected="false" role="menuitemradio" class="menu-lv3"><span>分步</span></a>
                            </li>
                        </ul>
                    </dd>
                </dl>
            </div><a id="jsFoldMenu" href="javascript:void(0);" tabindex="0" title="收起" class="btn-fold-menu">收起</a>
        </div>
</template>
<script>
export default {
  data () {
    return {

    };
  }
}
</script>
<style lang="less">

</style>
