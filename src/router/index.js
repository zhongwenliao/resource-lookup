import Vue from 'vue';
import Router from 'vue-router';
// import HelloWorld from '@/components/HelloWorld';
// import Login from '@/components/Login';

Vue.use(Router);

export default new Router({
  routes: [{
    path: '/',
    name: 'HelloWorld',
    component: () =>
            import(/* webpackCunkName: "HelloWorld" */ '@/components/HelloWorld')
  }, {
    path: '/login',
    name: 'Login',
    component: () =>
            import(/* webpackCunkName: "Login" */ '@/components/Login')
  }]
});
