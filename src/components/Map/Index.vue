<template>
  <div class="map-box">
    <!-- 地图 -->
    <div id="lsGlobe" class="fullSize"></div>

    <!-- 工具箱 -->
    <div class="tools-box" @click="handleShowTool">
      <img title="点击展开工具箱" class="tools-btn" src="@static/img/tools.png" />
      <div class="tools-text">工具箱</div>
    </div>

    <!-- 操作列 -->
    <div v-if="isShowTool" class="tools-wrapper">
      <div class="tools-body">
        <!-- 隐患覆盖区域 -->
        <div class="writeMonitorRegionTools">
          <div class="w_title">隐患覆盖区域</div>
          <div class="change_tools" index="1">
            <div
              v-for="(item, index) in warningList"
              :key="index"
              :title="item.title"
              :value="item.value"
              :class="item.class"
              @click="handleWarningClick(item.value)"
            >
              <template v-if="item.type === 'image'">
                <img :src="item.src" alt="" />
              </template>
              <template v-else>
                <span>{{ item.text }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- 点线面板 -->
        <div class="writeMonitorRegionTools">
          <div class="w_title">点线面板</div>
          <div class="change_tools" index="0">
            <div title="打点" value="point" class="box red">
              <img src="http://139.159.139.174:9999/images/Project/tools/drawPoint.png" alt="" />
            </div>
            <div title="距离" value="drawDistance" class="box blue">
              <img src="http://139.159.139.174:9999/images/Project/tools/cj.png" alt="" />
            </div>
            <div title="面积" value="drawMeasure" class="box yellow">
              <img src="http://139.159.139.174:9999/images/Project/tools/mj.png" alt="" />
            </div>
            <div title="高度" value="drawHeight" class="box green">
              <img src="http://139.159.139.174:9999/images/Project/tools/height.png" alt="" />
            </div>
            <div title="清除所有" value="clearAll" class="box green">
              <img src="http://139.159.139.174:9999/images/Project/tools/clearAll.png" alt="" />
            </div>
          </div>
        </div>

        <!-- 规划逃跑路线 -->
        <div class="writeMonitorRegionTools">
          <div class="w_title">规划逃跑路线</div>
          <div class="change_tools" index="2">
            <div title="开启录入" class="startEscapRoute box green">
              <img src="http://139.159.139.174:9999/images/Project/tools/startlr.png" alt="" />
            </div>
            <div title="结束录入" class="stopEscapRoute box red">
              <img src="http://139.159.139.174:9999/images/Project/tools/stoplr.png" alt="" />
            </div>
            <div title="撤销" class="resetLineOwn box red">
              <span style="white-space: nowrap">撤销</span>
            </div>
          </div>
        </div>

        <!-- 巡检 -->
        <div class="writeMonitorRegionTools">
          <div class="w_title">巡检</div>
          <div class="change_tools" index="2">
            <div title="开始巡检" value="startFlyTo" class="startFlyTo box green">
              <img src="http://139.159.139.174:9999/images/Project/tools/pause.png" alt="" />
            </div>
            <div title="暂停巡检" value="pulseFlyTo" class="pulseFlyTo box blue">
              <img src="http://139.159.139.174:9999/images/Project/tools/startEscape.png" alt="" />
            </div>
            <div title="停止巡检并清空路线" value="stopFlyTo" class="stopFlyTo box red">
              <img src="http://139.159.139.174:9999/images/Project/tools/stop.png" alt="" />
            </div>
            <div title="节点飞行时长" class="box red">
              <input id="flyToLineTime" type="number" min="2" max="100" value="5" style="max-width: 45px" />
            </div>
          </div>
          <div class="fly-list-view"></div>

          <div class="tools-btn">
            <span id="addFlyToLine" style="display: flex; align-items: center; justify-content: center">
              <img
                src="http://139.159.139.174:9999/images/Project/tools/add.png"
                style="margin-right: 5px; width: 15px; height: 15px"
                alt=""
              />新增巡检</span
            >
          </div>
        </div>

        <!-- 压平管理 -->
        <div class="writeMonitorRegionTools">
          <!--显示模型中的压平面-->
          <div class="w_title">压平管理</div>
          <div class="layer-item-content" id="flat-content"></div>
          <!--创建压平面、设置压平面属性-->
          <div class="analysisBtn" id="CreatPolygon">
            创建压平面
          </div>
          <div class="analysisBox" style="display: none;" data-id="">
            <div class="w_title">压平设置</div>
            <div class="w_title">
              压平面名称：
              <input type="text" id="FlatName" class="basicPolygonH" value="未命名面" />
            </div>
            <div class="w_title">
              压平面高度： <input type="number" id="FlatHeight" class="basicPolygonH" value="0" max="100" />米
            </div>
            <div class="analysisBtn" id="sureFlat">确定</div>
            <div class="analysisBtn cancel" id="cancelFlat">取消</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EntityEdit from './EntityEdit.js'
export default {
  components: {},
  data() {
    return {
      isShowTool: false,
      viewer: null, // Cesium视图实例
      handler: null, // 事件处理器
      drawing: false, // 绘制状态标志
      positions: [], // 存储坐标点数组
      tempEntities: [], // 临时图形实体
      polygonColor: '#FF000080', // 可配置的多边形颜色（支持透明度）
      // 新增预警列表
      warningList: [
        {
          title: '红色预警',
          value: 'RED',
          class: 'box red',
          type: 'image',
          src: 'http://139.159.139.174:9999/images/Project/tools/red.png'
        },
        {
          title: '蓝色预警',
          value: 'BLUE',
          class: 'box blue',
          type: 'image',
          src: 'http://139.159.139.174:9999/images/Project/tools/blue.png'
        },
        {
          title: '黄色预警',
          value: 'YELLOW',
          class: 'box yellow',
          type: 'image',
          src: 'http://139.159.139.174:9999/images/Project/tools/yellow.png'
        },
        {
          title: '绿色安全',
          value: 'GREEN',
          class: 'box green',
          type: 'image',
          src: 'http://139.159.139.174:9999/images/Project/tools/green.png'
        },
        {
          title: '回滚一级',
          value: 'reset',
          class: 'resetPolygon',
          type: 'text',
          text: '撤销'
        }
      ]
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      let subdomains = ['0', '1', '2', '3', '4', '5', '6', '7']
      // 初始化地球
      this.viewer = new LSGlobe.Viewer('lsGlobe', {
        baseLayerPicker: false,
        sceneModePicker: false,
        fullscreenButton: false,
        guid: '1903883411',
        //许可码
        licenseUrl: 'http://139.159.139.174:9999/wish3dearth/api/access/v1.0.0' // 许可服务地址
      })
      this.viewer.scene.globe.translucency.frontFaceAlphaByDistance = new LSGlobe.NearFarScalar(-10.0, 1.0, 800.0, 1.0)
      this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true
      this.viewer.scene.globe.translucency.enabled = true //开启地表透明度设置
      this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 10
      // 加载ArcGIS卫星图
      let ArcGISLayer = new LSGlobe.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
      })
      this.viewer.imageryLayers.addImageryProvider(ArcGISLayer)

      // 影像注记-路网
      let ImageLabel = new LSGlobe.WebMapTileServiceImageryProvider({
        url:
          'http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=24138528cf64d71be24834e9b0720b6b',
        layer: 'tdtCiaLayer',
        subdomains: subdomains,
        style: 'default',
        format: 'image/jpeg',
        credit: new LSGlobe.Credit('天地图全球影像注记'),
        tileMatrixSetID: 'GoogleMapsCompatible'
      })
      // 默认增加路网展示
      this.viewer.imageryLayers.addImageryProvider(ImageLabel)
    },
    // 展示工具箱
    handleShowTool() {
      this.isShowTool = !this.isShowTool
    },
    // 点击预警
    handleWarningClick(value) {
      switch (value) {
        case 'RED':
          // 处理红色预警点击事件
          console.log('红色预警被点击')
          break
        case 'BLUE':
          // 处理蓝色预警点击事件
          console.log('蓝色预警被点击')
          break
        case 'YELLOW':
          // 处理黄色预警点击事件
          console.log('黄色预警被点击')
          break
        case 'GREEN':
          // 处理绿色安全点击事件
          console.log('绿色安全被点击')
          break
        case 'reset':
          // 处理回滚一级点击事件
          console.log('回滚一级被点击')
          break
        default:
          console.log('未知的点击事件')
      }
    },
    // 绘制隐患点覆盖区域
    handleDrawDegion() {}
  },
  beforeDestroy() {}
}
</script>

<style lang="less" scoped>
.map-box {
  text-align: center;
  position: relative;

  #lsGlobe {
    width: 80vw;
    height: 80vh;
  }

  .tools-box {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    width: 60px;
    height: 60px;
    cursor: pointer;

    .tools-btn {
      width: 50px;
      height: 50px;
    }

    .tools-text {
      color: #fff;
    }
  }

  // 操作列
  .tools-wrapper {
    position: absolute;
    top: 30px;
    left: 70px;
    width: 200px;
    cursor: pointer;

    .tools-body {
      overflow: hidden;
      top: -58px;
      left: 60px;
      padding: 5px 10px;
      border-radius: 10px;
      color: white;
      background-color: rgba(0, 0, 0, 0.349);
      user-select: none;

      .writeMonitorRegionTools {
        margin-top: 5px;
        border-top: 1px solid rgba(255, 255, 255, 0.178);

        &:nth-of-type(1) {
          border-top: 0;
        }

        .w_title {
          font-size: 13px;
          padding: 2px 3px;
          text-align: left;
        }

        .change_tools {
          display: flex;
          background-color: rgba(0, 0, 0, 0.37);
          color: white;
          font-size: 14px;
          padding: 5px 6px;
          align-items: center;

          .box {
            width: 20px;
            height: 20px;
            margin: 5px;
            cursor: pointer;
            box-sizing: border-box;

            img {
              height: 100%;
            }
          }

          &.active {
            border: 1px solid rgb(255, 255, 255);
            box-shadow: 1px 1px 5px 1px white;
          }
        }

        .tools-btn {
          text-align: right;
          margin: 5px 0;

          span {
            font-size: 12px;
            cursor: pointer;
            color: white;
            padding: 2px 5px;
            border-radius: 2px;
            background-color: rgb(116, 184, 240);
            white-space: nowrap;
            margin: 0 5px;
          }

          .reload {
            background-color: rgba(245, 78, 78, 0.767);
          }
        }

        /*创建压平面、确定、取消按钮设置*/
        .analysisBtn {
          font-size: 9pt;
          user-select: none;
          cursor: default;
          height: 30px;
          border-radius: 3px;
          background: rgb(116, 184, 240);
          color: #fff;
          text-align: center;
          line-height: 30px;
          margin: 15px;

          &.disabled {
            background: #c0c0c0;
            cursor: not-allowed;
          }

          &:hover {
            background: rgb(116, 184, 240);
          }

          &.disabled:hover {
            background: #c0c0c0;
          }

          &.cancel {
            background: #e3e3e3;
            color: #333;
          }

          &.cancel:hover {
            background: #cdcdcd;
          }
        }

        /*压平面名称、高度设置*/
        #sureFlat {
          margin-top: 20px;
          margin-left: 0px;
          margin-right: 0px;
        }

        #cancelFlat {
          margin-top: 5px;
          margin-left: 0px;
          margin-right: 0px;
        }
      }
    }
  }
}
</style>
