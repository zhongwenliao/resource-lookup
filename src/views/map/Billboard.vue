<template>
  <demo-page
    title="Cesium 动态广告牌（Billboard）"
    description="广告牌是三维地球上标注点位的基石：POI 兴趣点、车辆定位、传感器状态、军标符号，本质都是「贴在坐标点上的始终面向相机的图片」。本页用 Cesium 的 BillboardCollection 实现动态增删改：点击地球添加、点击图标删除、批量生成数千个验证性能、移动模拟验证实时更新 —— 底图来自项目自带的程序化瓦片服务（npm run tile:server），未启动时显示椭球底色，不影响广告牌功能。">
    <demo-block
      :index="1"
      title="动态广告牌解决什么问题"
      description="三个核心能力，本页演示都能体验：">
      <ul class="point-list">
        <li><b>点位标注</b>：经纬度 + 图标 + 锚点，把业务对象「钉」在地球上，图标始终面向相机（Billboard 之名由此而来）</li>
        <li><b>动态增删改</b>：collection.add / remove / position 赋值，车辆移动、状态变色都是毫秒级更新，无需重建场景</li>
        <li><b>海量渲染</b>：BillboardCollection 是 Primitive 层批渲染 —— 所有图标打进同一张纹理图集，一次 draw call 画完，数千点位依然流畅</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="交互演示：点击地球钉图标，点击图标删除"
      description="左键点击地球任意位置添加当前选中样式的广告牌；点击已有广告牌将其删除。「批量添加」一次生成 500 个随机点位（可连点验证性能），「移动模拟」让所有点位带速度漂移（模拟车流），「清空」移除全部。视角操作：左键拖拽旋转、滚轮缩放、右键倾斜。"
      :code="codePipeline">
      <div class="toolbar">
        <el-select v-model="iconType" size="small" style="width: 110px">
          <el-option v-for="t in ICON_TYPES" :key="t.value" :label="t.label" :value="t.value"></el-option>
        </el-select>
        <el-button size="small" type="primary" :disabled="loading" @click="addBatch">批量 +500</el-button>
        <el-button size="small" :disabled="loading" :type="moving ? 'warning' : 'default'" @click="toggleMove">{{ moving ? '停止移动' : '移动模拟' }}</el-button>
        <el-button size="small" :disabled="loading" @click="clearAll">清空</el-button>
        <span class="label">当前 {{ count }} 个广告牌</span>
      </div>
      <div class="cesium-wrap" ref="container">
        <div v-if="loading" class="cesium-loading">Cesium 引擎加载中（约 10MB，仅首次较慢）…</div>
      </div>
      <div class="state-panel">
        <p>
          <span class="label">操作提示：</span>
          点击地球 = 添加 · 点击图标 = 删除 · 拖拽 = 旋转 · 滚轮 = 缩放 · 右键拖拽 = 倾斜
        </p>
        <p v-if="!tileReady" class="hint">（瓦片服务未启动：npm run tile:server —— 当前为椭球底色，广告牌功能不受影响）</p>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="原理解释：为什么用 BillboardCollection 而不是 Entity"
      description="先建立直觉，再看代码会顺畅很多：">
      <div class="principle">
        <h4>① 两层 API —— Entity 是「声明」，Primitive 是「执行」</h4>
        <p><b>本质</b>：Entity 层（viewer.entities.add）是高层封装 —— 你声明「这里有个广告牌」，Cesium 负责场景图、属性插值、选中高亮；BillboardCollection 是底层集合 —— 你直接操作渲染单元，省去中间层。</p>
        <pre class="mini-diagram">Entity 层：entities.add({ position, billboard })
   └→ 内部创建 BillboardCollection + 属性订阅 + 拾取包装
              ↓ 每帧同步
Primitive 层：billboards.add({ position, image })
   └→ 直接进纹理图集，本帧就画</pre>
        <p><b>取舍</b>：Entity 省心（属性系统、CZML 动画、infoBox 全免费），Primitive 省资源（无中间层开销）。万级以下两者皆可，海量动态点位选 Primitive 层。</p>

        <h4>② 纹理图集 —— 一次 draw call 画完一批</h4>
        <p><b>本质</b>：不同图标的广告牌加入同一 collection 时，Cesium 把各图标纹理合并进一张大图（atlas），渲染时整批广告牌共享一次 GPU 绘制调用，而不是每个图标画一次。</p>
        <p><b>类比</b>：精灵图（sprite sheet）—— CSS 雪碧图把几十个小图标拼一张图减少 HTTP 请求；纹理图集同理，减少的是 draw call。</p>
        <p><b>推论</b>：图标种类越少、尺寸越接近，图集越紧凑，性能越好。几百种随机大图会把图集撑爆。</p>

        <h4>③ 拾取 —— 屏幕坐标反查场景对象</h4>
        <p><b>本质</b>：scene.pick(屏幕坐标) 沿视线发射线，返回第一个命中的对象 { primitive }。命中广告牌时 primitive 就是那个 Billboard 实例，可直接 remove —— 「点谁删谁」由此实现。</p>
        <p><b>注意</b>：pick 命中的是 primitive，不是 id 字段；Entity 层拾取返回的是 entity。两层 API 的拾取结果结构不同，混用会拿错对象。</p>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="核心算法拆解"
      description="图标生成、动态添加、点击拾取、位置更新（与本页演示同逻辑）："
      :code="codeAlgo">
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="广告牌方案的核心取舍与常见坑：">
      <ul class="point-list">
        <li><b>锚点 verticalOrigin</b>：默认图标中心对准坐标点（图标「悬浮」半截）；POI 惯例是 <code>VerticalOrigin.BOTTOM</code> —— 图标底部钉在点位上，尖头水滴才指向正确位置</li>
        <li><b>image 接受 Canvas</b>：不必是 URL —— Canvas 元素直接当纹理，本页所有图标程序化生成，零图片资源</li>
        <li><b>position 是属性赋值</b>：billboard.position = Cartesian3 即时生效，无需 remove/add 重建 —— 移动模拟就是每帧赋值</li>
        <li><b>heightReference</b>：贴地（CLAMP_TO_GROUND）需要地形服务；无地形时用绝对高度，本页高度 0</li>
        <li><b>海量点位上限</b>：单 collection 数万级没问题；十万级考虑分块多 collection 或降级为 Point（更轻）</li>
        <li><b>聚合是 Entity 层能力</b>：EntityCluster 把密集点位按缩放级别聚合，Primitive 层需自己实现（按屏幕密度分桶）</li>
        <li><b>资源释放</b>：viewer.destroy() 会连带销毁 primitives；但 Canvas 纹理图集在 removeAll 后仍驻留，长生命周期页面注意复用图标</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 本地瓦片服务（npm run tile:server）
const TILE_BASE = 'http://127.0.0.1:8083';
const CENTER = [116.39, 39.9]; // 北京
const BATCH = 500;

// 随机点位范围（北京周边，移动模拟的反弹边界）
const RAND = { lon: [116.05, 116.75], lat: [39.75, 40.05] };

// 程序化水滴图标：Canvas 直接当纹理，零图片资源
function makePinIcon (color) {
  const cv = document.createElement('canvas');
  cv.width = 48;
  cv.height = 64;
  const ctx = cv.getContext('2d');
  // 水滴外形：贝塞尔勾轮廓
  ctx.beginPath();
  ctx.moveTo(24, 62);
  ctx.bezierCurveTo(8, 40, 10, 12, 24, 12);
  ctx.bezierCurveTo(38, 12, 40, 40, 24, 62);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 3;
  ctx.stroke();
  // 中心白点
  ctx.beginPath();
  ctx.arc(24, 28, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  return cv;
}

const PIN_COLORS = {
  blue: '#1890ff',
  green: '#52c41a',
  orange: '#fa8c16',
  purple: '#722ed1',
  red: '#f5222d'
};

export default {
  name: 'MapBillboard',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      iconType: 'blue',
      count: 0,
      moving: false,
      tileReady: false,
      loading: true, // cesium 引擎异步加载中（完成后撤遮罩）
      ICON_TYPES: [
        { value: 'blue', label: '蓝色 POI' },
        { value: 'green', label: '绿色 站点' },
        { value: 'orange', label: '橙色 告警' },
        { value: 'purple', label: '紫色 自建' },
        { value: 'red', label: '红色 重点' }
      ],
      codePipeline: '// 广告牌管线：图标 → collection → 拾取\n' +
        'const icons = makeIcons()                        // Canvas 程序化图标\n' +
        'const billboards = new BillboardCollection()\n' +
        'scene.primitives.add(billboards)                 // 进渲染管线\n' +
        '\n' +
        'billboards.add({ position, image: icons.blue })  // 动态添加，本帧生效\n' +
        'billboards.remove(picked.primitive)              // 拾取命中即删\n' +
        'b.position = Cartesian3.fromDegrees(lon, lat)    // 赋值即移动',
      codeAlgo: '// ① Canvas 程序化图标：image 直接接受 Canvas，零图片资源\n' +
        'function makePinIcon (color) {\n' +
        '  const cv = document.createElement(\'canvas\')\n' +
        '  cv.width = 48; cv.height = 64\n' +
        '  const ctx = cv.getContext(\'2d\')\n' +
        '  ctx.beginPath()                        // 水滴外形\n' +
        '  ctx.moveTo(24, 62)\n' +
        '  ctx.bezierCurveTo(8, 40, 10, 12, 24, 12)\n' +
        '  ctx.bezierCurveTo(38, 12, 40, 40, 24, 62)\n' +
        '  ctx.fillStyle = color\n' +
        '  ctx.fill()\n' +
        '  return cv\n' +
        '}\n\n' +
        '// ② 动态添加：verticalOrigin 让图标底部钉在点位上\n' +
        'const b = billboards.add({\n' +
        '  position: Cartesian3.fromDegrees(lon, lat),\n' +
        '  image: makePinIcon(\'#1890ff\'),\n' +
        '  verticalOrigin: VerticalOrigin.BOTTOM   // 默认 CENTER 会悬浮半截\n' +
        '})\n\n' +
        '// ③ 点击拾取：命中广告牌删除，命中地球添加\n' +
        'handler.setInputAction((click) => {\n' +
        '  const picked = scene.pick(click.position)    // 屏幕坐标反查场景\n' +
        '  if (picked && picked.primitive instanceof Billboard) {\n' +
        '    billboards.remove(picked.primitive)        // 点谁删谁\n' +
        '    return\n' +
        '  }\n' +
        '  const c = camera.pickEllipsoid(click.position)\n' +
        '  if (c) addBillboard(...fromCartesian(c))     // 空白处添加\n' +
        '}, ScreenSpaceEventType.LEFT_CLICK)\n\n' +
        '// ④ 动态移动：position 是可写属性，赋值即时生效\n' +
        'setInterval(() => {\n' +
        '  b._lon += vel.x; b._lat += vel.y\n' +
        '  b.position = Cartesian3.fromDegrees(b._lon, b._lat)\n' +
        '}, 100)\n\n' +
        '// ⑤ 按需渲染：静止时不空转，改动后手动补帧\n' +
        'const viewer = new Viewer(container, {\n' +
        '  requestRenderMode: true,              // 默认 60fps 连续重画\n' +
        '  maximumRenderTimeChange: Infinity\n' +
        '})\n' +
        'scene.requestRender()                   // 增删改后请求一帧'
    };
  },
  async mounted () {
    // 技术点：引擎按需动态加载 —— cesium 预打包产物约 10MB，
    // 静态 import 会把它打进路由 chunk，点菜单得等下载+解析完才渲染页面；
    // 动态 import() 让路由 chunk 保持轻量，页面骨架秒出，引擎异步就位
    const Cesium = await import('cesium');
    if (this._destroyed) return; // 引擎加载期间用户已切走，放弃初始化
    this.Cesium = Cesium;
    const container = this.$refs.container;

    // Viewer：关闭全部 widget 与默认 Ion 影像（免 token）
    // 技术点：requestRenderMode 按需渲染 —— 默认 60fps 连续重画（画面静止也烧
    // CPU/GPU，拖慢同页菜单、过渡等一切 UI）；开启后仅相机/场景变化时出一帧，
    // 程序化改动（增删广告牌、改 position）需手动 scene.requestRender() 补帧
    this.viewer = new Cesium.Viewer(container, {
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      baseLayer: false
    });

    // 瓦片未加载时的椭球底色
    this.viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#dce8f5');
    // 本地程序化瓦片底图（tile-server）；未启动时保持底色，不影响广告牌
    this.viewer.scene.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
      url: TILE_BASE + '/tiles/{z}/{x}/{y}.svg',
      maximumLevel: 18,
      credit: 'local tile-server'
    }));

    // 相机定位北京上空
    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(CENTER[0], CENTER[1], 60000)
    });

    // 图标缓存：同色复用同一 Canvas → 打进同一图集槽位
    this.icons = {};
    Object.keys(PIN_COLORS).forEach((k) => {
      this.icons[k] = makePinIcon(PIN_COLORS[k]);
    });

    // Primitive 层广告牌集合：批渲染，一次 draw call 画整批
    this.billboards = new Cesium.BillboardCollection({ scene: this.viewer.scene });
    this.viewer.scene.primitives.add(this.billboards);

    // 点击拾取：命中广告牌 → 删除；命中地球 → 添加
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    this.handler.setInputAction((click) => {
      const picked = this.viewer.scene.pick(click.position);
      if (Cesium.defined(picked) && picked.primitive instanceof Cesium.Billboard) {
        this.billboards.remove(picked.primitive);
        this.count = this.billboards.length;
        this.viewer.scene.requestRender(); // 按需渲染：删除后补一帧
        return;
      }
      const cartesian = this.viewer.camera.pickEllipsoid(click.position, this.viewer.scene.globe.ellipsoid);
      if (!Cesium.defined(cartesian)) return;
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      this.addBillboard(Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude));
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.loading = false; // 引擎就位，撤掉加载遮罩

    // 瓦片服务健康检查（仅用于页面提示）
    fetch(TILE_BASE + '/health').then((r) => {
      this.tileReady = r.ok;
    }).catch(() => {});
  },
  beforeDestroy () {
    this._destroyed = true; // 引擎还在异步加载时切走：通知 mounted 放弃初始化
    if (this._moveTimer) clearInterval(this._moveTimer);
    if (this.handler) this.handler.destroy();
    if (this.viewer) this.viewer.destroy(); // 连带销毁 primitives
  },
  methods: {
    // 添加单个广告牌：图标底部钉在点位，业务数据挂实例上供移动模拟用
    addBillboard (lon, lat, type) {
      const b = this.billboards.add({
        position: this.Cesium.Cartesian3.fromDegrees(lon, lat),
        image: this.icons[type || this.iconType],
        verticalOrigin: this.Cesium.VerticalOrigin.BOTTOM,
        scale: type ? 0.8 : 1
      });
      b._lon = lon;
      b._lat = lat;
      b._vel = [(Math.random() - 0.5) * 0.0008, (Math.random() - 0.5) * 0.0006]; // 度/步
      this.count = this.billboards.length;
      this.viewer.scene.requestRender(); // 按需渲染：添加后补一帧
    },

    // 批量添加：一次 500 个随机点位，验证批渲染性能
    addBatch () {
      const keys = Object.keys(this.icons);
      for (let i = 0; i < BATCH; i++) {
        const lon = RAND.lon[0] + Math.random() * (RAND.lon[1] - RAND.lon[0]);
        const lat = RAND.lat[0] + Math.random() * (RAND.lat[1] - RAND.lat[0]);
        this.addBillboard(lon, lat, keys[Math.floor(Math.random() * keys.length)]);
      }
    },

    // 移动模拟：position 赋值即时生效，无需重建
    toggleMove () {
      if (this.moving) {
        clearInterval(this._moveTimer);
        this._moveTimer = null;
        this.moving = false;
        return;
      }
      this.moving = true;
      this._moveTimer = setInterval(() => {
        for (let i = 0; i < this.billboards.length; i++) {
          const b = this.billboards.get(i);
          b._lon += b._vel[0];
          b._lat += b._vel[1];
          // 出界反弹，保持在视野附近
          if (b._lon < RAND.lon[0] || b._lon > RAND.lon[1]) b._vel[0] *= -1;
          if (b._lat < RAND.lat[0] || b._lat > RAND.lat[1]) b._vel[1] *= -1;
          b.position = this.Cesium.Cartesian3.fromDegrees(b._lon, b._lat);
        }
        this.viewer.scene.requestRender(); // 按需渲染：整批位移后补一帧（10fps 而非 60fps 空转）
      }, 100);
    },

    clearAll () {
      this.billboards.removeAll();
      this.count = 0;
      this.viewer.scene.requestRender(); // 按需渲染：清空后补一帧
    }
  }
};
</script>

<style lang="less" scoped>
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;

  .label {
    font-size: 13px;
    color: #999;
    white-space: nowrap;
  }
}

.cesium-wrap {
  position: relative;
  width: 640px;
  max-width: 100%;
  height: 384px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;

  .cesium-loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    color: #888;
    font-size: 13px;
    z-index: 1;
  }

  /deep/ .cesium-viewer,
  /deep/ .cesium-widget,
  /deep/ .cesium-widget canvas {
    width: 100%;
    height: 100%;
  }
}

.state-panel {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
  color: #555;

  p {
    margin: 4px 0;
  }

  .label {
    color: #888;
  }
}

.hint {
  font-size: 12px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;

  code {
    padding: 1px 5px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    color: #c7254e;
  }
}

.principle {
  h4 {
    margin: 18px 0 8px;
    font-size: 14px;
    color: #262626;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    margin: 4px 0;
    font-size: 13px;
    line-height: 1.9;
    color: #555;

    code {
      padding: 1px 5px;
      background: #f5f5f5;
      border-radius: 3px;
      font-size: 12px;
      color: #c7254e;
    }
  }

  .mini-diagram {
    margin: 8px 0;
    padding: 10px 14px;
    background: #fafafa;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.8;
    color: #595959;
    overflow-x: auto;
  }
}
</style>
