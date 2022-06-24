export default {
  namespaced: true,
  state: {
    userName: 'superAdmin',
    passWord: 'adminsuper'
  },
  getters: {},
  mutations: {},
  actions: {
    postLogin({ state, comments }, payload) {
      return '{userName: "admin", passWord: "admin123"}'
    }
  }
}
