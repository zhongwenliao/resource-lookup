<template>
  <demo-page
    title="心跳保活与断线重连"
    description="生产环境 WebSocket 必备两件事：心跳（检测半开连接、防止中间设备掐空闲连接）与重连（指数退避）。本页封装 ReconnectingWebSocket 类，配合本地服务的 kick 指令模拟服务端断线。">
    <demo-block
      :index="1"
      title="ReconnectingWebSocket 实战"
      description="连接后每 5s 发一次应用层 ping（服务端回 pong）；点「模拟服务端断线」触发 kick，观察指数退避重连日志（1s → 2s → 4s…，连上后归零）。"
      code="class ReconnectingWebSocket {
  scheduleReconnect () {
    // 指数退避：1s → 2s → 4s → 8s，封顶 maxDelay
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.retry),
      this.maxDelay
    );
    this.retry += 1;
    this.timer = setTimeout(() => this.connect(), delay);
  }

  startHeartbeat () {
    this.hbTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }
}">
      <div class="conn-bar">
        <el-button size="small" type="primary" @click="connect">连接</el-button>
        <el-button size="small" @click="kick" :disabled="!connected">模拟服务端断线（kick）</el-button>
        <el-button size="small" @click="disconnect" :disabled="!client">手动断开（不重连）</el-button>
        <span class="state-badge" :class="connected ? 'open' : 'closed'">
          {{ connected ? '已连接' : '未连接' }}
        </span>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（点击连接，观察心跳与重连日志）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="为什么必须心跳"
      description="没有心跳的连接是「薛定谔的连接」：">
      <ul class="point-list">
        <li><b>半开连接</b> —— 网线拔了/手机切网，TCP 不知道对端已消失，双方都以为连接还在，消息发出去石沉大海</li>
        <li><b>中间设备掐空闲连接</b> —— Nginx（proxy_read_timeout 默认 60s）、企业防火墙、运营商 NAT 会静默丢弃长时间无数据的连接</li>
        <li><b>两层心跳</b> —— 协议层 ping/pong 帧（服务端检测死连接用，浏览器发不了）；应用层 ping 消息（浏览器侧保活 + 往返 RTT 测量）</li>
        <li><b>pong 超时判定</b> —— 发出 ping 后 N 秒没收到 pong，主动 close 走重连，不要干等 TCP 超时（可能长达十几分钟）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="重连策略要点"
      description="直接 while 循环硬重连是事故源头：">
      <ul class="point-list">
        <li><b>指数退避 + 抖动</b> —— delay = min(base * 2^n, max) + random(jitter)，避免服务端恢复瞬间被重连洪峰打死（惊群）</li>
        <li><b>手动关闭不重连</b> —— 用户主动断开要置 manualClosed 标志，onclose 里判断后跳过重连</li>
        <li><b>重连后状态恢复</b> —— 重新订阅、补拉断线期间错过的数据（一般配合消息序号或时间戳增量拉取）</li>
        <li><b>页面可见性</b> —— 切后台的 tab 可暂停心跳，回前台立即 ping 一次并检查连接健康度</li>
        <li><b>销毁清理</b> —— 组件销毁时 clear 定时器 + close 连接，否则僵尸连接和定时器会泄漏</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

/**
 * 技术点：带心跳与指数退避重连的 WebSocket 封装
 * 职责边界：只管「连接活着」，业务消息通过 handlers 回调上抛
 */
class ReconnectingWebSocket {
  constructor (url, handlers = {}, opts = {}) {
    this.url = url;
    this.handlers = handlers;
    this.baseDelay = opts.baseDelay || 1000;
    this.maxDelay = opts.maxDelay || 8000;
    this.heartbeatInterval = opts.heartbeatInterval || 5000;
    this.retry = 0;
    this.manualClosed = false;
    this.hbTimer = null;
    this.reconnectTimer = null;
    this.ws = null;
    this.connect();
  }

  connect () {
    this.log(`连接中（第 ${this.retry + 1} 次尝试）…`, 'sys');
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      this.retry = 0; // 连上后重连计数归零
      this.log('连接成功，启动心跳（每 5s 一次 ping）', 'ok');
      this.startHeartbeat();
      this.handlers.onOpen && this.handlers.onOpen();
    };

    ws.onmessage = (e) => {
      let msg;
      try {
        msg = JSON.parse(e.data);
      } catch (err) {
        msg = { type: 'raw', data: e.data };
      }
      if (msg.type === 'pong') {
        this.log('收到 pong（往返正常）', 'hb');
      }
      this.handlers.onMessage && this.handlers.onMessage(msg);
    };

    ws.onclose = (e) => {
      this.stopHeartbeat();
      this.log(`连接关闭 code=${e.code}`, e.wasClean ? 'sys' : 'err');
      this.handlers.onClose && this.handlers.onClose(e);
      // 技术点：手动关闭不重连
      if (!this.manualClosed) {
        this.scheduleReconnect();
      }
    };
  }

  startHeartbeat () {
    this.hbTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }

  stopHeartbeat () {
    clearInterval(this.hbTimer);
  }

  scheduleReconnect () {
    // 技术点：指数退避，封顶 maxDelay
    const delay = Math.min(this.baseDelay * Math.pow(2, this.retry), this.maxDelay);
    this.retry += 1;
    this.log(`${delay}ms 后发起第 ${this.retry} 次重连（指数退避）`, 'warn');
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  // 让服务端主动断开本连接（模拟服务端宕机/踢人）
  kick () {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'kick' }));
    }
  }

  close () {
    this.manualClosed = true;
    this.stopHeartbeat();
    clearTimeout(this.reconnectTimer);
    if (this.ws) {
      this.ws.close();
    }
  }

  log (text, type) {
    this.handlers.onLog && this.handlers.onLog(text, type);
  }
}

export default {
  name: 'WebsocketHeartbeat',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      client: null,
      connected: false,
      logs: []
    };
  },
  methods: {
    connect () {
      this.disconnect();
      this.logs = [];
      this.client = new ReconnectingWebSocket(
        'ws://127.0.0.1:8081',
        {
          onOpen: () => {
            this.connected = true;
          },
          onClose: () => {
            this.connected = false;
          },
          onLog: (text, type) => {
            this.logs.unshift({ text, type, time: new Date().toLocaleTimeString() });
            if (this.logs.length > 60) {
              this.logs.pop();
            }
          }
        },
        { baseDelay: 1000, maxDelay: 8000, heartbeatInterval: 5000 }
      );
    },
    kick () {
      if (this.client) {
        this.client.kick();
      }
    },
    disconnect () {
      if (this.client) {
        this.client.close();
        this.client = null;
        this.connected = false;
      }
    }
  },
  beforeDestroy () {
    // 技术点：销毁时清理连接与定时器
    this.disconnect();
  }
};
</script>

<style lang="less" scoped>
.conn-bar {
  display: flex;
  align-items: center;

  .state-badge {
    margin-left: 12px;
    padding: 2px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;

    &.open {
      background: #f0f9eb;
      color: #67c23a;
      border: 1px solid #e1f3d8;
    }

    &.closed {
      background: #fef0f0;
      color: #f56c6c;
      border: 1px solid #fde2e2;
    }
  }
}

.msg-log {
  margin: 14px 0 0;
  padding: 12px 16px;
  max-height: 300px;
  overflow-y: auto;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.9;
  list-style: none;

  li {
    display: flex;
  }

  .log-time {
    flex-shrink: 0;
    width: 80px;
    color: #bbb;
  }

  .log-text {
    word-break: break-all;
    color: #555;
  }

  li.ok .log-text { color: #67c23a; }
  li.warn .log-text { color: #e6a23c; }
  li.err .log-text { color: #f56c6c; }
  li.hb .log-text { color: #909399; }
  li.sys .log-text { color: #909399; }

  .empty {
    color: #bbb;
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}
</style>
