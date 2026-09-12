import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue2';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 等价 webpack 的 resolve.extensions（补 .vue 以支持 import App from './App'）
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      // 等价 webpack 的 'vue$': 'vue/dist/vue.esm.js'
      // main.js 使用 template 选项，需要带模板编译器的完整版构建（必须写成绝对路径）
      'vue': fileURLToPath(new URL('./node_modules/vue/dist/vue.esm.js', import.meta.url)),
      // 等价 webpack 的 '@': resolve('src')
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    // 原 .postcssrc.js 的配置内联到这里（postcss-import / postcss-url 的能力 Vite 已内置）
    postcss: {
      plugins: [
        autoprefixer(),
        // 演示页 px -> rem 自动换算（设计稿基准 375px，1rem = 37.5px）
        // 技术点：移动端 rem 适配，配合 index.html 中的动态 rem 基准脚本
        pxtorem({
          include: /views/,
          rootValue: 37.5,
          unitPrecision: 5,
          propList: ['*'],
          selectorBlackList: [],
          replace: true,
          mediaQuery: false,
          minPixelValue: 2
        })
      ]
    }
  },
  server: {
    host: 'localhost',
    port: 8080,
    // 8081/8082/8083 是配套本地服务（ws/upload/tile）的端口，
    // 8080 被占时直接报错，避免自动换端口撞上它们
    strictPort: true,
    open: false
  },
  build: {
    outDir: 'dist'
  }
});
