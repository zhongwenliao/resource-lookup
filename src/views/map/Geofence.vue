<template>
  <demo-page
    title="电子围栏（Geofence）"
    description="电子围栏是 LBS 经典场景：在地图上圈定区域（多边形/圆形），实时判断目标在内还是外，在「穿越边界」瞬间触发事件 —— 车辆驶出作业区告警、骑手进入配送圈、打卡签到都基于它。本页纯前端实现：射线法点在多边形判断 + 圆形距离判断 + 状态机穿越检测，可点击画布自建围栏。">
    <demo-block
      :index="1"
      title="电子围栏解决什么问题"
      description="三个核心能力，本页演示都能体验：">
      <ul class="point-list">
        <li><b>空间判断</b>：点在区域内还是外？多边形围栏用射线法，圆形围栏用距离比较</li>
        <li><b>事件触发</b>：不是每帧都报「在/不在」，只在「内↔外」状态翻转的瞬间触发进入/离开事件</li>
        <li><b>自定义围栏</b>：业务上围栏由用户圈画 —— 点击画布加点，≥3 个点即成多边形围栏</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="交互演示：轨迹穿越围栏，实时告警"
      description="蓝色矩形为「作业区」多边形围栏，橙色圆为「警戒区」圆形围栏。播放轨迹，车辆沿道路行驶依次穿越两个围栏，穿越瞬间在下方日志产生事件。也可点击画布空白处添加顶点（≥3 个），「生成围栏」创建紫色自定义围栏，车辆驶入同样告警。"
      :code="codePipeline">
      <div class="toolbar">
        <el-button size="small" type="primary" @click="togglePlay">{{ playing ? '暂停' : '播放轨迹' }}</el-button>
        <el-button size="small" @click="replay">重播</el-button>
        <el-button size="small" :disabled="customPts.length < 3" @click="finishCustom">生成围栏</el-button>
        <el-button size="small" v-if="customPts.length || hasCustom" @click="clearCustom">清除自建</el-button>
        <span class="label">已点 {{ customPts.length }} 个顶点</span>
      </div>
      <div class="canvas-wrap">
        <canvas ref="canvas" class="fence-canvas" @click="onCanvasClick"></canvas>
        <div class="canvas-legend">
          <span class="lg lg-poly">多边形围栏</span>
          <span class="lg lg-circle">圆形围栏</span>
          <span class="lg lg-custom">自建围栏</span>
          <span class="lg lg-track">行驶轨迹</span>
          <span class="lg lg-car">车辆位置</span>
        </div>
      </div>
      <div class="event-panel">
        <div class="event-head">告警日志（{{ events.length }}）</div>
        <ul v-if="events.length" class="event-list">
          <li v-for="ev in events" :key="ev.seq" class="event-item">
            <el-tag size="mini" :type="ev.type === 'enter' ? 'success' : 'danger'">{{ ev.type === 'enter' ? '进入' : '离开' }}</el-tag>
            <span class="ev-fence">{{ ev.fence }}</span>
            <span class="ev-time">t = {{ ev.t }}s</span>
          </li>
        </ul>
        <p v-else class="hint">暂无事件。点「播放轨迹」，车辆将依次穿越作业区与警戒区，穿越瞬间的事件显示在这里。</p>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="原理解释：射线法与穿越检测的直觉"
      description="先建立直觉，再看代码会顺畅很多：">
      <div class="principle">
        <h4>① 射线法 —— 数「穿墙」次数判断内外</h4>
        <p><b>本质</b>：从待测点向右发一条水平射线，每与边界相交一次，就意味着「进入或离开区域一次」。相交奇数次 → 当前在内部。</p>
        <pre class="mini-diagram">        ┌──────────────┐
   ●────┼────射线──────┼──→  交点 2 个（偶）→ 在外
        └──────────────┘
        ┌──────────────┐
     ●──┼────射线──────┼──→  交点 1 个（奇）→ 在内
        └──────────────┘</pre>
        <p><b>类比</b>：人反复进出城门，进出必然成对；若穿越城门总次数是奇数，说明他此刻还在城里。</p>
        <p><b>为什么用 (yi &gt; py) !== (yj &gt; py)</b>：只统计「跨在水平线上下两侧」的边，严格不等号天然排除射线恰好穿过顶点被重复计数的边界情况（半开区间处理）。</p>
        <p><b>顶点顺序无关</b>：射线法对顺/逆时针顶点都成立，无需预处理方向。</p>

        <h4>② 圆形围栏 —— 最朴素的距离比较</h4>
        <p><b>本质</b>：圆的定义就是「到圆心距离等于半径的点的集合」，一次距离比较即得内外。真实地球公里级围栏要用 haversine 球面距离，否则高纬度误差明显。</p>

        <h4>③ 穿越检测 —— 状态机让告警只在边界那一刻响</h4>
        <p><b>本质</b>：告警需要的是「变化」而非「状态」。记录上一时刻内外状态，仅当与当前不同（内↔外翻转）才触发事件 —— 边沿触发 vs 电平触发。</p>
        <p><b>天然防重复</b>：持续在围栏内不产生输出，无论待多久；只有翻转的边沿才发声。</p>
        <p><b>现实痛点</b>：GPS 噪声让车在边界抖动，产生「进→出→进→出」告警风暴。工程解法是滞回：连续 N 秒在内才确认「进入」，反之确认「离开」。</p>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="核心算法拆解"
      description="围栏判断与穿越检测的完整实现（与本页演示同逻辑）："
      :code="codeAlgo">
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="围栏方案的核心取舍与常见坑：">
      <ul class="point-list">
        <li><b>多边形要简单</b>：自相交多边形射线法仍出结果（奇偶规则），但语义可能违背直觉，围栏顶点应保持简单多边形</li>
        <li><b>边界归属</b>：点恰好在边上/圆上是灰区，业务需明确「边界算内」还是「算外」—— 本实现圆形用 ≤（边界算内）</li>
        <li><b>噪声与滞回</b>：边界附近 GPS 抖动造成告警风暴，需「连续 N 秒在内」才确认进入（去抖），离开同理</li>
        <li><b>球面距离</b>：公里级圆形围栏用 haversine 大圆距离，直接经纬度相减在高纬度误差明显</li>
        <li><b>判断放哪</b>：客户端判断用于展示交互；真实告警推送必须在服务端（关页面就没人盯了）</li>
        <li><b>性能</b>：射线法 O(边数)；围栏多时先用外接矩形（bbox）粗筛，点在 bbox 内才做精确判断</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 视口常量（非响应式）
const VIEW_W = 640;
const VIEW_H = 384;
const STEP_PX = 6; // 路径采样间距
const STEP_MS = 60; // 播放间隔

// 简化路网（背景）
const ROADS = [
  [[0, 120], [640, 120]],
  [[0, 260], [640, 260]],
  [[160, 0], [160, 384]],
  [[480, 0], [480, 384]]
];

// 车辆行驶路线：依次穿过作业区（矩形）与警戒区（圆）
const ROUTE = [[60, 120], [480, 120], [480, 260], [580, 260]];

// 预设围栏：多边形（作业区）+ 圆形（警戒区）
const PRESET_FENCES = [
  { name: '作业区', type: 'poly', pts: [[220, 60], [380, 60], [380, 180], [220, 180]], color: '#1890ff' },
  { name: '警戒区', type: 'circle', c: [480, 120], r: 70, color: '#fa8c16' }
];

// 射线法判断点在多边形内：向右发水平射线，与边界相交奇数次 = 在内
function pointInPolygon (p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    // 边跨在 p 的水平线上下两侧（严格不等，半开区间排除穿顶点），且交点在 p 右侧
    if ((yi > p[1]) !== (yj > p[1]) &&
        p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) {
      inside = !inside; // 每交一次翻转一次内外
    }
  }
  return inside;
}

// 圆形围栏：距离比较（≤ 边界算内）
function pointInCircle (p, c, r) {
  return Math.hypot(p[0] - c[0], p[1] - c[1]) <= r;
}

// 多边形标注位置：顶点均值（简化质心）
function polyLabel (pts) {
  const n = pts.length;
  return [
    pts.reduce((s, p) => s + p[0], 0) / n,
    pts.reduce((s, p) => s + p[1], 0) / n
  ];
}

export default {
  name: 'MapGeofence',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      playing: false,
      playIdx: 0,
      events: [],
      customPts: [],
      hasCustom: false,
      codePipeline: '// 围栏监控管线：判断位置 → 对比前状态 → 变化才触发\n' +
        'fences.forEach(f => {\n' +
        '  const inside = contains(f, car)        // 多边形射线法 / 圆形距离比较\n' +
        '  if (inside !== f.inside) {            // 状态翻转 = 穿越边界\n' +
        "    emit(inside ? 'enter' : 'exit', f)  // 边沿触发，天然防重复\n" +
        '    f.inside = inside                   // 更新状态机\n' +
        '  }\n' +
        '})',
      codeAlgo: '// ① 射线法：向右发水平射线，与多边形边界相交奇数次 = 点在内部\n' +
        'function pointInPolygon (p, pts) {\n' +
        '  let inside = false\n' +
        '  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {\n' +
        '    const [xi, yi] = pts[i]\n' +
        '    const [xj, yj] = pts[j]\n' +
        '    // 有效相交两条件：\n' +
        '    // 1) 边跨在 p 的水平线上下两侧（严格不等排除穿顶点重复计数）\n' +
        '    // 2) 边与射线的交点在 p 右侧\n' +
        '    if ((yi > p[1]) !== (yj > p[1]) &&\n' +
        '        p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) {\n' +
        '      inside = !inside   // 每交一次翻转内外\n' +
        '    }\n' +
        '  }\n' +
        '  return inside\n' +
        '}\n\n' +
        '// ② 圆形围栏：一次距离比较（真实地球公里级用 haversine 球面距离）\n' +
        'function pointInCircle (p, c, r) {\n' +
        '  return Math.hypot(p[0] - c[0], p[1] - c[1]) <= r\n' +
        '}\n\n' +
        '// ③ 穿越检测：状态机，内外翻转的瞬间才触发事件（边沿触发防重复）\n' +
        'function watchFence (fence, point, onCross) {\n' +
        '  const inside = fence.type === \'circle\'\n' +
        '    ? pointInCircle(point, fence.c, fence.r)\n' +
        '    : pointInPolygon(point, fence.pts)\n' +
        '  if (inside !== fence.inside) {\n' +
        '    onCross(inside ? \'enter\' : \'exit\', fence)\n' +
        '    fence.inside = inside\n' +
        '  }\n' +
        '}'
    };
  },
  mounted () {
    // 轨迹与围栏状态非响应式：事件日志驱动视图，画布靠手动重绘
    this.path = this.sampleRoute();
    this.fences = PRESET_FENCES.map((f) => Object.assign({}, f, { inside: false }));
    this._evSeq = 0; // 事件自增序号，作 v-for 唯一 key

    const canvas = this.$refs.canvas;
    this.dpr = window.devicePixelRatio || 1;
    canvas.width = VIEW_W * this.dpr;
    canvas.height = VIEW_H * this.dpr;
    this.ctx = canvas.getContext('2d');
    this.draw();
  },
  beforeDestroy () {
    this.stopPlay();
  },
  methods: {
    /* ---------------- 轨迹与播放 ---------------- */

    // 沿 ROUTE 折线等距采样
    sampleRoute () {
      const pts = [];
      for (let i = 0; i < ROUTE.length - 1; i++) {
        const a = ROUTE[i];
        const b = ROUTE[i + 1];
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.floor(len / STEP_PX);
        for (let k = 0; k < n; k++) {
          pts.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
        }
      }
      pts.push(ROUTE[ROUTE.length - 1].slice());
      return pts;
    },

    togglePlay () {
      if (this.playing) {
        this.stopPlay();
        return;
      }
      // 播完再点播放 = 从头重播：必须重置事件与围栏状态机，否则产生重复事件
      if (this.playIdx >= this.path.length - 1) this.resetRun();
      this.startPlay();
    },
    stopPlay () {
      this.playing = false;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },
    replay () {
      this.stopPlay();
      this.resetRun();
      this.startPlay();
    },

    // 重置一轮运行：轨迹归零、清空日志、围栏状态机回初始
    resetRun () {
      this.playIdx = 0;
      this.events = [];
      this.fences.forEach((f) => { f.inside = false; });
    },

    startPlay () {
      this.playing = true;
      this._timer = setInterval(() => {
        this.playIdx++;
        this.checkFences(this.playIdx);
        this.draw();
        if (this.playIdx >= this.path.length - 1) this.stopPlay();
      }, STEP_MS);
    },

    /* ---------------- 围栏交互 ---------------- */

    // 点击画布添加自建围栏顶点（坐标按元素实际尺寸换算，兼容缩放）
    onCanvasClick (e) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (VIEW_W / rect.width);
      const y = (e.clientY - rect.top) * (VIEW_H / rect.height);
      this.customPts.push([Math.round(x), Math.round(y)]);
      this.draw();
    },

    // ≥3 顶点固化为自建围栏；用当前位置初始化状态机，避免创建即误报
    finishCustom () {
      if (this.customPts.length < 3) return;
      const f = {
        name: '自建围栏',
        type: 'poly',
        pts: this.customPts.map((p) => p.slice()),
        color: '#722ed1'
      };
      f.inside = pointInPolygon(this.path[this.playIdx], f.pts);
      this.fences.push(f);
      this.hasCustom = true;
      this.draw();
    },
    clearCustom () {
      this.customPts = [];
      this.fences = this.fences.filter((f) => f.name !== '自建围栏');
      this.hasCustom = false;
      this.draw();
    },

    // 穿越检测：对每个围栏比较当前状态与上一状态，翻转即产生事件
    checkFences (idx) {
      const p = this.path[idx];
      this.fences.forEach((f) => {
        const inside = f.type === 'circle'
          ? pointInCircle(p, f.c, f.r)
          : pointInPolygon(p, f.pts);
        if (inside !== f.inside) {
          f.inside = inside;
          this.events.unshift({ seq: this._evSeq++, t: idx, fence: f.name, type: inside ? 'enter' : 'exit' });
          if (this.events.length > 50) this.events.pop();
        }
      });
    },

    /* ---------------- 绘制 ---------------- */

    strokePoly (pts, color, width, dash, close) {
      const ctx = this.ctx;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      if (close) ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
    },

    drawFence (f) {
      const ctx = this.ctx;
      ctx.beginPath();
      if (f.type === 'circle') {
        ctx.arc(f.c[0], f.c[1], f.r, 0, Math.PI * 2);
      } else {
        f.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
        ctx.closePath();
      }
      ctx.fillStyle = f.color + '1a'; // 8 位 hex：约 10% 透明度
      ctx.fill();
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      // 围栏名标注
      const label = f.type === 'circle' ? f.c : polyLabel(f.pts);
      ctx.fillStyle = f.color;
      ctx.font = '12px sans-serif';
      ctx.fillText(f.name, label[0] - 18, label[1] - 6);
    },

    draw () {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);

      // 底图 + 路网
      ctx.fillStyle = '#f2efe9';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ROADS.forEach((road) => this.strokePoly(road, '#d0ccc2', 12));
      ROADS.forEach((road) => this.strokePoly(road, '#ffffff', 8));

      // 围栏
      this.fences.forEach((f) => this.drawFence(f));

      // 自建围栏顶点预览：小圆点 + 连线
      if (this.customPts.length) {
        this.strokePoly(this.customPts, '#722ed1', 1.5, [4, 4], this.customPts.length >= 3);
        this.customPts.forEach((p) => {
          ctx.fillStyle = '#722ed1';
          ctx.beginPath();
          ctx.arc(p[0], p[1], 3.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 全程轨迹（浅灰）+ 已行驶部分（深色）
      this.strokePoly(this.path, 'rgba(140, 140, 140, 0.35)', 1.5);
      this.strokePoly(this.path.slice(0, this.playIdx + 1), '#262626', 2.5);

      // 车辆：白心圆点 + 光环
      const car = this.path[this.playIdx];
      ctx.fillStyle = 'rgba(38, 38, 38, 0.15)';
      ctx.beginPath();
      ctx.arc(car[0], car[1], 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#262626';
      ctx.beginPath();
      ctx.arc(car[0], car[1], 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(car[0], car[1], 1.8, 0, Math.PI * 2);
      ctx.fill();
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

.canvas-wrap {
  margin-bottom: 14px;
}

.fence-canvas {
  display: block;
  width: 640px;
  max-width: 100%;
  height: 384px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: crosshair;
}

.canvas-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  font-size: 12px;
  color: #666;

  .lg {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 2px;
    color: #fff;

    &.lg-poly {
      background: #1890ff;
    }

    &.lg-circle {
      background: #fa8c16;
    }

    &.lg-custom {
      background: #722ed1;
    }

    &.lg-track {
      background: #8c8c8c;
    }

    &.lg-car {
      background: #262626;
    }
  }
}

.event-panel {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;

  .event-head {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #262626;
  }

  .event-list {
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 160px;
    overflow-y: auto;
  }

  .event-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 0;
    font-size: 13px;
    color: #555;

    .ev-fence {
      font-weight: 500;
    }

    .ev-time {
      color: #999;
      font-size: 12px;
    }
  }
}

.hint {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
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
