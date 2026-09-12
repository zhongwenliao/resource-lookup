<template>
  <demo-page
    title="PWA 与 Service Worker"
    description="渐进式 Web App 三大件：Service Worker（可编程网络代理）+ Cache API（请求级缓存）+ manifest（安装化元信息）。本页配套手写 SW（static/sw.js），注册后可实测三种缓存策略、离线兜底与消息通知。注意：SW 仅在 https 或 localhost 下可用。">
    <demo-block
      :index="1"
      title="Service Worker 注册与生命周期"
      description="SW 是独立于页面的后台脚本，生命周期：install（预缓存）→ waiting（旧 SW 仍控制页面）→ activate（清旧缓存、接管页面）。演示用 skipWaiting + clients.claim 立即生效，生产环境应让用户确认后再切换。"
      :code="codeRegister">
      <div class="toolbar">
        <el-button
          type="primary"
          :disabled="swBusy || swState.indexOf('activated') === 0"
          @click="registerSW">
          注册 Service Worker
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="swState.indexOf('activated') !== 0"
          @click="unregisterSW">
          注销
        </el-button>
        <el-tag v-if="swState.indexOf('activated') === 0" type="success">SW 已激活</el-tag>
      </div>
      <div class="state-panel">
        <p><span class="label">状态：</span>{{ swState }}</p>
        <p v-if="swScope"><span class="label">作用域：</span><code>{{ swScope }}</code></p>
        <p class="hint">注册成功后，下方缓存策略实验才会出现 sw-cache / sw-network 来源标记</p>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="三种缓存策略实测"
      description="同一份资源，三种取法：Cache First 命中即回（第二次起全走缓存）；Network First 网络优先、断网回退缓存；SWR 先回缓存、后台静默更新。SW 给每个响应打上 X-Served-By 头标记来源。"
      :code="codePolicy">
      <div class="toolbar">
        <el-button :disabled="testing" @click="testPolicy('cache-first.json', 'Cache First')">
          Cache First
        </el-button>
        <el-button :disabled="testing" @click="testPolicy('network-first.json', 'Network First')">
          Network First
        </el-button>
        <el-button :disabled="testing" @click="testPolicy('swr.json', 'SWR')">
          Stale-While-Revalidate
        </el-button>
        <el-button type="warning" plain @click="clearCache">清空演示缓存</el-button>
      </div>
      <div v-if="results.length" class="result-table">
        <div class="row head">
          <span>策略</span><span>来源</span><span>耗时</span><span>时间</span>
        </div>
        <div v-for="(r, i) in results" :key="i" class="row">
          <span>{{ r.policy }}</span>
          <span>
            <el-tag
              size="mini"
              :type="r.source.indexOf('cache') > -1 ? 'success' : (r.source.indexOf('offline') > -1 ? 'danger' : 'primary')">
              {{ r.source }}
            </el-tag>
          </span>
          <span>{{ r.cost }}</span>
          <span>{{ r.time }}</span>
        </div>
      </div>
      <p v-else class="empty-tip">点击按钮发起请求，观察来源与耗时的变化</p>
      <div class="playbook">
        <p><b>玩法：</b>同一按钮连点两次 → Cache First 第二次变 sw-cache；</p>
        <p>断网（DevTools Network → Offline）后点 Network First → 变 sw-cache-offline 兜底；</p>
        <p>点 SWR 后立刻再点 → 第二次仍是缓存，但后台已静默换上新数据。</p>
      </div>
    </demo-block>

    <demo-block
      :index="3"
      title="网络状态感知"
      description="navigator.onLine 与 online/offline 事件提供全局断网感知，配合 Network First 策略即可实现离线兜底体验。"
      :code="codeOnline">
      <div class="net-state">
        <el-tag :type="online ? 'success' : 'danger'" size="medium">
          {{ online ? '在线 navigator.onLine = true' : '离线 navigator.onLine = false' }}
        </el-tag>
        <span class="hint">试试 DevTools → Network → Offline，状态会实时切换</span>
      </div>
    </demo-block>

    <demo-block
      :index="4"
      title="manifest 与添加到主屏"
      description="manifest.json 声明应用名、图标、主题色与启动方式，配合 SW 即满足「安装到桌面/主屏」条件。index.html 已通过 link rel=manifest 关联。"
      :code="codeManifest">
      <template v-if="manifestData">
        <div class="manifest-panel">
          <p v-for="(v, k) in manifestFields" :key="k">
            <span class="label">{{ k }}：</span>{{ v }}
          </p>
        </div>
        <div class="toolbar">
          <el-button
            v-if="canInstall"
            type="primary"
            @click="installApp">
            安装应用（beforeinstallprompt 已捕获）
          </el-button>
          <span v-else class="hint">浏览器未触发 beforeinstallprompt（可能已安装或条件不满足），事件监听已就绪</span>
        </div>
      </template>
      <p v-else class="empty-tip">manifest 加载中…</p>
    </demo-block>

    <demo-block
      :index="5"
      title="消息通知"
      description="Notification API 需用户授权；通过 SW registration.showNotification 发出的通知即使页面关闭也能展示，点击通知可聚焦窗口（notificationclick）。"
      :code="codeNotify">
      <div class="toolbar">
        <el-button
          type="primary"
          :disabled="notifPerm === 'granted' || notifPerm === 'unsupported'"
          @click="askPermission">
          请求通知权限
        </el-button>
        <el-button
          type="success"
          :disabled="notifPerm !== 'granted'"
          @click="sendNotification">
          发送一条通知
        </el-button>
        <el-tag :type="notifPerm === 'granted' ? 'success' : 'info'">当前权限：{{ notifPerm }}</el-tag>
      </div>
    </demo-block>

    <demo-block
      :index="6"
      title="技术点速记"
      description="PWA 核心取舍与常见坑：">
      <ul class="point-list">
        <li><b>SW 是代理</b>：注册后同源请求都先过 fetch 事件，respondWith 决定回缓存还是回网络</li>
        <li><b>作用域</b>：默认取 SW 文件所在路径；要控制整站需 Service-Worker-Allowed 头（本项目 devServer 已配）</li>
        <li><b>双生命周期</b>：页面刷新不会重启 SW；版本更新靠字节对比触发 install，旧 SW 控制期间新 SW 停在 waiting</li>
        <li><b>缓存版本化</b>：缓存名带版本（pwa-demo-v1），activate 时删除旧名缓存，避免无限膨胀</li>
        <li><b>策略选型</b>：静态资源 Cache First、时效数据 Network First、折中场景 SWR；生产可直接用 Workbox</li>
        <li><b>调试</b>：DevTools → Application → Service Workers / Cache Storage；改动 sw.js 后勾选 Update on reload 最省事</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'PwaDemo',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      swState: '未注册',
      swScope: '',
      swBusy: false,
      results: [],
      testing: false,
      online: navigator.onLine,
      manifestData: null,
      canInstall: false,
      notifPerm: ('Notification' in window) ? Notification.permission : 'unsupported',
      codeRegister: "navigator.serviceWorker.register('/sw.js')\n  .then((reg) => {\n    reg.installing // 安装中：执行 install 预缓存\n    reg.waiting    // 等待中：旧 SW 仍控制页面\n    reg.active     // 已激活：开始拦截 fetch\n  })\n// sw.js 位于站点根目录时默认作用域即 '/'；\n// 部署在子目录且要扩大作用域时，需服务器返回 Service-Worker-Allowed 头",
      codePolicy: [
        '// Cache First：命中即回，适合版本化静态资源',
        'const cached = await caches.match(key)',
        'if (cached) return cached',
        'const resp = await fetch(request)',
        'cache.put(key, resp.clone())',
        '',
        '// Network First：网络优先，失败回退缓存',
        'try {',
        '  const resp = await fetch(request)',
        '  cache.put(key, resp.clone())',
        '  return resp',
        '} catch (e) {',
        '  return caches.match(key)',
        '}',
        '',
        '// Stale-While-Revalidate：先回缓存，后台更新',
        'return cached || fetchAndUpdate()'
      ].join('\n'),
      codeOnline: "window.addEventListener('online', sync)\nwindow.addEventListener('offline', showOfflineTip)\n// navigator.onLine 只是布尔快照，事件驱动更可靠",
      codeManifest: '{\n  "name": "应用名",\n  "short_name": "桌面显示名",\n  "start_url": "/",\n  "display": "standalone",\n  "theme_color": "#1890ff",\n  "icons": [{ "src": "icon.png", "sizes": "192x192" }]\n}\n\n<!-- index.html 关联 -->\n<link rel="manifest" href="/manifest.json">',
      codeNotify: "// 1. 授权\nconst perm = await Notification.requestPermission()\n// 2. 经 SW 发出（页面关闭后仍可见）\nnavigator.serviceWorker.ready\n  .then((reg) => reg.showNotification('标题', { body: '内容' }))\n// 3. SW 内监听点击，聚焦窗口\nself.addEventListener('notificationclick', (e) => { ... })"
    };
  },
  computed: {
    manifestFields () {
      if (!this.manifestData) return {};
      const m = this.manifestData;
      return {
        name: m.name,
        short_name: m.short_name,
        start_url: m.start_url,
        display: m.display,
        theme_color: m.theme_color,
        icons: (m.icons || []).map((i) => i.sizes + ' ' + i.src).join('，')
      };
    }
  },
  created () {
    this.deferredPrompt = null; // beforeinstallprompt 事件对象，非响应式
    this.onOnline = () => { this.online = true; };
    this.onOffline = () => { this.online = false; };
    this.onInstallPrompt = (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall = true;
    };
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
    window.addEventListener('beforeinstallprompt', this.onInstallPrompt);
    this.loadManifest();
  },
  beforeDestroy () {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
    window.removeEventListener('beforeinstallprompt', this.onInstallPrompt);
  },
  methods: {
    registerSW () {
      if (!('serviceWorker' in navigator)) {
        this.swState = '当前浏览器不支持 Service Worker';
        return;
      }
      this.swBusy = true;
      this.swState = '注册中…';
      const onOk = (reg) => {
        this.swScope = reg.scope;
        this.trackState(reg);
        this.swBusy = false;
      };
      const onFail = (err) => {
        this.swState = '注册失败：' + err.message;
        this.swBusy = false;
      };
      // sw.js 位于站点根目录（public/），默认作用域即 '/'，可直接拦截页面请求；
      // 若部署在子目录且要扩大作用域，需服务器返回 Service-Worker-Allowed 头
      navigator.serviceWorker.register('/sw.js')
        .then(onOk)
        .catch(onFail);
    },
    trackState (reg) {
      const describe = () => {
        if (reg.active) return 'activated（' + reg.active.state + '）';
        if (reg.waiting) return 'waiting（等待旧 SW 释放控制权）';
        if (reg.installing) return 'installing（预缓存中）';
        return '已注册';
      };
      this.swState = describe();
      reg.addEventListener('updatefound', () => {
        const sw = reg.installing;
        if (!sw) return;
        this.swState = 'installing（发现新版本）';
        sw.addEventListener('statechange', () => {
          this.swState = describe();
        });
      });
    },
    unregisterSW () {
      navigator.serviceWorker.ready.then((reg) => reg.unregister()).then((ok) => {
        this.swState = ok ? '已注销（刷新页面后 SW 完全移除）' : '注销失败';
        if (ok) this.swScope = '';
      });
    },
    testPolicy (file, policy) {
      this.testing = true;
      const start = performance.now();
      // 加时间戳 query 防浏览器 HTTP 缓存干扰；SW 侧缓存 key 忽略 query
      fetch('/pwa-demo/' + file + '?t=' + Date.now())
        .then((resp) => Promise.all([resp.json(), resp.headers.get('X-Served-By')]))
        .then((pair) => {
          const cost = Math.round(performance.now() - start) + ' ms';
          this.results.unshift({
            policy,
            source: pair[1] || 'network（SW 未拦截）',
            cost,
            time: new Date().toTimeString().slice(0, 8)
          });
          if (this.results.length > 12) this.results.pop();
          this.testing = false;
        })
        .catch((err) => {
          this.results.unshift({
            policy,
            source: '请求失败：' + err.message,
            cost: '-',
            time: new Date().toTimeString().slice(0, 8)
          });
          this.testing = false;
        });
    },
    clearCache () {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
        this.results.unshift({ policy: '-', source: '已通知 SW 清空缓存', cost: '-', time: new Date().toTimeString().slice(0, 8) });
      } else {
        caches.delete('pwa-demo-v1');
        this.results.unshift({ policy: '-', source: '已直接清空缓存（SW 未接管）', cost: '-', time: new Date().toTimeString().slice(0, 8) });
      }
    },
    loadManifest () {
      fetch('/manifest.json')
        .then((r) => r.json())
        .then((data) => { this.manifestData = data; })
        .catch(() => { this.manifestData = null; });
    },
    installApp () {
      if (!this.deferredPrompt) return;
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then(() => {
        this.deferredPrompt = null;
        this.canInstall = false;
      });
    },
    askPermission () {
      Notification.requestPermission().then((p) => { this.notifPerm = p; });
    },
    sendNotification () {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification('PWA 演示通知', {
          body: '由 Service Worker 发出 · ' + new Date().toLocaleTimeString(),
          tag: 'pwa-demo'
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

  code {
    padding: 1px 6px;
    background: #f0f0f0;
    border-radius: 3px;
    font-size: 12px;
  }
}

.hint {
  font-size: 12px;
  color: #999;
}

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

    span {
      flex: 1;

      &:first-child {
        flex: 0 0 130px;
      }
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

.net-state {
  display: flex;
  align-items: center;
  gap: 12px;
}

.manifest-panel {
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  margin-bottom: 14px;

  p {
    margin: 4px 0;
  }

  .label {
    color: #888;
  }
}

.empty-tip {
  font-size: 13px;
  color: #bbb;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
