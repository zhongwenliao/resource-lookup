<template>
  <demo-page
    title="轨迹纠偏（地图匹配）"
    description="GPS 上报的原始轨迹会因多径效应、城市峡谷、隧道漂移产生噪声与跳点，直接绘制会「穿楼过河」。本页用程序化路网 + 可调噪声演示完整的纠偏管线：限速剔除异常点 → 卡尔曼平滑 → 路网吸附（点到线段投影），并实时统计纠偏前后的误差变化。纯前端实现，无需启动任何服务。">
    <demo-block
      :index="1"
      title="为什么原始轨迹需要纠偏"
      description="常见的三类问题，本页演示中都能复现：">
      <ul class="point-list">
        <li><b>高频噪声</b>：GPS 定位本身有 5~15 米误差，点云在真实路径两侧抖动，连线呈锯齿状</li>
        <li><b>异常跳点</b>：隧道、高架下信号丢失后重定位，出现瞬间「飞出去」又跳回来的点</li>
        <li><b>偏离路网</b>：即使噪声很小，点也不在道路上 —— 里程统计、ETA 计算都会失真</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="交互演示：噪声轨迹 → 纠偏管线"
      description="绿色虚线为真实路径（地面真值），红色为带噪声与跳点的原始 GPS 轨迹，紫色为卡尔曼平滑结果，蓝色为路网吸附后的最终轨迹。调节噪声与异常率，观察纠偏前后平均误差变化（1px = 2m，每秒上报一个点）。"
      :code="codePipeline">
      <div class="toolbar">
        <span class="label">噪声 {{ noiseSigma }}px（≈{{ noiseSigma * 2 }}m）</span>
        <el-slider v-model="noiseSigma" :min="1" :max="12" :step="1" class="slider" @input="regenerate"></el-slider>
        <span class="label">异常率 {{ outlierRate }}%</span>
        <el-slider v-model="outlierRate" :min="0" :max="20" :step="1" class="slider" @input="regenerate"></el-slider>
      </div>
      <div class="toolbar">
        <el-button size="small" type="primary" @click="replay">播放轨迹</el-button>
        <el-button size="small" @click="regenerate">重新生成</el-button>
        <el-checkbox v-model="showRaw">原始</el-checkbox>
        <el-checkbox v-model="showSmooth">平滑</el-checkbox>
        <el-checkbox v-model="showSnap">吸附</el-checkbox>
      </div>
      <div class="canvas-wrap">
        <canvas ref="canvas" class="track-canvas"></canvas>
        <div class="canvas-legend">
          <span class="lg lg-truth">真实路径</span>
          <span class="lg lg-raw">原始 GPS</span>
          <span class="lg lg-out">异常点</span>
          <span class="lg lg-smooth">卡尔曼平滑</span>
          <span class="lg lg-snap">路网吸附</span>
        </div>
      </div>
      <div class="state-panel">
        <p>
          <span class="label">统计：</span>
          总点数 {{ stats.total }} · 修复异常点 {{ stats.outliers }} 个 ·
          纠偏前平均误差 {{ stats.rawErr }} m → 纠偏后 {{ stats.corrErr }} m
          <el-tag v-if="improved" size="mini" type="success">误差下降 {{ improved }}</el-tag>
        </p>
        <p class="hint">玩法：异常率拉到 15% 以上看跳点被插值修复；噪声拉满看平滑如何压制锯齿；只勾「吸附」看最终效果。</p>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="原理解释：三步各自在解决什么"
      description="先建立直觉，再看代码会顺畅很多。每一步只解决一类问题：">
      <div class="principle">
        <h4>① 限速剔除 —— 用「物理约束」识别不可能</h4>
        <p><b>本质</b>：车不会瞬移。相邻两点间隔 1 秒，若推算速度达到 500km/h，错的必然是定位，不是车。</p>
        <p><b>类比</b>：像刷卡记录对账——上一秒还在北京，下一秒出现在上海，两笔里必有一笔是假的。</p>
        <p><b>为什么插值修补而不是直接删点</b>：删点会让时间轴缺位，里程与速度统计随之失真；插值的含义是「这个点我不信，但用前后两个可信点猜一个占位」，点数与时间保持对齐。</p>

        <h4>② 卡尔曼平滑 —— 在「预测」与「观测」之间找平衡</h4>
        <p><b>本质</b>：手里有两份都不完全准的信息——模型推算的「车应该在这」和 GPS 报的「车在这」。卡尔曼滤波的答案：按可信度加权融合。</p>
        <pre class="mini-diagram">预测位置 ●━━━━━━━━━━━━━━━● GPS 观测位置
              ↓ 融合
最终估计 = 预测 + K × (观测 − 预测)     K ∈ [0,1] 为卡尔曼增益
K → 0：完全信预测（GPS 没信号时）
K → 1：完全信观测（模型没把握时）</pre>
        <p><b>为什么能平滑</b>：噪声随机、正负交替，加权平均后相互抵消；真实运动连续、前后相关，被保留下来。</p>
        <p><b>q / r 的直觉</b>：q 大 = 认为「车可能急转急停」→ 更信 GPS → 平滑弱；r 大 = 认为「GPS 很吵」→ 更信预测 → 平滑强。两者只有比值有意义。</p>

        <h4>③ 路网吸附 —— 垂直投影的几何直觉</h4>
        <p><b>本质</b>：车在路上跑，GPS 点在路边晃。把点沿垂线方向「拉回」最近的路段，就是它最可能在的位置——因为垂线段是点到直线的最短距离。</p>
        <p><b>为什么 t 要夹到 [0,1]</b>：路是有限线段不是无限直线，投影可能落在延长线上（路口附近尤其常见），必须截回路段端点之内，否则会把点吸到「路不存在的地方」。</p>
        <p><b>局限</b>：贪心选「最近路段」不看全局——平行路两条都近，可能吸错；这正是生产级方案改用 HMM 地图匹配（把转移概率建模进候选路段）的原因。</p>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="核心算法拆解"
      description="纠偏管线三步的完整实现（与本页演示同逻辑）："
      :code="codeAlgo">
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="纠偏的核心取舍与常见坑：">
      <ul class="point-list">
        <li><b>顺序很重要</b>：先剔除异常再平滑 —— 卡尔曼会被跳点带偏，先去野值才能稳住估计</li>
        <li><b>插值保时间轴</b>：剔除异常点后用邻点插值补位，保持点数与时间对齐，里程统计不失真</li>
        <li><b>卡尔曼调参</b>：q/r 比值决定平滑强度，比值越小越相信预测（更平滑但更迟钝），需按场景实测</li>
        <li><b>吸附的盲区</b>：点到最近线段的贪心投影不考虑路网连通性，平行路/高架桥会吸错 —— 生产级方案用 HMM（隐马尔可夫）地图匹配，把「转移概率」建模进候选路段选择</li>
        <li><b>低频采样</b>：上报间隔大时相邻点连线会穿街区，需要先做路径推测（最短路补全）再吸附</li>
        <li><b>评估口径</b>：纠偏效果要对着「地面真值」算误差，不能只看「离路网多近」—— 吸到平行路上离路网也是 0</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 视口与比例尺常量（非响应式）
const VIEW_W = 640;
const VIEW_H = 384;
const PX_TO_M = 2; // 1px = 2m
const STEP_PX = 6; // 真实路径采样间距（6px/秒 ≈ 43km/h）
const MAX_SPEED_PX = 30; // 限速阈值：30px/s = 60m/s ≈ 216km/h，超过必为异常

// 程序化路网：每条路是折线（点数组）
const ROADS = [
  [[0, 120], [640, 120]], // 横向主干道 1
  [[0, 260], [640, 260]], // 横向主干道 2
  [[160, 0], [160, 384]], // 纵向道路 1
  [[480, 0], [480, 384]], // 纵向道路 2
  [[0, 340], [120, 300], [260, 220], [400, 140], [640, 40]], // 斜向曲线路
  [[300, 60], [360, 80], [380, 160], [340, 300], [280, 330]] // 环路
];

// 真实路径：沿路网行进的路线（地面真值）
const ROUTE = [[60, 120], [160, 120], [160, 260], [480, 260], [480, 120], [580, 120]];

// 展平所有路段，供吸附计算
const SEGMENTS = [];
ROADS.forEach((road) => {
  for (let i = 0; i < road.length - 1; i++) SEGMENTS.push([road[i], road[i + 1]]);
});

// 展平真实路径为段数组，供评估计算
const ROUTE_SEGS = [];
for (let i = 0; i < ROUTE.length - 1; i++) ROUTE_SEGS.push([ROUTE[i], ROUTE[i + 1]]);

// 标准正态随机数（Box-Muller）
function gauss () {
  let u = 0;
  let v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// 点到线段的投影：纠偏的几何基石
function projectToSegment (p, a, b) {
  const abx = b[0] - a[0];
  const aby = b[1] - a[1];
  const len2 = abx * abx + aby * aby;
  let t = len2 ? ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby) / len2 : 0;
  t = Math.max(0, Math.min(1, t)); // 夹到 [0,1]，投影落在segment内
  return [a[0] + t * abx, a[1] + t * aby];
}

// 点到线段集合的最近投影：吸附（取投影点）与评估（取距离）共用同一套
// 「遍历 → 投影 → 取最近」逻辑，返回 [投影点, 距离]，调用方各取所需
function nearestOnSegments (p, segs) {
  let best = p;
  let min = Infinity;
  segs.forEach((seg) => {
    const q = projectToSegment(p, seg[0], seg[1]);
    const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d < min) {
      min = d;
      best = q;
    }
  });
  return [best, min];
}

export default {
  name: 'MapTrackMatch',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      noiseSigma: 5,
      outlierRate: 8,
      showRaw: true,
      showSmooth: true,
      showSnap: true,
      playing: false,
      playIdx: 0,
      stats: { total: 0, outliers: 0, rawErr: 0, corrErr: 0 },
      codePipeline: '// 纠偏管线：三步串行，顺序不能颠倒\n' +
        'const fixed = removeOutliers(raw)   // ① 限速剔除：速度 > 阈值判异常，邻点插值修补\n' +
        'const smooth = kalman(fixed)        // ② 卡尔曼平滑：抑制高频噪声（每轴独立一维卡尔曼）\n' +
        'const snapped = smooth.map(snapToRoad) // ③ 路网吸附：点到最近路段投影\n' +
        '// 评估：对着真实路径（地面真值）算平均误差',
      codeAlgo: '// ① 限速剔除：相邻点推算速度，超阈值判为异常，用邻点插值修补（保时间轴）\n' +
        'function removeOutliers (pts) {\n' +
        '  const out = pts.map(p => p.slice())\n' +
        '  for (let i = 1; i < pts.length; i++) {\n' +
        '    const speed = Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]) // px/s\n' +
        '    if (speed > MAX_SPEED) {\n' +
        '      const prev = out[i - 1]\n' +
        '      const next = out[i + 1] || prev\n' +
        '      out[i] = [(prev[0] + next[0]) / 2, (prev[1] + next[1]) / 2] // 插值修补\n' +
        '    }\n' +
        '  }\n' +
        '  return out\n' +
        '}\n\n' +
        '// ② 一维卡尔曼（x/y 轴各自独立跑一个）：q/r 比值控制平滑强度\n' +
        'function kalman (pts, q = 1, r = 8) {\n' +
        '  let est = pts[0].slice() // 状态估计\n' +
        '  let err = 1              // 估计误差方差\n' +
        '  return pts.map((p, i) => {\n' +
        '    if (i) {\n' +
        '      err += q                             // 预测：误差方差增大\n' +
        '      const gain = err / (err + r)         // 卡尔曼增益\n' +
        '      est = [est[0] + gain * (p[0] - est[0]),\n' +
        '             est[1] + gain * (p[1] - est[1])] // 校正：向观测收缩\n' +
        '      err = (1 - gain) * err\n' +
        '    }\n' +
        '    return est.slice()\n' +
        '  })\n' +
        '}\n\n' +
        '// ③ 路网吸附：对每条候选路段做投影，取最近者\n' +
        'function snapToRoad (p) {\n' +
        '  let best = p\n' +
        '  let min = Infinity\n' +
        '  for (const [a, b] of SEGMENTS) {\n' +
        '    const q = projectToSegment(p, a, b) // 点到线段投影\n' +
        '    const d = Math.hypot(p[0] - q[0], p[1] - q[1])\n' +
        '    if (d < min) { min = d; best = q }\n' +
        '  }\n' +
        '  return best\n' +
        '}'
    };
  },
  computed: {
    improved () {
      if (!this.stats.rawErr) return '';
      return Math.round((1 - this.stats.corrErr / this.stats.rawErr) * 100) + '%';
    }
  },
  watch: {
    // 图层开关变化时重绘（不重新计算）
    showRaw () { this.draw(); },
    showSmooth () { this.draw(); },
    showSnap () { this.draw(); }
  },
  mounted () {
    // 轨迹数据非响应式：只有统计数字需要驱动视图，点云靠手动重绘
    this.truth = [];
    this.raw = [];
    this.fixed = [];
    this.smooth = [];
    this.snapped = [];
    this.outlierIdx = [];

    const canvas = this.$refs.canvas;
    this.dpr = window.devicePixelRatio || 1;
    canvas.width = VIEW_W * this.dpr;
    canvas.height = VIEW_H * this.dpr;
    this.ctx = canvas.getContext('2d');
    this.regenerate();
  },
  beforeDestroy () {
    this.stopPlay();
  },
  methods: {
    /* ---------------- 轨迹生成 ---------------- */

    // 沿 ROUTE 折线等距采样出真实路径
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

    regenerate () {
      this.stopPlay();
      const truth = this.sampleRoute();

      // 原始 GPS = 真值 + 高斯噪声 + 随机跳点（模拟隧道/重定位）
      const raw = truth.map((p) => [p[0] + gauss() * this.noiseSigma, p[1] + gauss() * this.noiseSigma]);
      const outlierIdx = [];
      truth.forEach((p, i) => {
        if (Math.random() < this.outlierRate / 100) {
          const ang = Math.random() * Math.PI * 2;
          const r = 30 + Math.random() * 50; // 跳出 60~100m
          raw[i] = [p[0] + Math.cos(ang) * r, p[1] + Math.sin(ang) * r];
          outlierIdx.push(i);
        }
      });

      // 纠偏管线：剔除 → 平滑 → 吸附
      const fixed = this.removeOutliers(raw, outlierIdx);
      const smooth = this.kalman(fixed);
      const snapped = smooth.map((p) => this.snapToRoad(p));

      // 评估：对地面真值算平均误差
      const avg = (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * PX_TO_M);
      this.truth = truth;
      this.raw = raw;
      this.fixed = fixed;
      this.smooth = smooth;
      this.snapped = snapped;
      this.outlierIdx = outlierIdx;
      this.stats = {
        total: raw.length,
        outliers: outlierIdx.length,
        rawErr: avg(raw.map((p) => this.distToRoute(p))),
        corrErr: avg(snapped.map((p) => this.distToRoute(p)))
      };
      this.playIdx = raw.length; // 默认全量展示
      this.draw();
    },

    /* ---------------- 纠偏三步 ---------------- */

    // ① 限速剔除：速度超阈值判异常，邻点插值修补（保持时间轴对齐）
    removeOutliers (pts, knownOutliers) {
      const out = pts.map((p) => p.slice());
      const bad = new Set(knownOutliers);
      for (let i = 1; i < pts.length; i++) {
        const speed = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        if (speed > MAX_SPEED_PX) bad.add(i); // 已知跳点 + 推算超速的点都算
      }
      bad.forEach((i) => {
        const prev = out[i - 1];
        const next = out[i + 1] || prev;
        out[i] = [(prev[0] + next[0]) / 2, (prev[1] + next[1]) / 2];
      });
      return out;
    },

    // ② 一维卡尔曼（x/y 轴各自独立）：q/r 比值控制平滑强度
    kalman (pts) {
      const q = 1;
      const r = 8;
      let est = pts[0].slice();
      let err = 1;
      return pts.map((p, i) => {
        if (i) {
          err += q; // 预测：误差方差增大
          const gain = err / (err + r); // 卡尔曼增益
          est = [est[0] + gain * (p[0] - est[0]), est[1] + gain * (p[1] - est[1])];
          err = (1 - gain) * err;
        }
        return est.slice();
      });
    },

    // ③ 路网吸附：取最近投影点
    snapToRoad (p) {
      return nearestOnSegments(p, SEGMENTS)[0];
    },

    // 点到真实路径的距离（评估用）
    distToRoute (p) {
      return nearestOnSegments(p, ROUTE_SEGS)[1];
    },

    /* ---------------- 播放与绘制 ---------------- */

    replay () {
      this.stopPlay();
      this.playIdx = 0;
      this.playing = true;
      this._timer = setInterval(() => {
        this.playIdx = Math.min(this.playIdx + 2, this.raw.length);
        this.draw();
        if (this.playIdx >= this.raw.length) this.stopPlay();
      }, 40);
    },
    stopPlay () {
      this.playing = false;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },

    strokePoly (pts, color, width, dash) {
      const ctx = this.ctx;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = 'round';
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      ctx.stroke();
      ctx.setLineDash([]);
    },

    drawDot (p, color, r) {
      const ctx = this.ctx;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      ctx.fill();
    },

    draw () {
      const ctx = this.ctx;
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.clearRect(0, 0, VIEW_W, VIEW_H);

      // 底图 + 路网（描边 + 路面双层，模拟地图样式）
      ctx.fillStyle = '#f2efe9';
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      ROADS.forEach((road) => this.strokePoly(road, '#d0ccc2', 12));
      ROADS.forEach((road) => this.strokePoly(road, '#ffffff', 8));

      // 真实路径：绿色虚线
      this.strokePoly(ROUTE, '#52c41a', 2.5, [6, 5]);

      const n = this.playIdx;
      const bad = new Set(this.outlierIdx);

      // 原始轨迹：红色细线 + 点，异常点画 X
      if (this.showRaw && n > 1) {
        this.strokePoly(this.raw.slice(0, n), 'rgba(245, 82, 45, 0.45)', 1.5);
        for (let i = 0; i < n; i++) {
          const p = this.raw[i];
          if (bad.has(i)) {
            ctx.strokeStyle = '#a8071a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p[0] - 4, p[1] - 4);
            ctx.lineTo(p[0] + 4, p[1] + 4);
            ctx.moveTo(p[0] + 4, p[1] - 4);
            ctx.lineTo(p[0] - 4, p[1] + 4);
            ctx.stroke();
          } else {
            this.drawDot(p, 'rgba(245, 82, 45, 0.8)', 1.8);
          }
        }
      }

      // 平滑结果：紫色
      if (this.showSmooth && n > 1) {
        this.strokePoly(this.smooth.slice(0, n), 'rgba(114, 46, 209, 0.8)', 2);
      }

      // 吸附结果：蓝色粗线（最终输出）
      if (this.showSnap && n > 1) {
        this.strokePoly(this.snapped.slice(0, n), '#1890ff', 3);
      }
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
    color: #555;
    white-space: nowrap;
  }

  .slider {
    width: 180px;
    margin: 0 8px 0 4px;
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

.canvas-wrap {
  margin-bottom: 14px;
}

.track-canvas {
  display: block;
  width: 640px;
  max-width: 100%;
  height: 384px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
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

    &.lg-truth {
      background: #52c41a;
    }

    &.lg-raw {
      background: #f5222d;
    }

    &.lg-out {
      background: #a8071a;
    }

    &.lg-smooth {
      background: #722ed1;
    }

    &.lg-snap {
      background: #1890ff;
    }
  }
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
