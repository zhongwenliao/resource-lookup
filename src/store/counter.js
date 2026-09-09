/**
 * Vuex 演示模块：完整覆盖 state / getters / mutations / actions / namespaced
 * 配套演示页：/vuex/counter
 * 本文件由 store/index.js 中 require.context 自动扫描注册，无需手动 import
 */
export default {
  namespaced: true,
  state: {
    count: 0,
    step: 1,
    history: []
  },
  getters: {
    doubleCount: state => state.count * 2,
    lastLog: state => (state.history.length ? state.history[0] : '暂无操作')
  },
  mutations: {
    CHANGE_STEP (state, step) {
      state.step = step;
    },
    INCREMENT (state, payload = 1) {
      state.count += payload;
      state.history.unshift(`mutation INCREMENT +${payload}`);
    },
    DECREMENT (state, payload = 1) {
      state.count -= payload;
      state.history.unshift(`mutation DECREMENT -${payload}`);
    },
    RESET (state) {
      state.count = 0;
      state.history.unshift('mutation RESET');
    }
  },
  actions: {
    // 技术点：action 承载异步逻辑，通过 commit 提交 mutation 完成状态变更
    asyncChange ({ commit }, { type, payload }) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit(type, payload);
          resolve(`action ${type} 已在 500ms 后完成`);
        }, 500);
      });
    }
  }
};
