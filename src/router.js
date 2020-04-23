import Vue from 'vue';
import Router from 'vue-router';
// import HelloWorld from '@/components/HelloWorld';
// import Login from '@/components/Login';

Vue.use(Router);
const loadingLazy = (view) => () =>
    import(/* webpackChunkName: "view-[request]" */ `@/components/${view}.vue`);
export default new Router({
  routes: [{
    path: '/',
    name: 'HelloWorld',
    component: loadingLazy('HelloWorld')
  }, {
    path: '/login',
    name: 'Login',
    component: loadingLazy('Login')
  }, {
    path: '*',
    redirect: '/'
  }]
});
