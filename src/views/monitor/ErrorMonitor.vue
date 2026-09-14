<template>
  <demo-page
    title="前端错误监控：捕获与上报"
    description="用户不会主动报 bug，线上问题要靠监控兜底。本页演示四大错误入口（同步错误 / Promise / 资源 / 接口）的全局捕获，以及上报的关键设计（采样、去重、sendBeacon）。">
    <demo-block
      :index="1"
      title="四大错误入口实测"
      description="本页已在 created 时挂好全局监听，点击按钮触发对应错误，观察日志区的捕获结果："
      code="// 1. 同步 JS 错误（含 Vue 组件渲染错误）
window.onerror = (msg, url, line, col, err) => report({ type: 'js', msg, stack: err && err.stack });

// 2. 未捕获的 Promise reject（含 async/await 抛错）
window.addEventListener('unhandledrejection', e => report({ type: 'promise', reason: e.reason }));

// 3. 资源加载失败（img/script/css）—— 冒泡到 window 上捕获
window.addEventListener('error', e => {
  if (e.target && (e.target.src || e.target.href)) {
    report({ type: 'resource', url: e.target.src || e.target.href });
  }
}, true); // 技术点：资源错误不冒泡，必须用捕获阶段

// 4. 接口错误 —— 劫持 XMLHttpRequest / fetch 统一包装">
      <div class="demo-row">
        <el-button size="small" type="danger" @click="throwSync">同步错误</el-button>
        <el-button size="small" type="danger" @click="throwPromise">Promise reject</el-button>
        <el-button size="small" type="danger" @click="throwAsync">async/await 抛错</el-button>
        <el-button size="small" type="danger" @click="loadBadImage">加载不存在的图片</el-button>
        <el-button size="small" @click="logs = []">清空日志</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in logs" :key="i" :class="log.type">
          <span class="log-tag">{{ log.tag }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!logs.length" class="empty">（点击上方按钮触发错误，观察捕获链路）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="Vue 专属入口"
      description="Vue 2 的错误处理链路：">
      <ul class="point-list">
        <li><b>Vue.config.errorHandler</b> —— 捕获组件内同步错误（渲染 / 生命周期 / methods / watcher 回调），拿到完整组件链 vm；不设置时错误会冒泡到 window.onerror</li>
        <li><b>errorCaptured 钩子</b> —— 父组件捕获后代组件错误，返回 false 可阻止继续传播；适合做局部错误边界（局部降级 UI）</li>
        <li><b>渲染错误会销毁组件</b> —— 渲染函数抛错若无人处理，整个组件树可能白屏；errorHandler 里上报 + errorCaptured 里降级是标配</li>
        <li><b>事件回调错误</b> —— @click 里的同步错误走 errorHandler；异步代码（setTimeout 内抛错）不经过 Vue，最终由 window.onerror 兜底</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="上报设计与生产要点"
      description="捕获只是第一步，上报的设计决定监控成本与质量：">
      <ul class="point-list">
        <li><b>sendBeacon 优先</b> —— 页面卸载时（关闭 / 跳转）普通 XHR 会被浏览器取消；navigator.sendBeacon(url, data) 异步不阻塞、不取消，unload 场景唯一可靠方案</li>
        <li><b>采样与配额</b> —— 高频错误按 1%~10% 采样；客户端限流（如每分钟最多 N 条），防止雪崩式上报打挂收集服务</li>
        <li><b>去重聚合</b> —— 相同错误（message + stack 首行）本地 Set 去重；服务端按指纹聚合，避免一个 bug 刷出十万条记录</li>
        <li><b>SourceMap 还原</b> —— 构建时上传 map 到监控平台（不部署到线上），报错 stack 的行列号反解出源码位置；Vite 配 build.sourcemap: 'hidden'</li>
        <li><b>跨域脚本要 crossorigin</b> —— 第三方 script 加 crossorigin="anonymous" + 服务端 CORS 头，否则拿到的只有 "Script error."，什么信息都没有</li>
        <li><b>现成方案</b> —— Sentry（开源可自建）、Fundebug、阿里 ARMS；自研则参考其 SDK 的面包屑（用户操作轨迹）设计</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'ErrorMonitor',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      logs: []
    };
  },
  created () {
    // 技术点：全局监听要在错误发生前挂好 —— 本演示页挂载即生效
    // 真实项目应放 main.js 最顶部，先于业务代码执行
    this._handlers = {
      // 1. 未捕获 Promise reject
      unhandledrejection: (e) => {
        this.log('promise', 'unhandledrejection', String((e.reason && e.reason.message) || e.reason));
      },
      // 2. 资源加载失败（捕获阶段）
      resourceError: (e) => {
        const target = e.target;
        if (target && target !== window && (target.src || target.href)) {
          this.log('resource', 'error(capture)', `资源加载失败：${(target.src || target.href).slice(0, 80)}`);
        }
      }
    };
    window.addEventListener('unhandledrejection', this._handlers.unhandledrejection);
    window.addEventListener('error', this._handlers.resourceError, true);
  },
  beforeDestroy () {
    // 销毁时移除全局监听，避免污染其他页面
    window.removeEventListener('unhandledrejection', this._handlers.unhandledrejection);
    window.removeEventListener('error', this._handlers.resourceError, true);
  },
  methods: {
    log (type, tag, text) {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      this.logs.unshift({ time, type, tag, text });
      if (this.logs.length > 30) {
        this.logs.pop();
      }
    },
    throwSync () {
      // 同步错误：走 window.onerror（本页未劫持 onerror，浏览器控制台可见）
      // 这里手动演示捕获链路
      try {
        JSON.parse('{invalid json}');
      } catch (e) {
        this.log('js', 'try/catch', `捕获同步错误：${e.message}`);
      }
      // 真正未捕获的同步错误（取消注释验证 window.onerror）：
      // throw new Error('未捕获的同步错误')
    },
    throwPromise () {
      // 未 catch 的 reject → unhandledrejection
      Promise.reject(new Error('Promise 被 reject 且无人 catch'));
    },
    throwAsync () {
      // async 函数内抛错 = Promise reject，同样走 unhandledrejection
      const boom = async () => {
        throw new Error('async/await 内抛出的错误');
      };
      boom();
    },
    loadBadImage () {
      // 资源错误不冒泡，靠 window 捕获阶段的 error 监听
      const img = new Image();
      img.src = '/not-exist-' + Date.now() + '.png';
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.msg-log {
  margin: 0;
  padding: 12px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  max-height: 260px;
  overflow-y: auto;
  font-size: 13px;

  li {
    display: flex;
    gap: 10px;
    line-height: 1.9;
  }

  .log-tag {
    flex-shrink: 0;
    padding: 0 8px;
    border-radius: 2px;
    font-size: 12px;
    color: #fff;
    background: #999;
  }

  .js .log-tag { background: #f5222d; }
  .promise .log-tag { background: #fa8c16; }
  .resource .log-tag { background: #722ed1; }

  .log-text {
    color: #555;
    word-break: break-all;
  }

  .empty {
    color: #bbb;
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
