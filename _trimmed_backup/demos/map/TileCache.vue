<template>
  <demo-page
    title="地图瓦片离线缓存"
    description="地图类应用在弱网/离线环境的核心优化：瓦片按 z/x/y 坐标寻址、天然适合 Cache API 做请求级缓存。本页配套本地瓦片服务（npm run tile:server，端口 8083），可实时调节延迟与丢包率模拟弱网，实测「直连 / 缓存优先 / 先缓存后更新」三种策略的耗时与离线兜底表现。">
    <demo-block
      :index="1"
      title="瓦片服务与弱网模拟"
      description="瓦片服务程序化生成 SVG 瓦片（带生成时间戳，用于观察缓存新鲜度），并支持两个弱网参数：delay（人为延迟）与 fail（随机丢包率）。服务端已禁用 HTTP 缓存，确保演示中的缓存收益全部来自页面侧 Cache API。"
      :code="codeWeak">
      <div class="state-panel">
        <p>
          <span class="label">瓦片服务：</span>
          <el-tag v-if="serverOk" type="success" size="small">运行中（127.0.0.1:8083）</el-tag>
          <el-tag v-else type="danger" size="small">未启动 —— 请运行 npm run tile:server</el-tag>
          <el-tag v-if="!cacheSupported" type="warning" size="small">当前环境不支持 Cache API</el-tag>
        </p>
        <p><span class="label">弱网延迟：</span>{{ delayMs }} ms（拖动滑块实时生效，新请求按新延迟返回）</p>
        <el-slider v-model="delayMs" :min="0" :max="2000" :step="100" class="slider"></el-slider>
        <p><span class="label">丢包率：</span>{{ failRate }}%（服务端按概率返回 503）</p>
        <el-slider v-model="failRate" :min="0" :max="100" :step="5" class="slider"></el-slider>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="瓦片地图与缓存策略实测"
      description="拖拽平移、按钮缩放，视口内瓦片按当前策略加载：直连网络每次都走网络；缓存优先命中即回（注意瓦片上的生成时间会停留在首次缓存时刻）；先缓存后更新先回旧缓存、后台静默拉新（时间戳会刷新）。瓦片左上角标注坐标与生成时间，边框颜色标记来源。"
      :code="codeStrategy">
      <div class="toolbar">
        <el-radio-group v-model="strategy" size="small">
          <el-radio-button label="none">直连网络</el-radio-button>
          <el-radio-button label="cache-first">缓存优先</el-radio-button>
          <el-radio-button label="swr">先缓存后更新</el-radio-button>
        </el-radio-group>
        <el-button size="small" @click="reloadView">重新加载当前视图</el-button>
        <el-button size="small" type="warning" plain @click="clearTileCache">清空瓦片缓存</el-button>
        <span class="hint">当前层级 z{{ view.z }}</span>
      </div>
      <div class="map-wrap">
        <div class="map-toolbar">
          <el-button-group>
            <el-button size="mini" icon="el-icon-zoom-in" @click="zoomIn">放大</el-button>
            <el-button size="mini" icon="el-icon-zoom-out" @click="zoomOut">缩小</el-button>
          </el-button-group>
          <el-button v-for="p in presets" :key="p.name" size="mini" @click="goPreset(p)">{{ p.name }}</el-button>
          <span class="hint">按住地图拖拽平移</span>
        </div>
        <div
          class="map-viewport"
          @mousedown.prevent="onDragStart"
          @mousemove="onDragMove"
          @mouseup="onDragEnd"
          @mouseleave="onDragEnd">
          <div
            v-for="(t, key) in tiles"
            :key="key"
            class="tile"
            :class="tileClass(t)"
            :style="tileStyle(t)">
            <img v-if="t.status === 'ok'" :src="t.url" draggable="false">
            <span v-else-if="t.status === 'loading'" class="tile-mask">加载中…</span>
            <span v-else class="tile-mask tile-err" @click.stop="retryTile(key)">失败 · 点击重试</span>
            <i v-if="t.status === 'ok' && t.source === 'cache'" class="tile-badge">缓存</i>
            <i v-if="t.status === 'ok' && t.updated" class="tile-badge upd">已更新</i>
          </div>
          <div v-if="!serverOk" class="map-overlay">瓦片服务未启动，请先运行 npm run tile:server</div>
        </div>
        <div class="map-legend">
          <span class="lg lg-cache">缓存命中</span>
          <span class="lg lg-net">网络加载</span>
          <span class="lg lg-err">失败</span>
          <span class="hint">瓦片左上角 z/x/y 为坐标，gen 为服务端生成时间</span>
        </div>
      </div>
      <div class="state-panel">
        <p>
          <span class="label">统计：</span>
          总请求 {{ stats.requests }} · 缓存命中 {{ stats.cacheHits }}（{{ hitRate }}）·
          网络请求 {{ stats.network }} · 失败 {{ stats.failures }}
        </p>
        <p>
          <span class="label">平均耗时：</span>
          缓存 {{ avgCacheMs }} ms vs 网络 {{ avgNetworkMs }} ms
          <el-tag v-if="speedup !== '-'" size="mini" type="success">加速 {{ speedup }} 倍</el-tag>
        </p>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="弱网性能对比实验"
      description="一键对当前视图周边 8 张瓦片做两轮加载：第一轮强制走网络（按当前弱网参数），第二轮读 Cache API。弱网参数越大，缓存优势越明显。"
      :code="codeBench">
      <div class="toolbar">
        <el-button type="primary" size="small" :loading="benching" :disabled="!serverOk" @click="runBench">
          跑一轮对比（8 张瓦片 x 两轮）
        </el-button>
        <span class="hint">建议先把延迟调到 500ms 以上再跑，对比更直观</span>
      </div>
      <div v-if="bench" class="result-table">
        <div class="row head">
          <span>瓦片坐标</span><span>直连网络</span><span>缓存读取</span>
        </div>
        <div v-for="r in bench.rows" :key="r.key" class="row">
          <span>{{ r.key }}</span>
          <span>{{ r.net >= 0 ? r.net + ' ms' : '失败' }}</span>
          <span>
            <el-tag v-if="r.cache >= 0" size="mini" type="success">{{ r.cache }} ms</el-tag>
            <el-tag v-else size="mini" type="danger">未缓存</el-tag>
          </span>
        </div>
        <div class="row sum">
          <span>平均</span>
          <span>{{ bench.netAvg ? bench.netAvg + ' ms' : '-' }}</span>
          <span>{{ bench.cacheAvg ? bench.cacheAvg + ' ms' : '-' }}</span>
        </div>
      </div>
      <div v-if="bench" class="playbook">
        <p><b>结论：</b>平均 {{ bench.netAvg }} ms（网络）→ {{ bench.cacheAvg }} ms（缓存），
          加速约 <b>{{ bench.ratio }}</b> 倍；网络轮失败 {{ bench.netFail }} 张（丢包所致），缓存轮全部命中。</p>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="离线兜底实测"
      description="先把当前区域拖动浏览一圈让瓦片进缓存，再打开「模拟断网」（丢包率强制 100%），然后重新加载视图：已缓存瓦片照常渲染，未缓存区域显示失败 —— 这就是离线地图的兜底边界。"
      :code="codeOffline">
      <div class="toolbar">
        <span class="label">模拟断网：</span>
        <el-switch v-model="offlineMode"></el-switch>
        <el-button size="small" type="primary" plain @click="reloadView">重新加载当前视图</el-button>
        <span class="hint">{{ offlineMode ? '断网中：所有网络请求都会 503' : '网络正常' }}</span>
      </div>
      <div class="state-panel">
        <p><span class="label">当前视图：</span>{{ offlineSummary }}</p>
        <p class="hint">玩法：缓存优先 + 断网 → 重新加载 → 已看过的瓦片全部从缓存恢复；拖到未浏览过的区域 → 只有失败块</p>
      </div>
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="瓦片缓存的核心取舍与常见坑：">
      <ul class="point-list">
        <li><b>坐标寻址</b>：瓦片 URL 由 z/x/y 唯一确定，天然幂等，是 Cache API 的理想缓存对象</li>
        <li><b>缓存 key 去参</b>：弱网参数（delay/fail）只影响传输不影响内容，缓存 key 必须剥掉 query，否则缓存永远打不中</li>
        <li><b>策略选型</b>：底图瓦片基本不变 → Cache First；带时间戳的动态瓦片 → SWR；两者弱网下都比直连快一个数量级</li>
        <li><b>跨域可缓存</b>：Cache API 可存跨域响应（需服务端 CORS），匹配按完整 URL 字符串</li>
        <li><b>禁用 HTTP 缓存</b>：服务端 Cache-Control: no-store 排除浏览器缓存干扰，缓存收益可归因；生产中两层缓存可叠加</li>
        <li><b>容量控制</b>：Cache API 不会自动淘汰，需按 LRU 思路自管（如按 z 层级分缓存名、超量删除最旧）</li>
        <li><b>调试</b>：DevTools → Application → Cache Storage 可直接看到每张瓦片；Performance 面板可对比两轮加载瀑布图</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

// 瓦片服务地址与视口常量（非响应式）
const BASE_URL = 'http://127.0.0.1:8083';
const CACHE_NAME = 'map-tiles-v1';
const TILE_SIZE = 128;
const VIEW_W = 640;
const VIEW_H = 384;

export default {
  name: 'MapTileCache',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      serverOk: false,
      cacheSupported: ('caches' in window),
      delayMs: 500,
      failRate: 10,
      offlineMode: false,
      strategy: 'cache-first',
      view: { z: 12, cx: 3372.5, cy: 1553.5 },
      tiles: {},
      stats: { requests: 0, cacheHits: 0, network: 0, failures: 0 },
      cacheTimes: [],
      networkTimes: [],
      bench: null,
      benching: false,
      presets: [{
        name: '城区中心', z: 12, cx: 3372.5, cy: 1553.5
      }, {
        name: '水系新区', z: 14, cx: 13490.5, cy: 6215.5
      }, {
        name: '全域概览', z: 6, cx: 52.5, cy: 26.5
      }],
      codeWeak: "// 瓦片服务：程序化生成 SVG，带弱网参数\n// GET /tiles/{z}/{x}/{y}.svg?delay=300&fail=0.2\nres.setHeader('Cache-Control', 'no-store') // 禁 HTTP 缓存，收益归因 Cache API\nsetTimeout(() => {\n  if (Math.random() < fail) res.statusCode = 503 // 模拟丢包\n  else res.end(tileSvg(z, x, y))\n}, delay) // 模拟弱网延迟",
      codeStrategy: '// 缓存优先（Cache First）：命中即回，未命中走网络并写缓存\n' +
        "const cache = await caches.open('map-tiles-v1')\n" +
        'const hit = await cache.match(tileUrl) // key 已剥掉 delay/fail query\n' +
        'if (hit) return hit.blob()\n' +
        "const resp = await fetch(tileUrl + '?delay=500')\n" +
        'cache.put(tileUrl, resp.clone())\n' +
        'return resp.blob()\n\n' +
        '// 先缓存后更新（SWR）：先回旧缓存，后台静默拉新\n' +
        'if (hit) {\n' +
        '  render(hit)\n' +
        '  fetch(tileUrl).then((fresh) => cache.put(tileUrl, fresh)) // 不阻塞渲染\n' +
        '}',
      codeBench: '// 同一批瓦片两轮加载：网络轮 vs 缓存轮\n' +
        'const t0 = performance.now()\n' +
        'await fetch(tileUrl)                    // 第一轮：网络（含弱网延迟）\n' +
        'const netCost = performance.now() - t0\n\n' +
        'const t1 = performance.now()\n' +
        'const hit = await cache.match(tileUrl)  // 第二轮：缓存\n' +
        'const cacheCost = performance.now() - t1\n' +
        '// 弱网 500ms 延迟下，缓存通常 < 5ms，加速两个数量级',
      codeOffline: "// 离线兜底：断网后 fetch 全部 reject/503，缓存命中不受影响\nconst hit = await cache.match(tileUrl)\nif (hit) return hit.blob()   // 离线可用：已浏览区域照常渲染\nthrow new Error('offline')   // 未缓存区域只能失败兜底"
    };
  },
  computed: {
    // 断网模式下丢包率强制 100%
    effectiveFail () {
      return this.offlineMode ? 1 : this.failRate / 100;
    },
    hitRate () {
      if (!this.stats.requests) return '0%';
      return Math.round(this.stats.cacheHits / this.stats.requests * 100) + '%';
    },
    avgCacheMs () {
      if (!this.cacheTimes.length) return '-';
      return Math.round(this.cacheTimes.reduce((a, b) => a + b, 0) / this.cacheTimes.length);
    },
    avgNetworkMs () {
      if (!this.networkTimes.length) return '-';
      return Math.round(this.networkTimes.reduce((a, b) => a + b, 0) / this.networkTimes.length);
    },
    speedup () {
      if (!this.cacheTimes.length || !this.networkTimes.length || !this.avgNetworkMs) return '-';
      return (this.avgNetworkMs / Math.max(this.avgCacheMs, 1)).toFixed(1);
    },
    offlineSummary () {
      const list = Object.keys(this.tiles).map((k) => this.tiles[k]);
      if (!list.length) return '暂无瓦片';
      const cache = list.filter((t) => t.status === 'ok' && t.source === 'cache').length;
      const net = list.filter((t) => t.status === 'ok' && t.source === 'network').length;
      const err = list.filter((t) => t.status === 'error').length;
      const loading = list.filter((t) => t.status === 'loading').length;
      return `缓存恢复 ${cache} 张 · 网络加载 ${net} 张 · 失败 ${err} 张 · 加载中 ${loading} 张`;
    }
  },
  created () {
    // 拖拽状态非响应式，避免 mousemove 触发多余依赖收集
    this.drag = { active: false, x: 0, y: 0 };
    this.checkServer();
  },
  beforeDestroy () {
    // 释放所有 objectURL，避免内存泄漏
    Object.keys(this.tiles).forEach((key) => {
      if (this.tiles[key].url) URL.revokeObjectURL(this.tiles[key].url);
    });
  },
  methods: {
    /* ---------------- 服务与地址 ---------------- */

    checkServer () {
      fetch(BASE_URL + '/health')
        .then((r) => r.json())
        .then(() => {
          this.serverOk = true;
          this.updateTiles();
        })
        .catch(() => { this.serverOk = false; });
    },

    // 缓存 key：剥掉弱网参数，只保留坐标寻址（内容幂等）
    cacheKey (z, x, y) {
      return BASE_URL + '/tiles/' + z + '/' + x + '/' + y + '.svg';
    },

    // 实际请求地址：携带当前弱网参数
    tileUrl (z, x, y) {
      return this.cacheKey(z, x, y) + '?delay=' + this.delayMs + '&fail=' + this.effectiveFail;
    },

    /* ---------------- 瓦片加载（三种策略） ---------------- */

    // 网络直取：可选写入缓存，完成后回调 onDone(blob | null, source)
    fetchFromNetwork (z, x, y, cache, onDone) {
      const t0 = performance.now();
      fetch(this.tileUrl(z, x, y))
        .then((resp) => {
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          if (!cache) return Promise.all([resp.blob(), null]);
          const clone = resp.clone();
          return Promise.all([resp.blob(), cache.put(this.cacheKey(z, x, y), clone)]);
        })
        .then((pair) => onDone(pair[0], 'network', Math.round(performance.now() - t0)))
        .catch((err) => onDone(null, 'error', Math.round(performance.now() - t0), err.message));
    },

    loadTile (z, x, y) {
      const key = z + '/' + x + '/' + y;
      const t0 = performance.now();
      this.$set(this.tiles, key, { z: z, x: x, y: y, status: 'loading', url: '', source: '', cost: 0, updated: false });
      this.stats.requests++;

      // 统一收口：记录统计 + 更新瓦片状态
      const done = (blob, source, cost) => {
        this.record(source, cost);
        if (source === 'error') {
          this.$set(this.tiles, key, { z: z, x: x, y: y, status: 'error', url: '', source: 'error', cost: cost, updated: false });
          return;
        }
        const prev = this.tiles[key];
        if (prev && prev.url) URL.revokeObjectURL(prev.url);
        this.$set(this.tiles, key, { z: z, x: x, y: y, status: 'ok', url: URL.createObjectURL(blob), source: source, cost: cost, updated: false });
      };

      // 直连：不读不写缓存
      if (this.strategy === 'none') {
        this.fetchFromNetwork(z, x, y, null, done);
        return;
      }

      caches.open(CACHE_NAME).then((cache) => {
        cache.match(this.cacheKey(z, x, y)).then((hit) => {
          if (hit) {
            hit.blob().then((blob) => done(blob, 'cache', Math.round(performance.now() - t0)));
            // SWR：先回旧缓存，后台静默拉新（时间戳会刷新，观察「已更新」角标）
            if (this.strategy === 'swr') {
              this.fetchFromNetwork(z, x, y, cache, (blob, source, cost) => {
                if (source === 'error') return; // 后台更新失败静默，不打扰已渲染的缓存版本
                this.record('network', cost);
                const cur = this.tiles[key];
                if (cur && cur.status === 'ok' && cur.url) URL.revokeObjectURL(cur.url);
                this.$set(this.tiles, key, { z: z, x: x, y: y, status: 'ok', url: URL.createObjectURL(blob), source: 'cache', cost: cost, updated: true });
              });
            }
            return;
          }
          this.fetchFromNetwork(z, x, y, cache, done);
        });
      });
    },

    record (source, cost) {
      if (source === 'cache') {
        this.stats.cacheHits++;
        this.cacheTimes.push(cost);
        if (this.cacheTimes.length > 60) this.cacheTimes.shift();
      } else if (source === 'network') {
        this.stats.network++;
        this.networkTimes.push(cost);
        if (this.networkTimes.length > 60) this.networkTimes.shift();
      } else {
        this.stats.failures++;
      }
    },

    retryTile (key) {
      const t = this.tiles[key];
      if (t) this.loadTile(t.z, t.x, t.y);
    },

    /* ---------------- 视口计算与交互 ---------------- */

    // 按视口中心 diff 出需要的瓦片：新增的触发加载，移出的释放
    updateTiles () {
      const z = this.view.z;
      const cx = Math.floor(this.view.cx);
      const cy = Math.floor(this.view.cy);
      const halfCols = Math.ceil(VIEW_W / 2 / TILE_SIZE);
      const halfRows = Math.ceil(VIEW_H / 2 / TILE_SIZE);
      const needed = {};
      for (let y = cy - halfRows; y <= cy + halfRows; y++) {
        for (let x = cx - halfCols; x <= cx + halfCols; x++) {
          const key = z + '/' + x + '/' + y;
          needed[key] = true;
          if (!this.tiles[key]) this.loadTile(z, x, y);
        }
      }
      Object.keys(this.tiles).forEach((key) => {
        if (!needed[key]) {
          if (this.tiles[key].url) URL.revokeObjectURL(this.tiles[key].url);
          this.$delete(this.tiles, key);
        }
      });
    },

    tileStyle (t) {
      return {
        left: (VIEW_W / 2 + (t.x - this.view.cx) * TILE_SIZE) + 'px',
        top: (VIEW_H / 2 + (t.y - this.view.cy) * TILE_SIZE) + 'px',
        width: TILE_SIZE + 'px',
        height: TILE_SIZE + 'px'
      };
    },

    tileClass (t) {
      if (t.status === 'error') return 'is-error';
      if (t.status === 'loading') return 'is-loading';
      return t.source === 'cache' ? 'is-cache' : 'is-net';
    },

    onDragStart (e) {
      this.drag.active = true;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
    },
    onDragMove (e) {
      if (!this.drag.active) return;
      // 拖拽像素换算为瓦片坐标偏移（拖右 = 视野左移）
      this.view.cx -= (e.clientX - this.drag.x) / TILE_SIZE;
      this.view.cy -= (e.clientY - this.drag.y) / TILE_SIZE;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
      this.updateTiles();
    },
    onDragEnd () {
      this.drag.active = false;
    },

    // 缩放保持视野中心：z+1 时坐标翻倍
    zoomIn () {
      if (this.view.z >= 17) return;
      this.view.z++;
      this.view.cx *= 2;
      this.view.cy *= 2;
      this.updateTiles();
    },
    zoomOut () {
      if (this.view.z <= 3) return;
      this.view.z--;
      this.view.cx /= 2;
      this.view.cy /= 2;
      this.updateTiles();
    },
    goPreset (p) {
      this.view.z = p.z;
      this.view.cx = p.cx;
      this.view.cy = p.cy;
      this.updateTiles();
    },

    reloadView () {
      Object.keys(this.tiles).forEach((key) => {
        if (this.tiles[key].url) URL.revokeObjectURL(this.tiles[key].url);
      });
      this.tiles = {};
      this.updateTiles();
    },

    clearTileCache () {
      caches.delete(CACHE_NAME).then(() => {
        this.$message.success('瓦片缓存已清空');
        this.reloadView();
      });
    },

    /* ---------------- 弱网对比实验 ---------------- */

    runBench () {
      const z = this.view.z;
      const bx = Math.floor(this.view.cx);
      const by = Math.floor(this.view.cy);
      const coords = [];
      for (let i = 0; i < 8; i++) {
        coords.push({ z: z, x: bx + (i % 4), y: by + Math.floor(i / 4) });
      }
      this.benching = true;

      // 第一轮：强制走网络（按当前弱网参数），成功的同时写入缓存
      const netRow = (c) => new Promise((resolve) => {
        const t0 = performance.now();
        fetch(this.tileUrl(c.z, c.x, c.y))
          .then((resp) => {
            if (!resp.ok) throw new Error(resp.status);
            const clone = resp.clone();
            return Promise.all([
              resp.blob(),
              caches.open(CACHE_NAME).then((cache) => cache.put(this.cacheKey(c.z, c.x, c.y), clone))
            ]);
          })
          .then(() => resolve(Math.round(performance.now() - t0)))
          .catch(() => resolve(-1));
      });

      // 第二轮：读缓存
      const cacheRow = (c) => new Promise((resolve) => {
        const t0 = performance.now();
        caches.open(CACHE_NAME)
          .then((cache) => cache.match(this.cacheKey(c.z, c.x, c.y)))
          .then((hit) => resolve(hit ? Math.round(performance.now() - t0) : -1));
      });

      Promise.all(coords.map(netRow)).then((netTimes) => {
        Promise.all(coords.map(cacheRow)).then((cacheTimes) => {
          const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
          const okNet = netTimes.filter((v) => v >= 0);
          const okCache = cacheTimes.filter((v) => v >= 0);
          this.bench = {
            rows: coords.map((c, i) => ({
              key: c.z + '/' + c.x + '/' + c.y,
              net: netTimes[i],
              cache: cacheTimes[i]
            })),
            netAvg: avg(okNet),
            cacheAvg: avg(okCache),
            netFail: netTimes.filter((v) => v < 0).length,
            ratio: (okNet.length && okCache.length)
              ? (avg(okNet) / Math.max(avg(okCache), 1)).toFixed(1)
              : '-'
          };
          this.benching = false;
        });
      });
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

  .slider {
    margin: 4px 16px 12px 0;
  }
}

.hint {
  font-size: 12px;
  color: #999;
}

/* ---------------- 地图视口 ---------------- */

.map-wrap {
  margin-bottom: 14px;
}

.map-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.map-viewport {
  position: relative;
  width: 640px;
  max-width: 100%;
  height: 384px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
  background: #e8e6e0;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  .tile {
    position: absolute;
    box-sizing: border-box;
    border: 2px solid transparent;
    overflow: hidden;
    background: #efede8;

    img {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    &.is-cache {
      border-color: #52c41a;
    }

    &.is-net {
      border-color: #1890ff;
    }

    &.is-error {
      border-color: #f5222d;
      background: repeating-linear-gradient(45deg, #fff1f0, #fff1f0 8px, #ffece8 8px, #ffece8 16px);
    }

    &.is-loading {
      background: repeating-linear-gradient(45deg, #f5f5f5, #f5f5f5 8px, #efefef 8px, #efefef 16px);
    }

    .tile-mask {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 12px;
      color: #999;
    }

    .tile-err {
      color: #f5222d;
      cursor: pointer;
    }

    .tile-badge {
      position: absolute;
      right: 4px;
      bottom: 4px;
      padding: 1px 6px;
      background: rgba(82, 196, 26, 0.85);
      border-radius: 2px;
      font-size: 11px;
      font-style: normal;
      color: #fff;

      &.upd {
        background: rgba(24, 144, 255, 0.85);
      }
    }
  }

  .map-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.9);
    font-size: 13px;
    color: #f5222d;
  }
}

.map-legend {
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

    &.lg-cache {
      background: #52c41a;
    }

    &.lg-net {
      background: #1890ff;
    }

    &.lg-err {
      background: #f5222d;
    }
  }
}

/* ---------------- 结果表 ---------------- */

.result-table {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 14px;

  .row {
    display: flex;
    padding: 8px 12px;
    font-size: 12px;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &.head {
      background: #fafafa;
      color: #888;
      font-weight: 600;
    }

    &.sum {
      background: #f6ffed;
      color: #389e0d;
      font-weight: 600;
    }

    span {
      flex: 1;
    }
  }
}

.playbook {
  padding: 10px 14px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.9;
  color: #555;

  p {
    margin: 0;
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
