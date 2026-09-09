// https://github.com/michael-ciniawsky/postcss-load-config

module.exports = {
  "plugins": {
    "postcss-import": {},
    "postcss-url": {},
    // to edit target browsers: use "browserslist" field in package.json
    "autoprefixer": {},
    // 演示页 px -> rem 自动换算（设计稿基准 375px，1rem = 37.5px）
    // 技术点：移动端 rem 适配，配合 index.html 中的动态 rem 基准脚本
    "postcss-pxtorem": {
      "include": /demos/,
      "rootValue": 37.5,
      "unitPrecision": 5,
      "propList": ["*"],
      "selectorBlackList": [],
      "replace": true,
      "mediaQuery": false,
      "minPixelValue": 2
    }
  }
}
