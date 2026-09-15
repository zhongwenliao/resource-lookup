# AI 开发规范（入口文件）

> 本项目完整的 AI 开发规范在仓库根目录 **`CLAUDE.md`**（唯一内容源）。
> **开始任何编码任务前，必须先完整阅读 `CLAUDE.md`。**

## 最高优先级红线速览（兜底摘要，详见 CLAUDE.md）

- **技术栈锁定**：Vue 2.6（Options API）/ Element UI 2 / webpack 3 + babel 6 / Electron 41；禁止 Vue 3、Element Plus、Vite
- **语法限制**：禁用 `?.`、`??` 等 ES2019+ 语法（babel 6 编译直接报错）；用 `obj && obj.prop` 替代
- **规则单一来源**：生成端/解析端共用的编码规则只改 `src/common/qc-code-rules.js`
- **双环境兼容**：渲染进程调用 `window.electronAPI` 必须判空降级（浏览器 dev 模式无此对象）
- **业务红线**：NG 记录不生成二维码；授权相关能力主进程必须二次校验
- **BTXML 陷阱**：写临时文件必须加 UTF-8 BOM（`'\ufeff' + xml`）
- **代码风格**：无分号、单引号、2 空格缩进、中文注释写"为什么"
- **文件读写**：显式 `utf8` 编码（Windows 中文环境）
