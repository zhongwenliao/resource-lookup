<template>
  <demo-page
    title="前端渲染 Markdown 文件"
    description="技术文档直接用 MD 编写、前端渲染成页面，是组件库文档站（VitePress、Element 文档）的通用做法。核心链路：拿到 MD 原文（构建期收集 or 运行时 fetch）→ markdown-it 转 HTML → v-html 挂载。本页演示两种加载方式与安全配置。">
    <demo-block
      :index="1"
      title="构建期收集：import.meta.glob + ?raw"
      description="src/views/markdown/docs/ 下的 MD 文件在构建期以字符串形式打进 bundle，切换文档零网络请求。往该目录加 .md 文件，下方列表自动出现新条目。"
      code="const files = import.meta.glob('./docs/*.md', { eager: true, query: '?raw', import: 'default' });
// files: { './docs/getting-started.md': '# Markdown 文档示例...', ... }
const docList = Object.keys(files).map(path => ({
  name: path.replace(/(\.\/docs\/|\.md)/g, ''),
  content: files[path]
}));">
      <div class="md-layout">
        <ul class="md-menu">
          <li
            v-for="doc in docList"
            :key="doc.name"
            :class="{ active: doc.name === currentDoc }"
            @click="currentDoc = doc.name">
            {{ doc.name }}
          </li>
        </ul>
        <div class="md-view" v-html="currentDocHtml"></div>
      </div>
      <p class="demo-tip">当前文档：{{ currentDoc }}.md（共 {{ docList.length }} 份，构建期已收集）</p>
    </demo-block>

    <demo-block
      :index="2"
      title="运行时加载：fetch public 下的 MD"
      description="文档不放代码仓库而是放 public/（或后端接口），点击时才发起网络请求。适合文档由非开发角色维护、或文档体积大不想拖慢首屏的场景。"
      code="async function loadDoc (url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status);
  return res.text();          // 拿到 MD 原文
}

// 渲染（与构建期收集共用同一个 md 实例）
this.fetchedHtml = md.render(await loadDoc('/docs/runtime-fetch.md'));">
      <el-button type="primary" size="small" :loading="fetching" @click="loadRemoteDoc">
        {{ fetchedHtml ? '重新加载' : '加载 public/docs/runtime-fetch.md' }}
      </el-button>
      <el-alert
        v-if="fetchError"
        class="fetch-error"
        :title="'加载失败：' + fetchError"
        type="error"
        :closable="false">
      </el-alert>
      <div v-if="fetchedHtml" class="md-view fetched" v-html="fetchedHtml"></div>
      <p class="demo-tip">打开 DevTools → Network，点击按钮可看到对 runtime-fetch.md 的请求</p>
    </demo-block>

    <demo-block
      :index="3"
      title="安全与渲染细节"
      description="v-html 是 XSS 高危入口，渲染不可信内容时的底线配置：">
      <ul class="point-list">
        <li><b>html: false</b> —— markdown-it 默认值，MD 里的 HTML 标签会被转义成文本展示而非解析，&lt;script&gt; 无法注入</li>
        <li><b>linkify: true</b> —— 自动把裸 URL 转成 a 标签，且只放行安全协议（javascript: 伪协议被过滤）</li>
        <li><b>确需渲染 HTML</b> —— 只对可信内容开启，不可信内容必须先过 DOMPurify 白名单过滤</li>
        <li><b>代码高亮</b> —— markdown-it 的 highlight 配置项接入 highlight.js / shiki，本页未引入故代码块为等宽纯文本</li>
        <li><b>样式隔离</b> —— v-html 内容不受 scoped 样式影响，需用深度选择器（::v-deep）或独立全局样式</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import MarkdownIt from 'markdown-it';
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 技术点：import.meta.glob + ?raw —— 构建期把 MD 文件读成字符串打进 bundle
// query: '?raw' 让 Vite 返回文件原文而非编译产物，import: 'default' 直接取字符串
const files = import.meta.glob('./docs/*.md', { eager: true, query: '?raw', import: 'default' });

const docList = Object.keys(files).map(path => ({
  name: path.replace(/(\.\/docs\/|\.md)/g, ''),
  content: files[path]
}));

// 单例复用：渲染器只需创建一次
const md = new MarkdownIt({
  html: false, // 安全底线：MD 内的 HTML 标签转义为文本
  linkify: true // 裸 URL 自动转链接
});

export default {
  name: 'MarkdownView',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      currentDoc: docList.length ? docList[0].name : '',
      fetchedHtml: '',
      fetching: false,
      fetchError: ''
    };
  },
  computed: {
    currentDocHtml () {
      const doc = docList.find(d => d.name === this.currentDoc);
      return doc ? md.render(doc.content) : '';
    }
  },
  methods: {
    // 技术点：运行时 fetch 加载 MD —— 文档独立于 bundle，可单独更新
    async loadRemoteDoc () {
      this.fetching = true;
      this.fetchError = '';
      try {
        const res = await fetch('/docs/runtime-fetch.md');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        this.fetchedHtml = md.render(await res.text());
      } catch (e) {
        this.fetchError = e.message;
      } finally {
        this.fetching = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.md-layout {
  display: flex;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.md-menu {
  width: 160px;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  border-right: 1px solid #e8e8e8;
  background: #fafafa;
  flex-shrink: 0;

  li {
    padding: 8px 16px;
    font-size: 13px;
    color: #555;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: #1890ff;
    }

    &.active {
      color: #1890ff;
      background: #e6f7ff;
      border-right: 2px solid #1890ff;
    }
  }
}

.md-view {
  flex: 1;
  min-width: 0;
  padding: 16px 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  max-height: 480px;
  overflow-y: auto;

  &.fetched {
    margin-top: 16px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
  }
}

.fetch-error {
  margin-top: 12px;
}

.demo-tip {
  margin: 10px 0 0;
  font-size: 13px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}

// 深度选择器：v-html 内容不受 scoped 限制，需 ::v-deep 穿透
.md-view ::v-deep {
  h1 {
    margin: 0 0 16px;
    font-size: 22px;
    font-weight: 600;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }

  h2 {
    margin: 24px 0 12px;
    font-size: 18px;
    font-weight: 600;
  }

  h3 {
    margin: 20px 0 8px;
    font-size: 15px;
    font-weight: 600;
  }

  p {
    margin: 8px 0;
  }

  a {
    color: #1890ff;
  }

  code {
    padding: 2px 6px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 13px;
    color: #c7254e;
  }

  pre {
    padding: 12px 16px;
    background: #f6f8fa;
    border-radius: 4px;
    overflow-x: auto;

    code {
      padding: 0;
      background: none;
      color: #333;
    }
  }

  blockquote {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid #1890ff;
    background: #f0f7ff;
    color: #555;

    p {
      margin: 4px 0;
    }
  }

  table {
    border-collapse: collapse;
    margin: 12px 0;
    width: 100%;

    th,
    td {
      border: 1px solid #e8e8e8;
      padding: 8px 12px;
      font-size: 13px;
      text-align: left;
    }

    th {
      background: #fafafa;
      font-weight: 600;
    }
  }

  ul,
  ol {
    padding-left: 24px;
  }

  hr {
    border: none;
    border-top: 1px solid #eee;
    margin: 20px 0;
  }
}
</style>
