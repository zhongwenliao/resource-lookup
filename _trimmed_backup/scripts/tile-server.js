/**
 * 地图瓦片演示服务器（纯 Node http 模块，无框架依赖）
 *
 * 技术点：
 * 1. 程序化瓦片：不依赖任何地图服务，按 z/x/y 坐标确定性生成 SVG 瓦片
 *    （同一坐标每次生成的「街区/道路」布局一致，但带生成时间戳，用于观察 SWR 更新）
 * 2. 弱网模拟：每个请求可带 ?delay=ms（人为延迟）与 ?fail=0~1（随机丢包率），
 *    由前端演示页实时调节，模拟 2G/3G/断网等场景
 * 3. 禁用 HTTP 缓存（Cache-Control: no-store），确保演示中的缓存收益
 *    全部来自页面侧 Cache API，排除浏览器缓存干扰
 *
 * 接口清单：
 * - GET /tiles/:z/:x/:y.svg?delay=0&fail=0   瓦片（SVG，256x256）
 * - GET /health                               服务状态
 */
const http = require('http');
const url = require('url');

const PORT = 8083;

/* ---------------- 确定性伪随机：同一瓦片坐标布局稳定 ---------------- */

function lcg (seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return function () {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

// 瓦片坐标 → 稳定种子
function tileSeed (z, x, y) {
  return (z * 73856093) ^ (x * 19349663) ^ (y * 83492791);
}

/* ---------------- SVG 瓦片生成：模拟街区/道路/水系 ---------------- */

function tileSvg (z, x, y) {
  const rand = lcg(tileSeed(z, x, y));
  const W = 256;
  const parts = [];

  // 底色：按种子在「陆地 / 带水系」两种底色间选择
  const hasWater = rand() < 0.3;
  parts.push(`<rect width="${W}" height="${W}" fill="${hasWater ? '#dcebF5' : '#f2efe9'}"/>`);

  // 水系：一条贯穿的浅蓝色带
  if (hasWater) {
    const wy = 40 + rand() * 176;
    parts.push(`<path d="M0 ${wy} C 64 ${wy - 30}, 128 ${wy + 30}, ${W} ${wy - 10} L ${W} ${W} L 0 ${W} Z" fill="#aad3df"/>`);
  }

  // 街区：3~6 个灰色地块（公园用绿色）
  const blockCount = 3 + Math.floor(rand() * 4);
  for (let i = 0; i < blockCount; i++) {
    const bw = 40 + rand() * 70;
    const bh = 30 + rand() * 60;
    const bx = rand() * (W - bw);
    const by = rand() * (W - bh);
    const park = rand() < 0.25;
    parts.push(`<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" ` +
      `rx="2" fill="${park ? '#cdebb0' : '#e4e0d8'}" stroke="#d0ccc2" stroke-width="1"/>`);
  }

  // 道路：一横一纵 + 若干斜线，模拟路网
  const roadColor = '#ffffff';
  const mainY = 60 + rand() * 136;
  const mainX = 60 + rand() * 136;
  parts.push(`<line x1="0" y1="${mainY.toFixed(1)}" x2="${W}" y2="${mainY.toFixed(1)}" stroke="${roadColor}" stroke-width="8"/>`);
  parts.push(`<line x1="${mainX.toFixed(1)}" y1="0" x2="${mainX.toFixed(1)}" y2="${W}" stroke="${roadColor}" stroke-width="8"/>`);
  const branchCount = 2 + Math.floor(rand() * 3);
  for (let i = 0; i < branchCount; i++) {
    parts.push(`<line x1="${(rand() * W).toFixed(1)}" y1="${(rand() * W).toFixed(1)}" ` +
      `x2="${(rand() * W).toFixed(1)}" y2="${(rand() * W).toFixed(1)}" stroke="${roadColor}" stroke-width="3" opacity="0.8"/>`);
  }
  // 主干道描一层橙色边，模拟国道
  parts.push(`<line x1="0" y1="${mainY.toFixed(1)}" x2="${W}" y2="${mainY.toFixed(1)}" stroke="#f6c26b" stroke-width="2" opacity="0.9"/>`);

  // 坐标标注 + 生成时间（时间戳用于观察缓存的新鲜度）
  const genAt = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  parts.push(`<rect x="8" y="8" width="150" height="42" rx="4" fill="rgba(24,34,48,0.72)"/>`);
  parts.push(`<text x="16" y="26" font-family="monospace" font-size="13" fill="#fff">z${z} x${x} y${y}</text>`);
  parts.push(`<text x="16" y="43" font-family="monospace" font-size="11" fill="#9fd4ff">gen ${genAt}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">${parts.join('')}</svg>`;
}

/* ---------------- 请求处理 ---------------- */

function setCors (res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = decodeURIComponent(parsed.pathname);

  if (req.method === 'OPTIONS') {
    setCors(res);
    res.end();
    return;
  }

  // 健康检查
  if (pathname === '/health') {
    setCors(res);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, port: PORT, time: Date.now() }));
    return;
  }

  // 瓦片：/tiles/:z/:x/:y.svg（x/y 允许负数，拖拽出界时不至于 404）
  const match = pathname.match(/^\/tiles\/(\d+)\/(-?\d+)\/(-?\d+)\.svg$/);
  if (!match) {
    setCors(res);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'not found', usage: '/tiles/{z}/{x}/{y}.svg?delay=ms&fail=0~1' }));
    return;
  }

  const z = Number(match[1]);
  const x = Number(match[2]);
  const y = Number(match[3]);

  // 弱网参数：delay 人为延迟（ms），fail 随机丢包率（0~1）
  const delay = Math.max(0, Math.min(5000, Number(parsed.query.delay) || 0));
  const fail = Math.max(0, Math.min(1, Number(parsed.query.fail) || 0));

  const respond = () => {
    setCors(res);
    // 禁用 HTTP 缓存：让演示的缓存收益只来自页面侧 Cache API
    res.setHeader('Cache-Control', 'no-store');
    if (Math.random() < fail) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ error: 'weak network: packet loss' }));
      return;
    }
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.end(tileSvg(z, x, y));
  };

  // 模拟弱网延迟
  setTimeout(respond, delay);
});

server.listen(PORT, () => {
  console.log(`[tile-server] 地图瓦片服务已启动: http://127.0.0.1:${PORT}`);
  console.log('[tile-server] 瓦片地址示例: http://127.0.0.1:8083/tiles/12/3372/1553.svg?delay=300&fail=0.2');
  console.log('[tile-server] 弱网参数: ?delay=毫秒(人为延迟) & fail=0~1(丢包率)');
});
