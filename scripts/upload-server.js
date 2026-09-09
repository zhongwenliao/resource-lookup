/**
 * 大文件上传演示服务器（纯 Node http 模块，无框架依赖）
 *
 * 技术点：
 * 1. 分片接收：前端以 raw body（application/octet-stream）直传分片，
 *    服务端 req.pipe(fs.createWriteStream) 流式落盘，避开 multipart 解析
 * 2. 秒传：上传前按 hash 查询服务端是否已有同内容文件
 * 3. 断点续传：progress 接口返回已收到的分片索引，前端跳过这些分片
 * 4. 合并：全部分片到齐后按索引顺序拼接成完整文件
 *
 * 接口清单：
 * - GET  /upload/check?hash=xxx                 秒传检查
 * - GET  /upload/progress?hash=xxx              已上传分片列表（断点续传）
 * - POST /upload/chunk?hash=xxx&index=n         上传单个分片（raw body）
 * - POST /upload/merge?hash=xxx&filename=a.zip  合并分片
 * - GET  /upload/list                           已完成文件列表
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8082;
const TEMP_DIR = path.join(__dirname, '..', 'upload-temp');
const FINISHED_DIR = path.join(__dirname, '..', 'upload-finished');

// 存储目录初始化
[TEMP_DIR, FINISHED_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
});

/* ---------------- 工具函数 ---------------- */

// hash 只允许十六进制字符，杜绝路径穿越
function safeHash (hash) {
  return /^[a-f0-9]{6,64}$/i.test(hash) ? hash : null;
}

// 文件名取 basename 并过滤危险字符
function safeName (name) {
  return path.basename(String(name || 'file')).replace(/[\\/:*?"<>|]/g, '_');
}

function setCors (res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson (res, data) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

// 读取完整 raw body（分片最大 5MB，直接缓冲即可）
function readBody (req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// 已完成文件命名：{hash}_{filename}，按 hash 前缀查找即可秒传判断
function findFinished (hash) {
  return fs.readdirSync(FINISHED_DIR).find((name) => name.startsWith(hash + '_'));
}

/* ---------------- 路由处理 ---------------- */

// 秒传检查：服务端已有同 hash 文件则前端无需再传
function handleCheck (res, query) {
  const hash = safeHash(query.hash);
  if (!hash) return sendJson(res, { error: 'invalid hash' });
  const found = findFinished(hash);
  sendJson(res, {
    exists: Boolean(found),
    filename: found ? found.slice(hash.length + 1) : ''
  });
}

// 断点续传：返回临时目录里已落盘的分片索引
function handleProgress (res, query) {
  const hash = safeHash(query.hash);
  if (!hash) return sendJson(res, { error: 'invalid hash' });
  const dir = path.join(TEMP_DIR, hash);
  const uploaded = fs.existsSync(dir) ? fs.readdirSync(dir).map(Number).sort((a, b) => a - b) : [];
  sendJson(res, { uploaded });
}

// 接收单个分片：raw body 流式写入 temp/{hash}/{index}
async function handleChunk (req, res, query) {
  const hash = safeHash(query.hash);
  const index = parseInt(query.index, 10);
  if (!hash || isNaN(index) || index < 0) {
    return sendJson(res, { error: 'invalid hash or index' });
  }
  const dir = path.join(TEMP_DIR, hash);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const body = await readBody(req);
  fs.writeFileSync(path.join(dir, String(index)), body);
  sendJson(res, { ok: true, index, size: body.length });
}

// 合并：按索引顺序 appendFileSync 拼接，随后清理临时分片
function handleMerge (res, query) {
  const hash = safeHash(query.hash);
  if (!hash) return sendJson(res, { error: 'invalid hash' });
  const dir = path.join(TEMP_DIR, hash);
  if (!fs.existsSync(dir)) {
    return sendJson(res, { error: 'no chunks found' });
  }
  const indexes = fs.readdirSync(dir).map(Number).sort((a, b) => a - b);
  const filename = safeName(query.filename);
  const target = path.join(FINISHED_DIR, hash + '_' + filename);
  indexes.forEach((i) => {
    fs.appendFileSync(target, fs.readFileSync(path.join(dir, String(i))));
  });
  // 合并完成，清理临时分片目录
  indexes.forEach((i) => fs.unlinkSync(path.join(dir, String(i))));
  fs.rmdirSync(dir);
  sendJson(res, {
    ok: true,
    filename,
    size: fs.statSync(target).size,
    chunks: indexes.length,
    url: '/upload-finished/' + hash + '_' + filename
  });
}

// 已完成文件列表（演示用）
function handleList (res) {
  const files = fs.readdirSync(FINISHED_DIR).map((name) => {
    const stat = fs.statSync(path.join(FINISHED_DIR, name));
    return { name, size: stat.size, time: stat.mtime.toISOString() };
  });
  sendJson(res, { files });
}

/* ---------------- 服务器 ---------------- */

const server = http.createServer((req, res) => {
  setCors(res);
  const { pathname, query } = url.parse(req.url, true);

  // 预检请求直接放行
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (pathname === '/upload/check' && req.method === 'GET') {
    return handleCheck(res, query);
  }
  if (pathname === '/upload/progress' && req.method === 'GET') {
    return handleProgress(res, query);
  }
  if (pathname === '/upload/chunk' && req.method === 'POST') {
    return handleChunk(req, res, query);
  }
  if (pathname === '/upload/merge' && req.method === 'POST') {
    return handleMerge(res, query);
  }
  if (pathname === '/upload/list' && req.method === 'GET') {
    return handleList(res);
  }

  res.statusCode = 404;
  sendJson(res, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`Upload server running: http://127.0.0.1:${PORT}`);
  console.log(`  temp chunks : ${TEMP_DIR}`);
  console.log(`  finished    : ${FINISHED_DIR}`);
});
