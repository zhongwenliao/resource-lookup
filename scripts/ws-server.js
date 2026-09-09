/**
 * 极简 WebSocket 演示服务器（基于 ws 库）
 * 启动：npm run ws:server（默认端口 8081）
 *
 * 技术点：
 * 1. 连接建立：HTTP Upgrade 握手升级为 WebSocket 协议（ws 库内部完成）
 * 2. 应用层消息协议：约定 { type, data } 的 JSON 格式，按 type 分发处理
 * 3. 心跳保活：服务端用「协议层 ping 帧」检测死连接；
 *    浏览器端无法主动发 ping 帧，所以浏览器侧心跳用「应用层 ping 消息」模拟
 * 4. 广播：遍历 wss.clients 逐个发送
 * 5. kick 指令模拟服务端主动断线，配合前端断线重连演示
 */
const WebSocket = require('ws');

const PORT = 8081;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server running: ws://127.0.0.1:${PORT}`);

// 连接编号，方便日志观察
let seq = 0;

wss.on('connection', (ws) => {
  const id = ++seq;
  ws.isAlive = true;
  console.log(`[+] client #${id} connected, total: ${wss.clients.size}`);

  // 收到协议层 pong 帧 → 标记连接存活
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      // 非 JSON 文本：原样回显
      ws.send(`[echo] ${raw}`);
      return;
    }

    switch (msg.type) {
      // 应用层心跳：返回 pong 消息
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', time: Date.now() }));
        break;
      // 模拟服务端主动断线（配合 /websocket/heartbeat 重连演示）
      case 'kick':
        console.log(`[-] client #${id} kicked`);
        ws.close();
        break;
      // 广播：发给除自己外的所有连接
      case 'broadcast':
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'broadcast', from: id, data: msg.data }));
          }
        });
        ws.send(JSON.stringify({ type: 'broadcast-sent', count: wss.clients.size - 1 }));
        break;
      // 默认：echo 回显
      default:
        ws.send(JSON.stringify({ type: 'echo', data: msg.data, time: Date.now() }));
    }
  });

  ws.on('close', () => {
    console.log(`[-] client #${id} closed, total: ${wss.clients.size}`);
  });

  ws.on('error', (err) => {
    console.error(`[!] client #${id} error: ${err.message}`);
  });
});

// 服务端心跳：每 30s 用协议层 ping 帧检测，一轮未响应 pong 则 terminate
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);
