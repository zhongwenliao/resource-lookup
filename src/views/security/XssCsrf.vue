<template>
  <demo-page
    title="前端安全：XSS 与 CSRF 攻防"
    description="前端两大高频攻击：XSS 注入恶意脚本窃取数据，CSRF 借用户身份发请求。本页用可运行的演示还原攻击链路与防御手段（富文本场景的 v-html 是 XSS 重灾区）。">
    <demo-block
      :index="1"
      title="XSS 演示 —— 富文本注入"
      description="模拟评论区：输入包含恶意脚本的「评论」，左侧是危险渲染（v-html 直出），右侧是防御后的净化渲染："
      :code="codeXss">
      <div class="demo-row">
        <el-input
          v-model="userInput"
          type="textarea"
          :rows="3"
          style="width: 100%"
          placeholder="试试输入：&lt;img src=x onerror=alert(1)&gt; 或 &lt;script&gt;alert(2)&lt;/script&gt; 或 &lt;b&gt;正常加粗&lt;/b&gt;" />
      </div>
      <div class="compare">
        <div class="panel danger">
          <p class="panel-title">危险渲染（v-html 直出）</p>
          <div class="panel-body" v-html="userInput"></div>
        </div>
        <div class="panel safe">
          <p class="panel-title">净化渲染（模拟白名单过滤）</p>
          <div class="panel-body">{{ sanitizedPreview }}</div>
        </div>
      </div>
      <p class="demo-tip">净化面板用文本插值展示过滤结果（本页不引入 DOMPurify，用简化版白名单模拟其行为）；真实项目 npm i dompurify。</p>
    </demo-block>

    <demo-block
      :index="2"
      title="XSS 三种类型与防御"
      description="按注入位置分类：">
      <ul class="point-list">
        <li><b>存储型</b> —— 恶意脚本存进数据库，每个访问者都中招（评论区 / 个人简介），危害最大</li>
        <li><b>反射型</b> —— 脚本藏在 URL 参数里，服务端原样回显（搜索结果页）；需要诱导用户点链接</li>
        <li><b>DOM 型</b> —— 纯前端漏洞：innerHTML / document.write / eval 处理了不可信输入；不经过服务端</li>
        <li><b>防御核心</b> —— 输出转义（{{ }} 插值默认转义）+ 富文本白名单净化（DOMPurify）+ Cookie 加 httpOnly（脚本偷不走）+ CSP 响应头兜底</li>
        <li><b>Vue 注意</b> —— v-html 是明确警告「不要渲染不可信内容」的 API；:href / :src 绑定用户输入要校验协议（防 javascript: 伪协议）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="CSRF 攻击链路与防御"
      description="攻击者借浏览器「自动带 Cookie」的特性，让用户在不知情下发请求："
      code="// 攻击链路：
// 1. 用户登录 bank.com，浏览器保存会话 Cookie
// 2. 用户访问恶意网站 evil.com，页面里有：
&lt;img src=&quot;https://bank.com/transfer?to=hacker&amp;amount=10000&quot;&gt;
// 3. 请求自动带上 bank.com 的 Cookie → 转账成功

// 防御三件套：
// 1. SameSite Cookie（现代浏览器默认 Lax，已挡掉大部分）
Set-Cookie: sid=xxx; SameSite=Lax; Secure; HttpOnly
// 2. CSRF Token：服务端下发随机 token，请求头/表单带上，服务端校验
// 3. 关键操作二次验证：验证码 / 密码 / 人机行为">
      <ul class="point-list">
        <li><b>CSRF 利用的是信任，不是漏洞代码</b> —— 站点代码零漏洞也可能被 CSRF，因为浏览器对同域请求自动带 Cookie</li>
        <li><b>为什么纯前端项目天然免疫大半</b> —— 前后端分离 + token 放 Authorization 头（非 Cookie）时，恶意页面发不出带 token 的跨域请求（受 CORS 预检限制）</li>
        <li><b>SameSite=Lax</b> —— 跨站 GET 导航带 Cookie、跨站 POST / img / fetch 不带；Chrome 2020 起默认，老浏览器仍需 token 方案</li>
        <li><b>XSS 与 CSRF 的关系</b> —— XSS 可以偷 CSRF token（脚本能读 DOM），所以 XSS 防御是 CSRF 防御的前提</li>
        <li><b>其他常见攻击面</b> —— 点击劫持（X-Frame-Options: DENY）、依赖投毒（lockfile 审计 npm audit）、开放重定向（校验 redirect 参数白名单）</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

// 简化版白名单净化：仅保留 b/i/em/strong/a(p) 文本，其余标签转义展示
// 真实项目用 DOMPurify.sanitize，这里演示白名单思想
const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'p', 'br'];

function escapeHtml (str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function simpleSanitize (input) {
  if (!input) return '';
  // 逐标签扫描：白名单内的保留，其余转义
  return input.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag) => {
    if (ALLOWED_TAGS.includes(tag.toLowerCase())) {
      return match; // 白名单标签原样保留
    }
    return escapeHtml(match); // 非白名单转义成可见文本
  });
}

export default {
  name: 'XssCsrf',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      userInput: '<b>正常加粗</b> <img src=x onerror=alert(1)> <svg onload=alert(2)>',
      // 技术点：含 {{ }} 的代码片段不能写在普通 attribute 里 ——
      // Vue 2 编译器会把它当成已废弃的属性插值语法直接报错，须移入 script 用 :code 绑定
      codeXss: `// 危险：v-html 直接渲染用户输入
<div v-html="userInput"></div>
// 输入 <img src=x onerror="alert(1)"> → 脚本执行

// 防御：白名单净化（DOMPurify）
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href']
});

// 文本场景永远用 {{ }} 插值，Vue 默认转义`
    };
  },
  computed: {
    // 净化结果以文本形式展示（配合 {{ }} 转义），让用户看到过滤后的内容
    sanitizedPreview () {
      return simpleSanitize(this.userInput);
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  margin-bottom: 12px;
}

.compare {
  display: flex;
  gap: 12px;

  .panel {
    flex: 1;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    overflow: hidden;

    .panel-title {
      margin: 0;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
    }

    .panel-body {
      padding: 12px;
      min-height: 60px;
      font-size: 13px;
      line-height: 1.8;
      word-break: break-all;
      background: #fff;
    }

    &.danger .panel-title {
      background: #fff1f0;
      color: #f5222d;
      border-bottom: 1px solid #ffa39e;
    }

    &.safe .panel-title {
      background: #f6ffed;
      color: #52c41a;
      border-bottom: 1px solid #b7eb8f;
    }
  }
}

.demo-tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
