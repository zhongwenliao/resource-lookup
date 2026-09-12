<template>
  <demo-page
    title="全景图查看器（360° Panorama）"
    description="街景、VR 看房、720° 全景展厅的前端实现核心：把一张 2:1 的等距圆柱投影（equirectangular）全景图贴到球体内侧，相机固定在球心 —— 往任何方向看都是画面，拖拽改变的是「视线方向」而非「位置」。本页用 Three.js 实现完整查看器（拖拽旋转 / 滚轮缩放 / 自动巡航），全景图由 Canvas 程序化生成，无需任何图片资源。">
    <demo-block
      :index="1"
      title="全景展示解决什么问题"
      description="三个核心能力，本页演示都能体验：">
      <ul class="point-list">
        <li><b>沉浸式浏览</b>：普通图片只能看一个视角，全景图让用户自由环顾 360°×180°，信息量与临场感完全不同</li>
        <li><b>视角交互</b>：拖拽旋转视线、滚轮缩放视野（FOV）、自动巡航 —— 三种交互对应三套相机参数控制</li>
        <li><b>投影映射</b>：把「球面上的方向」与「平面图的像素」一一对应起来，这是所有全景渲染的几何基础</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="交互演示：拖拽环顾四周，滚轮推拉视野"
      description="按住拖拽旋转视角（水平 = 经度，垂直 = 纬度），滚轮推拉视野（FOV 30°~100°，越小放大越强）。图中可见：天空、地面网格、环绕的建筑剪影与经度刻度线（每 30° 一条，可直观读出旋转量）。"
      :code="codePipeline">
      <div class="toolbar">
        <el-checkbox v-model="autoRotate">自动巡航</el-checkbox>
        <el-button size="small" @click="resetView">重置视角</el-button>
        <span class="label">拖拽旋转 · 滚轮缩放</span>
      </div>
      <div class="pano-wrap" ref="container"></div>
      <div class="state-panel">
        <p>
          <span class="label">视角读数：</span>
          经度 {{ lon.toFixed(1) }}° · 纬度 {{ lat.toFixed(1) }}° · 视野 {{ fov }}°
          <span class="hint">（FOV 越小看得越远，等效「放大」）</span>
        </p>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="原理解释：为什么贴在球内侧"
      description="先建立直觉，再看代码会顺畅很多：">
      <div class="principle">
        <h4>① 球内侧贴图 —— 人在「画的世界」里，而不是看画</h4>
        <p><b>本质</b>：把观察者想象成站在一个巨大球面的球心，全景图贴在球的内壁上。视线投向任何方向，都会「打到」内壁的某个像素 —— 环顾四周即浏览整张图。</p>
        <pre class="mini-diagram">        ╭─────────────╮
      ╱   ↑ 全景图贴内壁   ╲
     │  ╱                ╲  │
     │ │      ◎ 相机       │ │   相机固定在球心
     │  ╲   只改朝向      ╱    （不移动位置）
      ╲   ↓ 拖拽=转视线  ╱
        ╰─────────────╯</pre>
        <p><b>为什么是 BackSide</b>：材质默认渲染正面（法线朝外），从球心看到的是背面 —— 必须设置 <code>side: THREE.BackSide</code> 才能从内壁看到贴图。</p>

        <h4>② equirectangular 投影 —— 球面摊平成 2:1 长方形</h4>
        <p><b>本质</b>：经度 → 横轴（360°），纬度 → 纵轴（180°），所以全景图恒为 2:1。图片最左与最右是同一经线，缝合后无缝环视。</p>
        <p><b>类比</b>：地球仪展开成世界地图 —— 两极被拉伸变形（顶/底边），赤道保持真实比例；全景图的「极点畸变」同理，天空顶与地面底在球上只是一个点。</p>

        <h4>③ 拖拽 = 转相机，不是移动相机</h4>
        <p><b>本质</b>：全景交互里位置永远固定在球心，变的只有朝向（经度 lon / 纬度 lat）与视野（fov）。拖拽的像素位移换算成角度增量，滚轮改 fov —— fov 变小相当于「望远镜」，画面放大但视野收窄。</p>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="核心算法拆解"
      description="经纬度与视线方向互转、以及相机朝向控制（与本页演示同逻辑）："
      :code="codeAlgo">
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="全景方案的核心取舍与常见坑：">
      <ul class="point-list">
        <li><b>纹理必须 2:1</b>：非 2:1 的图贴上球会出现接缝或拉伸，先裁剪/补齐再使用</li>
        <li><b>经度方向</b>：Three.js 球体 UV 与地理经度方向相反，lon 增量取拖拽方向的反号才是「跟手」的体验</li>
        <li><b>纬度要夹紧</b>：lat 限制在 ±85° 左右，越过极点画面会瞬间翻转，体验突兀</li>
        <li><b>惯性阻尼</b>：松手后 lon/lat 继续按速度衰减（乘 0.95），比急停更接近原生街景手感</li>
        <li><b>移动端</b>：touch 事件换算与鼠标同理；陀螺仪（DeviceOrientation）可做「转头看」的 VR 模式</li>
        <li><b>性能</b>：纹理尺寸 4096×2048 已是移动端安全上限；显存占用 = 宽×高×4 字节，翻倍尺寸显存翻 4 倍</li>
        <li><b>热点（Hotspot）</b>：场景内可点击标注 = 在指定经纬度方向放一个 Sprite，点击切换另一张全景 —— 多场景漫游由此而来</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import * as THREE from 'three';
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 视口常量（非响应式）
const VIEW_W = 640;
const VIEW_H = 384;
const TEX_W = 2048; // equirectangular 纹理恒为 2:1
const TEX_H = 1024;
const HORIZON = TEX_H / 2; // 地平线在纹理垂直中点

// 环绕建筑剪影：经度、跨度、高度、颜色（程序化「街景」）
const BUILDINGS = [
  { lon: -150, span: 25, h: 260, color: '#7a8ca3' },
  { lon: -100, span: 18, h: 200, color: '#8d9db1' },
  { lon: -60, span: 30, h: 300, color: '#6b7d94' },
  { lon: -20, span: 20, h: 180, color: '#93a3b5' },
  { lon: 10, span: 25, h: 240, color: '#7d8fa6' },
  { lon: 40, span: 15, h: 160, color: '#98a8ba' },
  { lon: 90, span: 28, h: 280, color: '#71839a' },
  { lon: 140, span: 22, h: 210, color: '#8898ab' },
  { lon: 170, span: 18, h: 190, color: '#8fa0b2' }
];

// 经度 → 纹理横坐标（-180°~180° 映射到 0~TEX_W）
const lonToX = (lon) => ((lon + 180) / 360) * TEX_W;

// 程序化生成 equirectangular 全景纹理：天空 + 太阳 + 地面网格 + 环绕建筑 + 经度刻度
function makePanoramaTexture () {
  const cv = document.createElement('canvas');
  cv.width = TEX_W;
  cv.height = TEX_H;
  const ctx = cv.getContext('2d');

  // 天空：顶部深蓝 → 地平线浅色
  const sky = ctx.createLinearGradient(0, 0, 0, HORIZON);
  sky.addColorStop(0, '#4a8ec2');
  sky.addColorStop(1, '#dceefb');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, TEX_W, HORIZON);

  // 太阳：经度 60° 上方，径向光晕
  const sx = lonToX(60);
  const sun = ctx.createRadialGradient(sx, 180, 10, sx, 180, 160);
  sun.addColorStop(0, 'rgba(255,250,220,0.95)');
  sun.addColorStop(0.25, 'rgba(255,240,180,0.45)');
  sun.addColorStop(1, 'rgba(255,240,180,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(sx - 180, 0, 360, 380);

  // 地面：地平线浅灰 → 底部深灰
  const ground = ctx.createLinearGradient(0, HORIZON, 0, TEX_H);
  ground.addColorStop(0, '#9a9a9a');
  ground.addColorStop(1, '#3f3f3f');
  ctx.fillStyle = ground;
  ctx.fillRect(0, HORIZON, TEX_W, HORIZON);

  // 地面网格 —— 经度线（竖线，等距）
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  for (let lon = -180; lon < 180; lon += 15) {
    const x = lonToX(lon);
    ctx.beginPath();
    ctx.moveTo(x, HORIZON);
    ctx.lineTo(x, TEX_H);
    ctx.stroke();
  }
  // 地面网格 —— 纬度圈（横线，幂次间距模拟透视：近疏远密）
  for (let k = 1; k <= 12; k++) {
    const y = HORIZON + HORIZON * Math.pow(k / 12, 2.2);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(TEX_W, y);
    ctx.stroke();
  }

  // 一条路：经度 180° 处的等宽竖带 + 中央黄虚线
  const roadX = lonToX(180);
  ctx.fillStyle = '#6b6b6b';
  ctx.fillRect(roadX - 45, HORIZON, 90, HORIZON);
  ctx.strokeStyle = 'rgba(255,214,64,0.8)';
  ctx.lineWidth = 4;
  ctx.setLineDash([24, 20]);
  ctx.beginPath();
  ctx.moveTo(roadX, HORIZON);
  ctx.lineTo(roadX, TEX_H);
  ctx.stroke();
  ctx.setLineDash([]);

  // 环绕建筑：从地平线向上的矩形 + 窗户点阵
  BUILDINGS.forEach((b) => {
    const x = lonToX(b.lon);
    const w = (b.span / 360) * TEX_W;
    ctx.fillStyle = b.color;
    ctx.fillRect(x, HORIZON - b.h, w, b.h);
    // 窗户：隔行隔列点亮的暖色小格
    for (let wy = HORIZON - b.h + 14; wy < HORIZON - 10; wy += 22) {
      for (let wx = x + 10; wx < x + w - 12; wx += 20) {
        if ((wx + wy) % 3 === 0) {
          ctx.fillStyle = 'rgba(255,220,120,0.75)';
          ctx.fillRect(wx, wy, 9, 12);
        }
      }
    }
  });

  // 地平线
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, HORIZON);
  ctx.lineTo(TEX_W, HORIZON);
  ctx.stroke();

  // 经度刻度：每 30° 一条短线 + 度数标注（旋转时可直观读数）
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  for (let lon = -180; lon < 180; lon += 30) {
    const x = lonToX(lon);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 400);
    ctx.lineTo(x, HORIZON);
    ctx.stroke();
    ctx.fillStyle = 'rgba(30,60,90,0.55)';
    ctx.fillText((lon + 360) % 360 + '°', x, 390);
  }

  const texture = new THREE.CanvasTexture(cv);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default {
  name: 'MapPanorama',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      autoRotate: true,
      lon: 0, // 视线经度（度）
      lat: 0, // 视线纬度（度）
      fov: 75, // 视野角（度）
      codePipeline: '// 全景查看器管线：纹理 → 球内侧 → 相机在球心\n' +
        'const tex = makePanorama()                    // 2:1 equirectangular 全景图\n' +
        'const sphere = new Mesh(SphereGeometry(500),\n' +
        '  new MeshBasicMaterial({ map: tex, side: BackSide })) // 贴内壁\n' +
        'scene.add(sphere)\n' +
        '// 相机固定球心，交互只改三个数：\n' +
        'onDrag   -> lon/lat   // 拖拽 = 改朝向\n' +
        'onWheel  -> fov       // 滚轮 = 改视野（缩放）\n' +
        'autoPlay -> lon += dt // 巡航 = 经度匀速递增',
      codeAlgo: '// 经纬度 → 视线方向向量（球面坐标转直角坐标）\n' +
        '// phi = 极角（从天顶量），theta = 方位角\n' +
        'function lookAtLonLat (camera, lon, lat) {\n' +
        '  const phi = degToRad(90 - lat)   // 纬度 0° → 极角 90°（水平看）\n' +
        '  const theta = degToRad(lon)\n' +
        '  camera.lookAt(\n' +
        '    500 * Math.sin(phi) * Math.cos(theta), // x\n' +
        '    500 * Math.cos(phi),                   // y（纬度控制俯仰）\n' +
        '    500 * Math.sin(phi) * Math.sin(theta)  // z\n' +
        '  )\n' +
        '}\n\n' +
        '// 拖拽：像素位移 → 角度增量（反号才「跟手」）\n' +
        'onPointerMove (e) {\n' +
        '  if (!dragging) return\n' +
        '  lon = startLon - (e.clientX - startX) * 0.15\n' +
        '  lat = clamp(startLat + (e.clientY - startY) * 0.15, -85, 85)\n' +
        '  // 纬度必须夹紧：越过极点画面会瞬间翻转\n' +
        '}\n\n' +
        '// 滚轮：FOV 推拉（30° 望远镜 ~ 100° 广角）\n' +
        'onWheel (e) {\n' +
        '  fov = clamp(fov + e.deltaY * 0.05, 30, 100)\n' +
        '  camera.fov = fov\n' +
        '  camera.updateProjectionMatrix() // fov 改变后必须调用\n' +
        '}'
    };
  },
  mounted () {
    // three 对象全部非响应式：读数（lon/lat/fov）驱动视图，渲染靠 rAF 手动驱动
    const container = this.$refs.container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(VIEW_W, VIEW_H);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(this.fov, VIEW_W / VIEW_H, 1, 1100);

    this.scene = new THREE.Scene();
    this.texture = makePanoramaTexture();
    this.geometry = new THREE.SphereGeometry(500, 64, 48);
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, side: THREE.BackSide });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));

    // 拖拽状态（非响应式）
    this._drag = null;

    container.addEventListener('pointerdown', this.onPointerDown);
    container.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    container.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('resize', this.onResize);

    this.animate();
  },
  beforeDestroy () {
    cancelAnimationFrame(this._raf);
    const container = this.$refs.container;
    container.removeEventListener('pointerdown', this.onPointerDown);
    container.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    container.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('resize', this.onResize);
    // WebGL 资源必须显式释放，否则切页后显存泄漏
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  },
  methods: {
    /* ---------------- 交互 ---------------- */

    onPointerDown (e) {
      this._drag = { startX: e.clientX, startY: e.clientY, startLon: this.lon, startLat: this.lat };
    },
    onPointerMove (e) {
      if (!this._drag) return;
      // lon 反号：拖拽方向与画面移动方向一致才「跟手」（球内壁是镜像的）
      this.lon = this._drag.startLon - (e.clientX - this._drag.startX) * 0.15;
      this.lat = Math.max(-85, Math.min(85, this._drag.startLat + (e.clientY - this._drag.startY) * 0.15));
    },
    onPointerUp () {
      this._drag = null;
    },
    onWheel (e) {
      e.preventDefault();
      this.fov = Math.max(30, Math.min(100, this.fov + e.deltaY * 0.05));
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    },
    onResize () {
      // 画布 max-width:100% 时按容器实际宽度等比缩放
      const w = this.$refs.container.clientWidth || VIEW_W;
      const h = (w / VIEW_W) * VIEW_H;
      this.renderer.setSize(w, h);
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    },
    resetView () {
      this.lon = 0;
      this.lat = 0;
      this.fov = 75;
      this.camera.fov = 75;
      this.camera.updateProjectionMatrix();
    },

    /* ---------------- 渲染循环 ---------------- */

    animate () {
      this._raf = requestAnimationFrame(this.animate);
      if (this.autoRotate && !this._drag) this.lon += 0.06; // 巡航：经度匀速递增
      // 经纬度 → 相机朝向（球面坐标 → 方向向量）
      const phi = THREE.MathUtils.degToRad(90 - this.lat);
      const theta = THREE.MathUtils.degToRad(this.lon);
      this.camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );
      this.renderer.render(this.scene, this.camera);
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

.pano-wrap {
  width: 640px;
  max-width: 100%;
  height: 384px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  cursor: grab;
  margin-bottom: 14px;

  &:active {
    cursor: grabbing;
  }

  canvas {
    display: block;
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
