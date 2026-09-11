<template>
  <demo-page
    title="WebSocket 基础"
    description="WebSocket 是全双工通信协议：一次 HTTP 握手升级后，服务端可主动推送，客户端可随时发送，没有 HTTP 的请求/响应配对限制。配套本地服务：npm run ws:server（端口 8081）。">
    <demo-block
      :index="1"
      title="连接管理：状态机"
      description="输入地址后点击连接，观察右上角 readyState 状态流转（CLOSED → CONNECTING → OPEN）。"
      code="const ws = new WebSocket('ws://localhost:8081');

ws.onopen    = () => { /* readyState: OPEN */ };
ws.onmessage = (e) => { /* e.data：文本或 Blob */ };
ws.onclose   = (e) => { /* e.code / e.reason / e.wasClean */ };
ws.onerror   = () => { /* 连接异常（不提供失败原因，看 onclose） */ };

ws.close(); // 主动关闭">
      <div class="conn-bar">
        <el-input v-model="url" size="small" class="url-input" placeholder="ws://localhost:8081"></el-input>
        <el-button size="small" type="primary" :disabled="status === 'OPEN'" @click="connect">
          {{ status === 'CONNECTING' ? '连接中…' : '连接' }}
        </el-button>
        <el-button size="small" :disabled="status !== 'OPEN'" @click="close">断开</el-button>
        <span class="state-badge" :class="status.toLowerCase()">{{ status }}</span>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="消息收发"
      description="服务端约定 { type, data } 的 JSON 协议：默认 echo 回显；发两条消息试试。注意 onmessage 的 e.data 只能是字符串或二进制，复杂结构要自己 JSON 序列化。"
      code="// 发送（文本帧）
ws.send(JSON.stringify({ type: 'chat', data: 'hello' }));

// 接收
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data); // { type: 'echo', data, time }
};">
      <div class="conn-bar">
        <el-input
          v-model="input"
          size="small"
          class="msg-input"
          placeholder="输入消息，服务端会 echo 回显"
          @keyup.enter.native="send"></el-input>
        <el-button size="small" type="primary" :disabled="status !== 'OPEN'" @click="send">发送</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i" :class="log.dir">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-dir">{{ dirText[log.dir] }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（连接后发一条消息试试）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="readyState 状态机速查"
      description="四个状态与流转：">
      <ul class="point-list">
        <li><b>0 CONNECTING</b> —— 正在握手（new WebSocket 之后）</li>
        <li><b>1 OPEN</b> —— 握手完成，可以 send / 收消息</li>
        <li><b>2 CLOSING</b> —— 正在执行 close 握手</li>
        <li><b>3 CLOSED</b> —— 已关闭（无论正常关闭还是异常掉线）</li>
      </ul>
      <p class="demo-tip">注意：send() 只能在 OPEN 状态调用，否则抛异常；重连逻辑要自己封装（见「心跳与断线重连」页）。</p>
    </demo-block>

    <demo-block
      :index="4"
      title="实时方案对比"
      description="WebSocket 不是唯一实时方案，选型看场景：">
      <el-table :data="compareRows" border size="small">
        <el-table-column prop="way" label="方案" width="130"></el-table-column>
        <el-table-column prop="direction" label="方向" width="150"></el-table-column>
        <el-table-column prop="cost" label="开销 / 特点"></el-table-column>
        <el-table-column prop="scene" label="典型场景" width="180"></el-table-column>
      </el-table>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

export default {
  name: 'WebsocketBasic',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      url: 'ws://127.0.0.1:8081',
      status: 'CLOSED',
      input: '',
      logs: [],
      ws: null,
      dirText: { out: '↑ 发送', in: '↓ 接收', err: '✖ 错误', sys: '● 系统' }
    };
  },
  computed: {
    compareRows () {
      return [{
        way: '短轮询',
        direction: '客户端拉',
        cost: '实现最简单；大量无效请求，实时性差',
        scene: '状态低频变化'
      }, {
        way: '长轮询',
        direction: '客户端拉',
        cost: '挂起请求等响应；服务端占连接，超时重发',
        scene: '兼容性要求高'
      }, {
        way: 'SSE',
        direction: '服务端推（单向）',
        cost: '基于 HTTP，自动重连，浏览器 EventSource 原生支持',
        scene: '行情推送、通知'
      }, {
        way: 'WebSocket',
        direction: '全双工',
        cost: '握手后帧传输，头部开销极小；需处理心跳/重连',
        scene: '聊天、协同编辑、游戏'
      }];
    }
  },
  methods: {
    connect () {
      // 旧连接先清理，避免多个实例并存
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
      }
      this.setStatus('CONNECTING');
      this.log('sys', `正在连接 ${this.url}`);
      const ws = new WebSocket(this.url);
      ws.onopen = () => {
        this.setStatus('OPEN');
        this.log('sys', '连接已建立（握手完成，协议升级为 WebSocket）');
      };
      ws.onmessage = (e) => {
        this.log('in', e.data);
      };
      ws.onerror = () => {
        this.log('err', '连接异常（服务未启动？先运行 npm run ws:server）');
      };
      ws.onclose = (e) => {
        this.setStatus('CLOSED');
        this.log('sys', `连接关闭 code=${e.code} wasClean=${e.wasClean}`);
      };
      this.ws = ws;
    },
    close () {
      if (this.ws) {
        this.ws.close();
      }
    },
    send () {
      if (!this.input) {
        return;
      }
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.$message.warning('请先建立连接');
        return;
      }
      this.ws.send(this.input);
      this.log('out', this.input);
      this.input = '';
    },
    setStatus (s) {
      this.status = s;
    },
    log (dir, text) {
      this.logs.unshift({ dir, text, time: new Date().toLocaleTimeString() });
      if (this.logs.length > 50) {
        this.logs.pop();
      }
    }
  },
  beforeDestroy () {
    // 技术点：组件销毁时关闭连接，防止内存泄漏与僵尸连接
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
    }
  }
};
</script>

<style lang="less" scoped>
.conn-bar {
  display: flex;
  align-items: center;

  .url-input {
    width: 260px;
    margin-right: 8px;
  }

  .msg-input {
    width: 360px;
    margin-right: 8px;
  }

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

    &.connecting {
      background: #fdf6ec;
      color: #e6a23c;
      border: 1px solid #faecd8;
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
  max-height: 260px;
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

  .log-dir {
    flex-shrink: 0;
    width: 70px;

    &.in { color: #67c23a; }
    &.out { color: #409eff; }
    &.err { color: #f56c6c; }
    &.sys { color: #999; }
  }

  .log-text {
    word-break: break-all;
    color: #555;
  }

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

.demo-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #999;
}
</style>
