<template>
  <demo-page
    title="地图坐标转换（WGS-84 / GCJ-02 / BD-09）"
    description="在中国做 LBS 开发绕不开三套坐标系：GPS 芯片说的 WGS-84、国测局非线性加密的 GCJ-02（火星坐标，高德/腾讯用）、百度二次加密的 BD-09。坐标系用错，全城定位偏移几百米 —— 「导航把我定位到河里」多数是它的锅。本页实现全套转换算法：正转换、迭代逆转换、级联链路、回环误差实测，配偏移可视化画布。">
    <demo-block
      :index="1"
      title="为什么同一栋楼有三个「经纬度」"
      description="三套坐标系并存是历史与法规共同作用的结果：">
      <ul class="point-list">
        <li><b>WGS-84</b>：GPS/北斗芯片输出的原始坐标，国际事实标准。Google 国际版、OpenStreetMap 使用；天地图的 CGCS2000 与它仅差厘米级</li>
        <li><b>GCJ-02</b>：国测局 02 标准，昵称「火星坐标系」—— 在 WGS-84 上叠加<b>随位置非线性变化</b>的加密偏移（不可解析还原）。法规要求中国境内互联网地图必须用它：高德、腾讯、阿里系都是</li>
        <li><b>BD-09</b>：百度在 GCJ-02 基础上的二次加密（固定小量偏移，数学可逆）。仅百度系地图使用</li>
        <li><b>关键推论</b>：GPS 原始坐标直接标到高德地图 → 偏移几百米；高德坐标直接标到百度地图 → 再偏几十到一百多米。跨地图/跨系统的坐标流转必须显式转换</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="交互演示：三坐标系实时转换 + 偏移可视化"
      description="选预设城市或输入 WGS-84 坐标，实时给出三套坐标与偏移米数；画布按 1 像素 ≈ 5 米放大显示偏移向量（真实地图上肉眼根本看不见）。试试「东京·银座」—— 境外坐标不加密，三套坐标系完全重合。"
      :code="codePipeline">
      <div class="toolbar">
        <el-button
          v-for="p in presets"
          :key="p.name"
          size="small"
          :type="activePreset === p.name ? 'primary' : 'default'"
          @click="applyPreset(p)">{{ p.name }}</el-button>
      </div>
      <div class="input-row">
        <span class="inp-label">WGS-84 经度</span>
        <el-input v-model.number="lng" size="small" class="inp" @input="activePreset = ''" />
        <span class="inp-label">纬度</span>
        <el-input v-model.number="lat" size="small" class="inp" @input="activePreset = ''" />
        <el-button size="small" type="success" @click="useGps">用我的 GPS 定位</el-button>
        <span class="gps-msg">{{ gpsMsg }}</span>
      </div>
      <table class="coord-table">
        <thead>
          <tr><th>坐标系</th><th>经度</th><th>纬度</th><th>与 WGS-84 偏移</th><th>使用者</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="dot dot-wgs"></span>WGS-84（原始）</td>
            <td>{{ fmt(wgs[0]) }}</td>
            <td>{{ fmt(wgs[1]) }}</td>
            <td>—</td>
            <td>GPS 芯片 / OSM / 天地图</td>
          </tr>
          <tr>
            <td><span class="dot dot-gcj"></span>GCJ-02（火星坐标）</td>
            <td>{{ fmt(gcj[0]) }}</td>
            <td>{{ fmt(gcj[1]) }}</td>
            <td>{{ isAbroad ? '0 m（境外不加密）' : fmtM(dWgsGcj) }}</td>
            <td>高德 / 腾讯 / 阿里系</td>
          </tr>
          <tr>
            <td><span class="dot dot-bd"></span>BD-09（百度）</td>
            <td>{{ fmt(bd[0]) }}</td>
            <td>{{ fmt(bd[1]) }}</td>
            <td>{{ isAbroad ? '0 m（境外不加密）' : fmtM(dWgsBd) }}</td>
            <td>百度系</td>
          </tr>
        </tbody>
      </table>
      <p class="sub-line" v-if="!isAbroad">GCJ-02 → BD-09 二次偏移：{{ fmtM(dGcjBd) }}（百度在火星坐标上又拧了一点）</p>
      <p class="sub-line" v-else>境外坐标：outOfChina 判定为真，三套坐标系完全一致（跨国业务最容易踩的坑恰好在这里）</p>
      <div class="canvas-wrap">
        <canvas ref="canvas" class="offset-canvas"></canvas>
        <div class="canvas-legend">
          <span class="lg lg-wgs">WGS-84</span>
          <span class="lg lg-gcj">GCJ-02</span>
          <span class="lg lg-bd">BD-09</span>
          <span class="lg lg-grid">100m 网格</span>
        </div>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="逆转换与回环误差：非线性加密没有解析解"
      description="GCJ-02 的偏移量随位置非线性变化，数学上不可精确还原 —— 工程标准做法是迭代逼近。下表用当前输入坐标实测各转换链「正向再逆向」的回环残差（理想值 0）："
      :code="codeInverse">
      <table class="coord-table">
        <thead>
          <tr><th>转换链（正向 → 逆向）</th><th>逆转换方法</th><th>回环残差</th></tr>
        </thead>
        <tbody>
          <tr v-for="(t, i) in loopTests" :key="i">
            <td>{{ t.path }}</td>
            <td>{{ t.method }}</td>
            <td :class="{ zero: t.err < 0.001 }">{{ fmtErr(t.err) }}</td>
          </tr>
        </tbody>
      </table>
      <ul class="point-list">
        <li><b>BD-09 有解析逆</b> —— 它只是固定小量的平移旋转，数学上精确互逆，残差为 0</li>
        <li><b>GCJ-02 只能逼近</b> —— 一阶逆推（减一次加密增量）残差通常 &lt; 1 米；迭代 3 次降到毫米级以下，对存储/展示完全够用</li>
        <li><b>全链回环</b> —— WGS→GCJ→BD→GCJ→WGS 的残差由最弱一环（迭代逆推）决定，级联不放大误差</li>
      </ul>
    </demo-block>

    <demo-block
      :index="4"
      title="核心算法拆解"
      description="全套转换实现（与本页演示同逻辑，可直接抄走）："
      :code="codeAlgo">
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="坐标转换的取舍与常见坑：">
      <ul class="point-list">
        <li><b>来源对表</b>：navigator.geolocation / GPS 芯片返回 WGS-84；高德/腾讯 SDK 返回 GCJ-02；百度 SDK 返回 BD-09。拿到坐标第一件事是问「哪个系的」</li>
        <li><b>境外不偏移</b>：outOfChina 范围外的坐标 GCJ-02 不加密，直接原样返回 —— 跨国业务边界处坐标会「跳变」，需平滑处理</li>
        <li><b>精度别乱舍</b>：经纬度第 6 位小数 ≈ 0.1 米，存储/传输保留 6~8 位；四舍五入到 4 位（≈10m）就够把车停到马路对面</li>
        <li><b>距离计算</b>：两坐标点距离用 haversine 球面公式；小范围可用平面近似 —— 纬度差 1° ≈ 111km，经度差 1° ≈ 111km × cos(纬度)</li>
        <li><b>服务端也要转</b>：坐标入库统一存 WGS-84（国际标准、可逆计算），出库按目标地图转换 —— 避免库里的数据「不知道是哪个系的」</li>
        <li><b>现成轮子</b>：生产可直接用 coordtransform / gcoord / proj4js（后者支持任意投影坐标系，如 CGCS2000 高斯投影）</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// ---- 坐标转换核心算法（社区标准实现，与高德/百度官方 SDK 输出一致） ----
const PI = 3.141592653589793;
const X_PI = (PI * 3000.0) / 180.0;
const A = 6378245.0; // 克拉索夫斯基椭球长半轴
const EE = 0.006693421622965943; // 椭球偏心率平方

// 境外判断：范围外不加密（GCJ-02 只覆盖中国境内）
function outOfChina (lng, lat) {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat (x, y) {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320.0 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng (x, y) {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

// WGS-84 → GCJ-02（正向加密）
function wgs84ToGcj02 (lng, lat) {
  if (outOfChina(lng, lat)) return [lng, lat];
  let dlat = transformLat(lng - 105.0, lat - 35.0);
  let dlng = transformLng(lng - 105.0, lat - 35.0);
  const radlat = (lat / 180.0) * PI;
  let magic = Math.sin(radlat);
  magic = 1 - EE * magic * magic;
  const sqrtmagic = Math.sqrt(magic);
  dlat = (dlat * 180.0) / (((A * (1 - EE)) / (magic * sqrtmagic)) * PI);
  dlng = (dlng * 180.0) / ((A / sqrtmagic) * Math.cos(radlat) * PI);
  return [lng + dlng, lat + dlat];
}

// GCJ-02 → WGS-84（迭代逼近，iter 次后残差毫米级以下）
function gcj02ToWgs84 (glng, glat, iter) {
  if (outOfChina(glng, glat)) return [glng, glat];
  let wlng = glng;
  let wlat = glat;
  for (let i = 0; i < (iter || 3); i++) {
    const e = wgs84ToGcj02(wlng, wlat);
    wlng += glng - e[0]; // 误差补回猜测
    wlat += glat - e[1];
  }
  return [wlng, wlat];
}

// GCJ-02 → BD-09（百度二次加密：极坐标平移旋转）
function gcj02ToBd09 (lng, lat) {
  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);
  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);
  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];
}

// BD-09 → GCJ-02（解析逆：数学上精确互逆）
function bd09ToGcj02 (lng, lat) {
  const x = lng - 0.0065;
  const y = lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  return [z * Math.cos(theta), z * Math.sin(theta)];
}

// haversine 球面距离（米）
function haversine (lng1, lat1, lng2, lat2) {
  const rad = PI / 180.0;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const sLat = Math.sin(dLat / 2);
  const sLng = Math.sin(dLng / 2);
  const a = sLat * sLat + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * sLng * sLng;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

// 预设城市（WGS-84 坐标）
const PRESETS = [
  { name: '北京·天安门', lng: 116.391276, lat: 39.906217 },
  { name: '上海·东方明珠', lng: 121.495227, lat: 31.241167 },
  { name: '广州·广州塔', lng: 113.319071, lat: 23.089350 },
  { name: '西安·钟楼', lng: 108.943014, lat: 34.261251 },
  { name: '哈尔滨·中央大街', lng: 126.617787, lat: 45.773226 },
  { name: '东京·银座（境外）', lng: 139.764936, lat: 35.671301 }
];

const VIEW_W = 640;
const VIEW_H = 384;
const M_PER_DEG = 111320; // 每纬度度数的米数（近似）
const PX_PER_M = 0.2; // 1 像素 = 5 米

export default {
  name: 'MapCoordTransform',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      lng: 116.391276,
      lat: 39.906217,
      activePreset: '北京·天安门',
      gpsMsg: '',
      presets: PRESETS,
      codePipeline: '// 业务侧：拿到坐标先问「哪个系的」，再按目标地图转换\n' +
        'const gps = [116.391276, 39.906217]; // navigator.geolocation 输出（WGS-84）\n\n' +
        '// ① 上高德/腾讯（GCJ-02）：加密一次\n' +
        'const gcj = wgs84ToGcj02(gps[0], gps[1]);\n\n' +
        '// ② 上百度（BD-09）：先转 GCJ-02 再二次加密（级联，无直达路径）\n' +
        'const bd = gcj02ToBd09(gcj[0], gcj[1]);\n\n' +
        '// ③ 高德坐标回存数据库（统一存 WGS-84）：迭代逆推\n' +
        'const wgs = gcj02ToWgs84(gcj[0], gcj[1], 3);\n\n' +
        '// ④ 境外坐标：outOfChina 内部已处理，原样返回\n' +
        'wgs84ToGcj02(139.764936, 35.671301); // => [139.764936, 35.671301]',
      codeInverse: '// 难点：GCJ-02 加密非线性，无解析逆 —— 工程标准做法是迭代逼近\n' +
        '// 思路：猜一个 wgs，加密后与目标 gcj 比对，把误差补回猜测，反复收敛\n' +
        'function gcj02ToWgs84 (glng, glat, iter = 3) {\n' +
        '  let wlng = glng, wlat = glat;        // 初值：拿 gcj 自身当猜测\n' +
        '  for (let i = 0; i < iter; i++) {\n' +
        '    const [elng, elat] = wgs84ToGcj02(wlng, wlat); // 加密当前猜测\n' +
        '    wlng += glng - elng;               // 误差 = 目标 - 加密结果\n' +
        '    wlat += glat - elat;               //   把误差补回，猜测更靠近真值\n' +
        '  }\n' +
        '  return [wlng, wlat];                 // 3 次后残差 < 1 毫米\n' +
        '}\n\n' +
        '// 一阶近似（只迭代 1 次）：速度快，残差通常 < 1 米，海量数据清洗可用',
      codeAlgo: '// ① WGS-84 → GCJ-02：非线性加密（三角函数扰动 + 椭球修正）\n' +
        'function wgs84ToGcj02 (lng, lat) {\n' +
        '  if (outOfChina(lng, lat)) return [lng, lat]; // 境外不加密\n' +
        '  let dlat = transformLat(lng - 105.0, lat - 35.0); // 伪随机扰动量\n' +
        '  let dlng = transformLng(lng - 105.0, lat - 35.0);\n' +
        '  const radlat = lat / 180.0 * PI;\n' +
        '  let magic = 1 - EE * Math.sin(radlat) ** 2;   // 椭球偏心率修正\n' +
        '  const sqrtmagic = Math.sqrt(magic);\n' +
        '  dlat = (dlat * 180.0) / ((A * (1 - EE)) / (magic * sqrtmagic) * PI);\n' +
        '  dlng = (dlng * 180.0) / (A / sqrtmagic * Math.cos(radlat) * PI);\n' +
        '  return [lng + dlng, lat + dlat];\n' +
        '}\n\n' +
        '// ② GCJ-02 → BD-09：极坐标下的固定平移 + 微小旋转（可解析逆）\n' +
        'function gcj02ToBd09 (lng, lat) {\n' +
        '  const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * X_PI);\n' +
        '  const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * X_PI);\n' +
        '  return [z * Math.cos(theta) + 0.0065, z * Math.sin(theta) + 0.006];\n' +
        '}\n\n' +
        '// ③ BD-09 → GCJ-02：逆着转回去即可（与②精确互逆）\n' +
        'function bd09ToGcj02 (lng, lat) {\n' +
        '  const x = lng - 0.0065, y = lat - 0.006;\n' +
        '  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);\n' +
        '  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);\n' +
        '  return [z * Math.cos(theta), z * Math.sin(theta)];\n' +
        '}\n\n' +
        '// ④ haversine 球面距离：偏移量测尺（米）\n' +
        'function haversine (lng1, lat1, lng2, lat2) {\n' +
        '  const rad = PI / 180;\n' +
        '  const a = Math.sin((lat2 - lat1) * rad / 2) ** 2 +\n' +
        '    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *\n' +
        '    Math.sin((lng2 - lng1) * rad / 2) ** 2;\n' +
        '  return 2 * 6371000 * Math.asin(Math.sqrt(a));\n' +
        '}'
    };
  },
  computed: {
    wgs () {
      return [Number(this.lng) || 0, Number(this.lat) || 0];
    },
    isAbroad () {
      return outOfChina(this.wgs[0], this.wgs[1]);
    },
    gcj () {
      return wgs84ToGcj02(this.wgs[0], this.wgs[1]);
    },
    bd () {
      return gcj02ToBd09(this.gcj[0], this.gcj[1]);
    },
    dWgsGcj () {
      return haversine(this.wgs[0], this.wgs[1], this.gcj[0], this.gcj[1]);
    },
    dGcjBd () {
      return haversine(this.gcj[0], this.gcj[1], this.bd[0], this.bd[1]);
    },
    dWgsBd () {
      return haversine(this.wgs[0], this.wgs[1], this.bd[0], this.bd[1]);
    },
    // 回环误差实测：正向转过去再逆向转回来，与原点的球面距离
    loopTests () {
      const [wlng, wlat] = this.wgs;
      const [glng, glat] = this.gcj;
      const [blng, blat] = this.bd;
      // 一阶逆推：gcj - (把 gcj 当 wgs 加密一次的增量)
      const g1 = wgs84ToGcj02(glng, glat);
      const w1 = [2 * glng - g1[0], 2 * glat - g1[1]];
      // 迭代逆推 × 3
      const w3 = gcj02ToWgs84(glng, glat, 3);
      // BD 解析逆
      const gBack = bd09ToGcj02(blng, blat);
      // 全链：WGS → GCJ → BD → GCJ → WGS
      const wFull = gcj02ToWgs84(gBack[0], gBack[1], 3);
      return [
        { path: 'WGS-84 → GCJ-02 → WGS-84', method: '一阶逆推（减一次加密增量）', err: haversine(wlng, wlat, w1[0], w1[1]) },
        { path: 'WGS-84 → GCJ-02 → WGS-84', method: '迭代逆推 × 3', err: haversine(wlng, wlat, w3[0], w3[1]) },
        { path: 'GCJ-02 → BD-09 → GCJ-02', method: '解析逆（数学精确互逆）', err: haversine(glng, glat, gBack[0], gBack[1]) },
        { path: 'WGS-84 → GCJ-02 → BD-09 → GCJ-02 → WGS-84', method: '解析逆 + 迭代逆推', err: haversine(wlng, wlat, wFull[0], wFull[1]) }
      ];
    }
  },
  watch: {
    lng () { this.drawCanvas(); },
    lat () { this.drawCanvas(); }
  },
  mounted () {
    this.drawCanvas();
  },
  methods: {
    applyPreset (p) {
      this.activePreset = p.name;
      this.lng = p.lng;
      this.lat = p.lat;
      this.gpsMsg = '';
    },
    useGps () {
      if (!navigator.geolocation) {
        this.gpsMsg = '当前浏览器不支持 Geolocation';
        return;
      }
      this.gpsMsg = '定位中…（需 HTTPS 与授权）';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // 技术点：GPS 输出一定是 WGS-84 —— 直接填入左侧输入框
          this.lng = +pos.coords.longitude.toFixed(6);
          this.lat = +pos.coords.latitude.toFixed(6);
          this.activePreset = '';
          this.gpsMsg = `已定位（精度 ±${Math.round(pos.coords.accuracy)}m）`;
        },
        (err) => {
          this.gpsMsg = `定位失败：${err.message}（HTTP 环境或拒绝授权）`;
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    },
    fmt (v) {
      return (Number(v) || 0).toFixed(6);
    },
    fmtM (v) {
      return v >= 1000 ? (v / 1000).toFixed(3) + ' km' : v.toFixed(1) + ' m';
    },
    fmtErr (v) {
      if (v < 0.001) return '< 1 mm（可视为无损）';
      if (v < 1) return (v * 100).toFixed(1) + ' cm';
      return v.toFixed(2) + ' m';
    },
    // 偏移可视化：以 WGS 点为中心，1px ≈ 5m 放大画偏移向量
    drawCanvas () {
      const canvas = this.$refs.canvas;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = VIEW_W;
      const H = VIEW_H;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const rad = PI / 180;
      // 经度方向每度的米数随纬度收缩
      const mPerDegLng = M_PER_DEG * Math.cos(this.wgs[1] * rad);
      const toPx = (lng, lat) => [
        cx + (lng - this.wgs[0]) * mPerDegLng * PX_PER_M,
        cy - (lat - this.wgs[1]) * M_PER_DEG * PX_PER_M
      ];
      // 背景
      ctx.fillStyle = '#f7fbff';
      ctx.fillRect(0, 0, W, H);
      // 网格：每 100m（20px）细线，每 500m（100px）粗线
      const step = 100 * PX_PER_M;
      const big = 500 * PX_PER_M;
      for (let x = cx % step; x < W; x += step) {
        const isBig = Math.abs(((x - cx) % big + big) % big) < 0.5 || Math.abs(((x - cx) % big + big) % big - big) < 0.5;
        ctx.strokeStyle = isBig ? '#d4e5f7' : '#e8f2fc';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = cy % step; y < H; y += step) {
        const off = ((y - cy) % big + big) % big;
        const isBig = off < 0.5 || big - off < 0.5;
        ctx.strokeStyle = isBig ? '#d4e5f7' : '#e8f2fc';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      // 中心十字（WGS 基准点）
      ctx.strokeStyle = '#b3d8ff';
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();

      const drawPoint = (p, color, label, dx, dy) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6, 0, PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.fillText(label, p[0] + dx, p[1] + dy);
      };
      const drawLink = (p1, p2, color, label) => {
        ctx.strokeStyle = color;
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.stroke();
        ctx.setLineDash([]);
        const mx = (p1[0] + p2[0]) / 2;
        const my = (p1[1] + p2[1]) / 2;
        ctx.fillStyle = color;
        ctx.font = '11px sans-serif';
        ctx.fillText(label, mx + 6, my - 4);
      };

      const pw = [cx, cy];
      const pg = toPx(this.gcj[0], this.gcj[1]);
      const pb = toPx(this.bd[0], this.bd[1]);
      if (this.isAbroad) {
        drawPoint(pw, '#1890ff', 'WGS-84 / GCJ-02 / BD-09（境外三点重合）', 12, -10);
      } else {
        drawLink(pw, pg, '#f5222d', '偏移 ' + this.dWgsGcj.toFixed(0) + 'm');
        drawLink(pg, pb, '#52c41a', '+' + this.dGcjBd.toFixed(0) + 'm');
        drawPoint(pw, '#1890ff', 'WGS-84', -58, -12);
        drawPoint(pg, '#f5222d', 'GCJ-02', 12, 4);
        drawPoint(pb, '#52c41a', 'BD-09', 12, 16);
      }
      // 比例尺
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(16, H - 18);
      ctx.lineTo(16 + 100 * PX_PER_M, H - 18);
      ctx.stroke();
      ctx.fillStyle = '#666';
      ctx.font = '11px sans-serif';
      ctx.fillText('100m（1px ≈ 5m，偏移已放大）', 16, H - 26);
    }
  }
};
</script>

<style lang="less" scoped>
.toolbar {
  margin-bottom: 10px;

  .el-button + .el-button {
    margin-left: 6px;
  }
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;

  .inp-label {
    font-size: 13px;
    color: #555;
    flex-shrink: 0;
  }

  .inp {
    width: 130px;
  }

  .gps-msg {
    font-size: 12px;
    color: #888;
  }
}

.coord-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 10px;
  font-size: 13px;

  th,
  td {
    border: 1px solid #e8e8e8;
    padding: 7px 10px;
    text-align: left;
  }

  th {
    background: #fafafa;
    font-weight: 600;
  }

  td.zero {
    color: #52c41a;
    font-weight: 600;
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;

    &.dot-wgs { background: #1890ff; }
    &.dot-gcj { background: #f5222d; }
    &.dot-bd { background: #52c41a; }
  }
}

.sub-line {
  font-size: 12px;
  color: #888;
  margin: 0 0 10px;
}

.canvas-wrap {
  .offset-canvas {
    width: 640px;
    height: 384px;
    max-width: 100%;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    display: block;
  }

  .canvas-legend {
    margin-top: 8px;
    font-size: 12px;
    color: #666;

    .lg {
      margin-right: 14px;

      &::before {
        content: '';
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 4px;
        vertical-align: -1px;
      }

      &.lg-wgs::before { background: #1890ff; }
      &.lg-gcj::before { background: #f5222d; }
      &.lg-bd::before { background: #52c41a; }
      &.lg-grid::before { background: #d4e5f7; border-radius: 2px; }
    }
  }
}
</style>
