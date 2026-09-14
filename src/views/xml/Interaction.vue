<template>
  <demo-page
    title="XML 与 HTML 交互"
    description="Ajax 的本义是 Asynchronous JavaScript + XML —— 在 JSON 一统天下之前，XML 才是前后端数据交换的主角。本页用可运行演示串起前端处理 XML 的核心链路：DOMParser 解析、XPath 查询、XSLT 转换渲染、JS 同步桥（MutationObserver + 自定义事件双向同步）、XHR/fetch 网络加载，看清 XML 与 HTML 这对同源兄弟的交互全链路。">
    <demo-block
      :index="1"
      title="XML 与 HTML —— 同源不同命的兄弟"
      description="都源自 SGML，性格却完全相反：">
      <ul class="point-list">
        <li><b>HTML 宽容，XML 严格</b> —— HTML 少写闭合标签浏览器照样渲染（容错是规范的一部分）；XML 一处不合法，整个文档直接 <b>parsererror</b> 拒绝解析，宁死不猜</li>
        <li><b>严格性四条</b> —— 标签必须闭合（<code>&lt;br/&gt;</code>）/ 标签大小写敏感（<code>&lt;Title&gt;</code> ≠ <code>&lt;title&gt;</code>）/ 属性值必须加引号 / 整个文档只能有一个根元素</li>
        <li><b>黄金时代</b> —— Ajax 本义就是「异步 JS + XML」；SOAP/WebService 是企业级接口标配；RSS/Atom 订阅生态全部构建在 XML 上</li>
        <li><b>JSON 为什么赢了</b> —— 体积更小、JS 原生字面量（<code>eval</code>/<code>JSON.parse</code> 零成本）、无标签冗余、解析更快</li>
        <li><b>XML 仍活跃的角落</b> —— SVG / MathML 本就是 XML 方言；DOCX / XLSX 本质是 zip + XML；sitemap.xml、Maven pom.xml、遗留 SOAP 系统（银行 / 电信 / 政务至今大量存在），前端依然要会接</li>
        <li><b>前端处理 XML 四大武器</b> —— DOMParser（字符串 → DOM）/ XMLSerializer（DOM → 字符串）/ XPath（精确查询）/ XSLTProcessor（声明式转 HTML），下面逐一演示</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="可运行演示① —— DOMParser 解析与 XMLSerializer 序列化"
      description="解析下方模拟 RSS 的 XML 字符串并遍历节点树；再故意解析一段坏 XML 看 parsererror；最后修改节点用 XMLSerializer 序列化回字符串："
      :code="codeParser">
      <div class="demo-row">
        <el-button type="primary" size="small" @click="parseRss">解析 RSS 并遍历</el-button>
        <el-button type="danger" size="small" @click="parseBroken">解析坏 XML（看严格性）</el-button>
        <el-button type="success" size="small" @click="serializeDemo">改节点后序列化回字符串</el-button>
        <el-button size="small" @click="parseInfo = ''; serialized = ''">清空</el-button>
      </div>
      <pre v-if="parseInfo" class="code-panel">{{ parseInfo }}</pre>
      <pre v-if="serialized" class="code-panel serialized">序列化结果：{{ serialized }}</pre>
    </demo-block>

    <demo-block
      :index="3"
      title="可运行演示② —— XPath 精确查询"
      description="在解析出的 RSS 文档上执行 XPath 表达式（document.evaluate），可改输入框自己试。XPath 同样适用于当前 HTML 文档（querySelector 的超级加强版）：">
      <div class="demo-row">
        <el-input v-model="xpathExpr" size="small" style="width: 340px" placeholder="XPath 表达式" @keyup.enter.native="runXpath" />
        <el-button type="primary" size="small" @click="runXpath">执行查询</el-button>
      </div>
      <div class="demo-row">
        <el-button v-for="p in xpathPresets" :key="p.expr" size="mini" plain @click="xpathExpr = p.expr; runXpath()">{{ p.label }}</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(hit, i) in xpathHits" :key="i" class="in">
          <span class="log-time">[{{ i + 1 }}]</span>
          <span class="log-text">{{ hit }}</span>
        </li>
        <li v-if="xpathError" class="warn">{{ xpathError }}</li>
        <li v-if="!xpathHits.length && !xpathError" class="empty">（点上方预设按钮或回车执行）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="4"
      title="可运行演示③ —— XSLT 声明式转换：XML 直接变 HTML"
      description="XSLTProcessor 是浏览器原生支持的转换引擎：给一份 XML 数据 + 一份 XSL 样式表，无需手写 JS 拼字符串，直接产出 HTML（含排序）："
      :code="booksXsl">
      <div class="demo-row">
        <el-button type="primary" size="small" @click="runXslt">执行 XSLT 转换（按价格降序）</el-button>
        <span class="hint">数据源：{{ bookCount }} 本书的 XML → 表格 HTML</span>
      </div>
      <div ref="xsltResult" class="xslt-result">
        <span class="empty">（点击按钮，transformToFragment 的产物会插入到这里）</span>
      </div>
    </demo-block>

    <demo-block
      :index="5"
      title="可运行演示⑤ —— JS 同步桥：MutationObserver + 自定义事件实现 XML ⇄ JS 双向同步"
      description="XML DOM 不只是数据静态载体——它与 HTML DOM 共享同一套事件与观察 API。本演示搭一座「双向桥」：左侧改 JS 表单 → 写入 XML 节点；右侧用 JS 直接改 XML（模拟外部数据到达）→ 自动同步回表单。桥的两根桥墩是 MutationObserver（微任务级感知节点变化）与 CustomEvent（XML 节点上也能分发事件）："
      :code="codeBridge">
      <div class="bridge-wrap">
        <div class="bridge-side">
          <div class="side-title">JS 侧（表单数据源）</div>
          <div class="form-row">
            <span class="form-label">标题</span>
            <el-input v-model="bridgeForm.title" size="small" @input="syncToXml('title')" />
          </div>
          <div class="form-row">
            <span class="form-label">分类</span>
            <el-select v-model="bridgeForm.category" size="small" @change="syncToXml('category')">
              <el-option v-for="c in ['浏览器原理', 'JS 核心', '工程化']" :key="c" :label="c" :value="c" />
            </el-select>
          </div>
          <div class="form-row">
            <span class="form-label">状态</span>
            <el-switch v-model="bridgeForm.published" active-text="已发布" @change="syncToXml('published')" />
          </div>
          <el-button type="warning" size="small" class="ext-btn" @click="mutateXmlExternally">
            模拟外部改 XML（服务端推送）→ 同步回表单
          </el-button>
        </div>
        <div class="bridge-arrow">⇄</div>
        <div class="bridge-side">
          <div class="side-title">XML 侧（实时序列化）</div>
          <pre class="code-panel bridge-xml">{{ bridgeXml }}</pre>
        </div>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in bridgeLogs" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!bridgeLogs.length" class="empty">（改左侧表单，或点「模拟外部改 XML」，观察桥的双向流动）</li>
      </ul>
      <ul class="point-list">
        <li><b>MutationObserver 是微任务</b> —— 回调在当前宏任务末尾批量触发（多次改动合并成一条 records 数组），比轮询/脏检查高效得多，Vue 的响应式更新调度同款思路</li>
        <li><b>XML 节点也能收发事件</b> —— <code>node.addEventListener / dispatchEvent</code> 对 XML 文档节点同样有效，CustomEvent + detail 可在「桥协议」里携带元信息（谁改的、改了什么）</li>
        <li><b>防循环回环</b> —— 双向同步的死穴是 A→B→A 死循环；桥内用 <code>isApplying</code> 标志位：由桥自身引发的变更不再回写对侧（真实框架如 Vue v-model 双向绑定同样要处理）</li>
        <li><b>characterData vs childList</b> —— 监听文本变化要 <code>characterData: true</code> 且 <code>characterDataOldValue</code> 拿旧值；<code>textContent</code> 整体替换走 childList（本演示的用法）</li>
        <li><b>断开时机</b> —— <code>observer.disconnect()</code> 必须在组件销毁时调用，否则 observer 持有 XML 节点引用导致内存泄漏</li>
      </ul>
    </demo-block>

    <demo-block
      :index="6"
      title="可运行演示⑥ —— 网络请求加载 XML：XHR 与 fetch 的正确姿势"
      description="真实请求 public/feed.xml（模拟 RSS 订阅源），对比 XMLHttpRequest.responseXML 与 fetch + DOMParser 两条路：">
      <div class="demo-row">
        <el-button type="primary" size="small" @click="loadByXhr">XMLHttpRequest 加载</el-button>
        <el-button type="success" size="small" @click="loadByFetch">fetch 加载</el-button>
        <el-button size="small" @click="feedItems = []; loadLog = []">清空</el-button>
      </div>
      <ul class="msg-log">
        <li v-for="(log, i) in loadLog" :key="i" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-text">{{ log.text }}</span>
        </li>
        <li v-if="!loadLog.length" class="empty">（加载日志）</li>
      </ul>
      <div v-if="feedItems.length" class="feed-list">
        <div v-for="item in feedItems" :key="item.title" class="feed-item">
          <div class="feed-head">
            <b>{{ item.title }}</b>
            <el-tag size="mini">{{ item.category }}</el-tag>
          </div>
          <div class="feed-meta">{{ item.pubDate }} · {{ item.link }}</div>
          <div class="feed-desc">{{ item.description }}</div>
        </div>
      </div>
      <ul class="point-list">
        <li><b>XHR 的名字就是历史</b> —— 设计初衷就是交换 XML：<code>xhr.responseType = 'document'</code> 后 <code>xhr.responseXML</code> 直接给解析好的 DOM</li>
        <li><b>responseXML 的坑</b> —— 响应 Content-Type 不是 <code>text/xml</code> / <code>application/xml</code> 时 responseXML 为 <b>null</b>；老接口返回 text/html 时用 <code>xhr.overrideMimeType('text/xml')</code> 强制纠正</li>
        <li><b>fetch 没有 responseXML</b> —— 只能 <code>res.text()</code> 拿字符串再 DOMParser 手动解析，这是迁移 fetch 最常踩的差异点</li>
        <li><b>SVG 就是 XML</b> —— inline SVG 字符串可直接 innerHTML 插入；DOMParser 解析 SVG 要用 <code>'image/svg+xml'</code>；<code>&lt;svg&gt;</code> 的 xmlns 命名空间不能省</li>
        <li><b>XHTML 的严格</b> —— 以 <code>application/xhtml+xml</code> 提供的页面遵循 XML 规则：一处标签错误直接白屏拒绝渲染，这是 XML 严格性对 HTML 世界的投影</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

export default {
  name: 'XmlInteraction',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      parseInfo: '',
      serialized: '',
      xpathExpr: "//item[category='浏览器原理']/title",
      xpathHits: [],
      xpathError: '',
      xpathPresets: [{
        label: '所有条目标题', expr: '//item/title'
      }, {
        label: '按分类过滤', expr: "//item[category='浏览器原理']/title"
      }, {
        label: '前 2 条', expr: '//item[position() <= 2]/title'
      }, {
        label: 'contains 条件', expr: "//item[contains(title, '模块')]/pubDate"
      }, {
        label: '合并查询', expr: '//channel/title | //channel/description'
      }],
      feedItems: [],
      loadLog: [],
      // 演示⑤：JS 同步桥
      bridgeForm: { title: '新增 JS 同步桥演示', category: 'JS 核心', published: true },
      bridgeLogs: [],
      bridgeXml: '',
      codeBridge: `// ---- 桥墩①：MutationObserver 监听 XML 节点变化（微任务级） ----
const observer = new MutationObserver((records) => {
  for (const r of records) {
    // childList：textContent 整体替换 / attributes：setAttribute
    console.log(r.type, r.target.nodeName, '旧值:', r.oldValue);
  }
  // 变化感知后：序列化 XML → 回写 JS 侧（防回环要先判断来源）
});
observer.observe(xmlDoc.documentElement, {
  childList: true, subtree: true, characterData: true,
  characterDataOldValue: true, attributes: true, attributeOldValue: true
});

// ---- 桥墩②：XML 节点上的自定义事件（桥协议带元信息） ----
xmlDoc.addEventListener('bridge:sync', (e) => {
  console.log('变更来源:', e.detail.source, '字段:', e.detail.field);
});

// ---- JS → XML：写节点即触发 observer ----
xmlDoc.querySelector('title').textContent = form.title; // observer 感知
// ---- XML → JS：外部改完派发事件，表单侧监听回写 ----
xmlDoc.dispatchEvent(new CustomEvent('bridge:sync', {
  detail: { source: 'server', field: 'title' }
}));`,
      // 演示②③共用的 RSS 数据源（与 public/feed.xml 结构一致）
      xmlRss: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>前端技术沉淀 · 更新日志</title>
    <description>resource-lookup 项目更新记录</description>
    <item>
      <title>新增 iframe 跨窗口通信模块</title>
      <category>浏览器原理</category>
      <pubDate>2026-09-14</pubDate>
    </item>
    <item>
      <title>新增浏览器进程与线程模块</title>
      <category>浏览器原理</category>
      <pubDate>2026-09-13</pubDate>
    </item>
    <item>
      <title>新增 JS 核心三页</title>
      <category>JS 核心</category>
      <pubDate>2026-09-12</pubDate>
    </item>
  </channel>
</rss>`,
      xmlBroken: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>坏掉的文档</title>
    <description>这个 item 标签没有闭合
  </channel>
</rss>`,
      codeParser: `// ---- 解析：字符串 → XML DOM ----
const parser = new DOMParser();
const doc = parser.parseFromString(xmlText, 'application/xml');

// XML 严格性：解析失败不抛异常，而是返回一个 <parsererror> 文档
const err = doc.querySelector('parsererror');
if (err) {
  console.error('XML 不合法：', err.textContent); // 带行列号的错误信息
}

// ---- 遍历：与 HTML DOM 同一套 API ----
const items = doc.querySelectorAll('item'); // CSS 选择器也能用
items.forEach((item) => {
  console.log(item.querySelector('title').textContent);
});

// ---- 序列化：DOM → 字符串 ----
doc.querySelector('title').textContent = '改个标题';
const xmlStr = new XMLSerializer().serializeToString(doc);`,
      // 演示④ XSLT 数据与样式表
      booksXml: `<?xml version="1.0" encoding="UTF-8"?>
<books>
  <book><name>JavaScript 高级程序设计</name><author>Matt Frisbie</author><price>129</price></book>
  <book><name>深入浅出 Vue.js</name><author>刘博文</author><price>79</price></book>
  <book><name>HTTP 权威指南</name><author>Gourley</author><price>139</price></book>
  <book><name>SVG 精髓</name><author>Eisenberg</author><price>59</price></book>
  <book><name>XSLT 程序设计</name><author>Michael Kay</author><price>109</price></book>
</books>`,
      booksXsl: `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <!-- 声明式模板：匹配根节点，产出完整表格骨架 -->
  <xsl:template match="/books">
    <table border="1" cellspacing="0" cellpadding="6">
      <tr style="background:#e6f7ff">
        <th>书名</th><th>作者</th><th>价格（元）</th>
      </tr>
      <!-- for-each 遍历 + sort 排序：一行模板生成 N 行数据 -->
      <xsl:for-each select="book">
        <xsl:sort select="price" data-type="number" order="descending"/>
        <tr>
          <td><xsl:value-of select="name"/></td>
          <td><xsl:value-of select="author"/></td>
          <td><xsl:value-of select="price"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>`
    };
  },
  computed: {
    bookCount () {
      return (this.booksXml.match(/<book>/g) || []).length;
    }
  },
  created () {
    // 演示⑤：桥的 XML 文档与 observer 都是非响应式实例属性（无需 Vue 追踪）
    this.bridgeDoc = new DOMParser().parseFromString(`<?xml version="1.0" encoding="UTF-8"?>
<item published="true">
  <title>新增 JS 同步桥演示</title>
  <category>JS 核心</category>
</item>`, 'application/xml');
    this.applyingFromXml = false; // 防回环标志位
  },
  mounted () {
    this.initBridge();
  },
  beforeDestroy () {
    // 技术点：observer 持有 XML 节点引用，不断开会内存泄漏
    if (this.bridgeObserver) this.bridgeObserver.disconnect();
    if (this.bridgeDoc) {
      this.bridgeDoc.removeEventListener('bridge:sync', this.onBridgeEvent);
    }
  },
  methods: {
    parseToDoc (text) {
      const doc = new DOMParser().parseFromString(text, 'application/xml');
      const err = doc.querySelector('parsererror');
      return { doc, err };
    },
    // 演示②：解析 + 遍历
    parseRss () {
      const { doc, err } = this.parseToDoc(this.xmlRss);
      if (err) {
        this.parseInfo = '解析失败：' + err.textContent;
        return;
      }
      const lines = [];
      lines.push(`根元素：<${doc.documentElement.nodeName}>（version=${doc.documentElement.getAttribute('version')}）`);
      lines.push(`频道标题：${doc.querySelector('channel > title').textContent}`);
      const items = doc.querySelectorAll('item');
      lines.push(`条目数：${items.length}（querySelectorAll 同样适用于 XML 文档）`);
      items.forEach((item, i) => {
        const title = item.querySelector('title').textContent;
        const cat = item.querySelector('category').textContent;
        const date = item.querySelector('pubDate').textContent;
        lines.push(`  [${i + 1}] ${title} · ${cat} · ${date}`);
      });
      this.parseInfo = lines.join('\n');
    },
    // 演示②：XML 严格性 —— 坏文档返回 parsererror 而不是抛异常
    parseBroken () {
      const { doc, err } = this.parseToDoc(this.xmlBroken);
      if (err) {
        // err.textContent 带行列号，是排查 XML 的第一手信息
        this.parseInfo = 'parsererror！XML 拒绝容错解析：\n' + err.textContent.split('\n').slice(0, 2).join('\n');
      } else {
        this.parseInfo = '竟然解析成功了？' + doc.documentElement.nodeName;
      }
    },
    // 演示②：改节点 + 序列化回字符串
    serializeDemo () {
      const { doc, err } = this.parseToDoc(this.xmlRss);
      if (err) {
        this.parseInfo = '解析失败';
        return;
      }
      // 技术点：setAttribute / textContent 与 HTML DOM 完全同一套 API
      doc.documentElement.setAttribute('updated', new Date().toISOString().slice(0, 10));
      doc.querySelector('channel > title').textContent = '标题已被 JS 修改';
      doc.querySelector('item > pubDate').textContent = '2026-09-14（已更新）';
      this.serialized = new XMLSerializer().serializeToString(doc).slice(0, 300) + '…';
    },
    // 演示③：XPath 查询
    runXpath () {
      this.xpathError = '';
      this.xpathHits = [];
      const { doc, err } = this.parseToDoc(this.xmlRss);
      if (err) {
        this.xpathError = '数据源解析失败';
        return;
      }
      try {
        // 技术点：document.evaluate —— XPath 的浏览器入口
        // resultType 用 SNAPSHOT：静态快照，遍历期间文档变化不影响结果
        const result = document.evaluate(
          this.xpathExpr, doc, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null
        );
        if (result.snapshotLength === 0) {
          this.xpathError = `表达式合法，但命中 0 个节点：${this.xpathExpr}`;
          return;
        }
        for (let i = 0; i < result.snapshotLength; i++) {
          const node = result.snapshotItem(i);
          // 命中的可能是元素也可能是属性（@attr），分别取值
          const value = node.nodeType === 2 ? node.value : node.textContent;
          this.xpathHits.push(`<${node.nodeName}> ${value}`);
        }
      } catch (e) {
        // 非法表达式直接抛 SyntaxError —— XPath 的严格性
        this.xpathError = `表达式非法：${e.message}`;
      }
    },
    // 演示④：XSLT 转换
    runXslt () {
      const { doc: xmlDoc, err: xmlErr } = this.parseToDoc(this.booksXml);
      const { doc: xslDoc, err: xslErr } = this.parseToDoc(this.booksXsl);
      if (xmlErr || xslErr) {
        this.$message.error('XML 或 XSL 数据解析失败');
        return;
      }
      // 技术点：XSLTProcessor 三步走 —— 导入样式表 → 转换 → 拿到 DocumentFragment
      const proc = new XSLTProcessor();
      proc.importStylesheet(xslDoc);
      // transformToFragment 直接产出可插入当前文档的节点片段
      const fragment = proc.transformToFragment(xmlDoc, document);
      const container = this.$refs.xsltResult;
      container.innerHTML = '';
      container.appendChild(fragment);
    },
    // ---------- 演示⑤：JS 同步桥 ----------
    blog (text, type) {
      const t = new Date();
      this.bridgeLogs.push({
        time: t.toTimeString().slice(0, 8) + '.' + ('00' + t.getMilliseconds()).slice(-3),
        text,
        type
      });
    },
    serializeBridge () {
      // 技术点：XMLSerializer 序列化时自闭合/引号风格由引擎决定，与手写可能不同
      this.bridgeXml = new XMLSerializer().serializeToString(this.bridgeDoc.documentElement);
    },
    initBridge () {
      // 桥墩①：MutationObserver —— 监听 XML 根节点下所有子树变化
      this.bridgeObserver = new MutationObserver((records) => {
        // 微任务批量回调：一次改动周期内的多条变更合并进 records
        records.forEach((r) => {
          if (r.type === 'childList') {
            // textContent 整体替换表现为 childList 移除旧文本节点 + 添加新文本节点
            this.blog(`[observer·childList] <${r.target.nodeName}> 文本变更：${r.target.textContent}`, 'in');
          } else if (r.type === 'attributes') {
            this.blog(`[observer·attributes] <${r.target.nodeName}> 属性 ${r.attributeName}：${r.oldValue} → ${r.target.getAttribute(r.attributeName)}`, 'in');
          }
        });
        this.serializeBridge();
        // 防回环：外部改 XML 引发的变更，把新值回写表单（程序赋值不触发 @input，天然无循环）
        if (this.applyingFromXml) {
          this.pullXmlToForm();
          this.applyingFromXml = false;
        }
      });
      this.bridgeObserver.observe(this.bridgeDoc.documentElement, {
        childList: true, // 子节点增删（textContent 替换走这条）
        subtree: true, // 深层节点也要
        characterData: true, // 文本内容变化
        characterDataOldValue: true,
        attributes: true, // 属性变化
        attributeOldValue: true
      });

      // 桥墩②：XML 文档节点上的自定义事件 —— 「桥协议」携带元信息
      this.bridgeDoc.addEventListener('bridge:sync', this.onBridgeEvent);
      this.serializeBridge();
      this.blog('同步桥已就绪：MutationObserver + CustomEvent 双桥墩', 'sys');
    },
    onBridgeEvent (e) {
      // e.detail 携带变更元信息：谁改的、改了哪个字段
      this.blog(`[CustomEvent·bridge:sync] 收到推送 —— 来源：${e.detail.source}，字段：${e.detail.field}`, 'out');
    },
    // JS → XML：表单改动写入 XML 节点，observer 自动感知
    syncToXml (field) {
      const root = this.bridgeDoc.documentElement;
      if (field === 'published') {
        // 布尔值演示属性通道：setAttribute
        root.setAttribute('published', String(this.bridgeForm.published));
      } else {
        root.querySelector(field).textContent = this.bridgeForm[field];
      }
      // 不手动刷新 XML 视图 —— observer 回调统一负责（单一出口）
    },
    // XML → JS：模拟服务端推送直接改 XML，事件 + observer 双通道同步回表单
    mutateXmlExternally () {
      const root = this.bridgeDoc.documentElement;
      const newTitle = '服务端推送 · ' + new Date().toTimeString().slice(0, 8);
      // 置防回环标志：observer 回调里据此回写表单
      this.applyingFromXml = true;
      root.querySelector('title').textContent = newTitle;
      root.querySelector('category').textContent = '工程化';
      root.setAttribute('published', 'false');
      // 桥协议：派发自定义事件通知「外部变更」的元信息
      this.bridgeDoc.dispatchEvent(new CustomEvent('bridge:sync', {
        detail: { source: 'server-push', field: 'title,category,published' }
      }));
    },
    // 把 XML 当前值拉回表单（程序赋值不触发 @input/@change，无回环风险）
    pullXmlToForm () {
      const root = this.bridgeDoc.documentElement;
      this.bridgeForm.title = root.querySelector('title').textContent;
      this.bridgeForm.category = root.querySelector('category').textContent;
      this.bridgeForm.published = root.getAttribute('published') !== 'false';
      this.blog('表单已按 XML 最新值回写（applyingFromXml 防回环）', 'sys');
    },
    log (text, type) {
      const t = new Date();
      this.loadLog.push({
        time: t.toTimeString().slice(0, 8) + '.' + ('00' + t.getMilliseconds()).slice(-3),
        text,
        type
      });
    },
    // 把 RSS DOM 提取为列表数据
    extractItems (doc) {
      return Array.from(doc.querySelectorAll('item')).map((item) => ({
        title: item.querySelector('title').textContent,
        link: item.querySelector('link').textContent,
        category: item.querySelector('category').textContent,
        pubDate: item.querySelector('pubDate').textContent,
        description: item.querySelector('description').textContent
      }));
    },
    // 演示⑤：XMLHttpRequest —— responseXML 直接给 DOM
    loadByXhr () {
      const start = performance.now();
      const xhr = new XMLHttpRequest();
      // 加时间戳防 HTTP 缓存；overrideMimeType 兜底：Content-Type 不对时 responseXML 会是 null
      xhr.open('GET', '/feed.xml?t=' + Date.now());
      xhr.overrideMimeType('text/xml');
      xhr.onload = () => {
        const cost = (performance.now() - start).toFixed(0);
        // 技术点：responseXML 是 XHR 的原生能力，无需手动解析
        const doc = xhr.responseXML;
        if (!doc || doc.querySelector('parsererror')) {
          this.log('responseXML 为空或解析失败（检查 Content-Type）', 'warn');
          return;
        }
        this.feedItems = this.extractItems(doc);
        this.log(`XHR 完成：status=${xhr.status}，responseXML 直接拿到 ${this.feedItems.length} 条（${cost}ms，零手动解析）`, 'in');
      };
      xhr.onerror = () => this.log('XHR 网络错误', 'warn');
      xhr.send();
      this.log('XHR 已发出：GET /feed.xml（responseXML 自动可用，无需手动解析）', 'out');
    },
    // 演示⑤：fetch —— 没有 responseXML，text() + DOMParser 手动解析
    async loadByFetch () {
      const start = performance.now();
      this.log('fetch 已发出：GET /feed.xml', 'out');
      try {
        const res = await fetch('/feed.xml?t=' + Date.now());
        // 技术点：fetch 响应没有 responseXML，只能先拿纯文本
        const text = await res.text();
        const { doc, err } = this.parseToDoc(text);
        if (err) {
          this.log('DOMParser 解析失败：' + err.textContent.slice(0, 60), 'warn');
          return;
        }
        this.feedItems = this.extractItems(doc);
        const cost = (performance.now() - start).toFixed(0);
        this.log(`fetch 完成：res.text() + DOMParser 手动解析出 ${this.feedItems.length} 条（${cost}ms，比 XHR 多一步）`, 'in');
      } catch (e) {
        this.log('fetch 失败：' + e.message, 'warn');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;

  .hint {
    font-size: 12px;
    color: #888;
  }
}

.bridge-wrap {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
  align-items: stretch;

  .bridge-side {
    flex: 1;
    min-width: 0;
    padding: 12px;
    border: 1px solid #b7eb8f;
    border-radius: 4px;
    background: #f6ffed;

    .side-title {
      font-size: 12px;
      color: #52c41a;
      margin-bottom: 10px;
    }
  }

  .bridge-arrow {
    align-self: center;
    font-size: 22px;
    color: #52c41a;
    flex-shrink: 0;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    .form-label {
      width: 36px;
      font-size: 13px;
      color: #555;
      flex-shrink: 0;
    }
  }

  .ext-btn {
    margin-top: 4px;
  }

  .bridge-xml {
    margin: 0;
    height: 100%;
    box-sizing: border-box;
    color: #1890ff;
  }
}

.code-panel {
  margin: 0;
  padding: 12px 14px;
  background: #fafafa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.9;
  color: #555;
  white-space: pre-wrap;
  word-break: break-all;

  &.serialized {
    margin-top: 10px;
    color: #52c41a;
  }
}

.msg-log {
  margin: 0 0 12px;
  padding: 12px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  max-height: 220px;
  overflow-y: auto;
  font-size: 13px;

  li {
    display: flex;
    gap: 10px;
    line-height: 1.9;
  }

  .log-time {
    color: #bbb;
    font-size: 12px;
    flex-shrink: 0;
  }

  .in { color: #1890ff; }
  .out { color: #52c41a; }
  .warn { color: #f5222d; }
  .empty { color: #bbb; }
}

.xslt-result {
  padding: 12px;
  border: 1px dashed #91d5ff;
  border-radius: 4px;
  background: #f0f9ff;
  overflow-x: auto;

  /deep/ table {
    border-collapse: collapse;
    font-size: 13px;
    background: #fff;

    th,
    td {
      border: 1px solid #d9d9d9;
      padding: 6px 14px;
      text-align: left;
    }

    th {
      background: #e6f7ff;
    }
  }

  .empty {
    font-size: 12px;
    color: #999;
  }
}

.feed-list {
  .feed-item {
    padding: 10px 12px;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    margin-bottom: 8px;

    .feed-head {
      display: flex;
      align-items: center;
      gap: 8px;

      b {
        font-size: 13px;
        color: #262626;
      }
    }

    .feed-meta {
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }

    .feed-desc {
      margin-top: 4px;
      font-size: 12px;
      line-height: 1.6;
      color: #666;
    }
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;

  code {
    padding: 1px 6px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    color: #c7254e;
  }
}
</style>
