// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    "postcss-import": {},
    "postcss-url": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {}
    // 注：曾配置 postcss-pxtorem（include:/demos/），但 5.1.0 不支持 include 选项，
    // 导致所有组件（含 Element UI）px 被静默转为 rem，且 index.html 无 rem 基准脚本，
    // 界面整体缩小到 42.7%。本工具为 Electron 桌面应用，无需移动端 rem 适配，已移除。
  }
}
