// https://eslint.org/docs/user-guide/configuring

module.exports = {
    root: true,
    parserOptions: {
        // espree 原生支持 import.meta（ES2020+），不再需要 babel-eslint
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    env: {
        browser: true,
        node: true,
        es6: true
    },
    extends: [
        // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
        // plugin-vue 9 的 eslintrc 配置：无前缀 = Vue 2（vue3-* = Vue 3）
        'plugin:vue/essential',
        // https://github.com/standard/standard/blob/master/docs/RULES-en.md
        'standard'
    ],
    // add your custom rules here
    rules: {
        // allow async-await
        'generator-star-spacing': 'off',
        // allow debugger during development
        'no-debugger': 'off',
        // 单行最大长度
        'max-len': ['error', { code: 300 }],
        // 单行分号
        'semi': 0,
        // 演示页组件多为单词命名（Home/Counter 等），关闭多词命名强制
        'vue/multi-word-component-names': 'off'
    }
}
