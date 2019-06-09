<template>
  <div class="login-wrapper">
    <div class="lg-header">
    </div>
      <div class="lg-content">
          <div class="qc-pt-login-content">
              <div class="login-tab">
                  <div class="p-logo">欢迎使用</div>
                  <div class="login-form">
                      <div class="form-unit">
                          <label for="">用户名</label>
                          <input type="text"
                            v-model="userName" class="tc-15-input-text m" placeholder="请输入用户名">
                      </div>
                      <div class="form-unit auto-unit">
                          <label for="">密码</label>
                          <input type="password"
                            v-model="passWord" class="tc-15-input-text m loading" placeholder="请输入密码">
                      </div>
                      <div class="form-unit auto-unit">
                          <label class="form-ctrl-label"><input type="checkbox" class="tc-15-checkbox">记住帐号密码</label>
                      </div>
                      <div class="form-unit form-submit">
                          <button class="tc-15-btn" @click="login">登录</button>
                      </div>
                      <div class="form-unit">
                          <p class="text text-center">登陆遇到问题？请<a href="#">联系管理员</a></p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import CanvasNest from 'canvas-nest.js';
import { mapActions } from 'vuex';
export default {
  name: 'Login',
  data () {
    return {
      // CanvasNest特效配置
      specialConfig: {
        color: 'FCFCFC',
        count: 88
      },
      // CanvasNest
      cn: '',
      // 用户名
      userName: '',
      // 密码
      passWord: ''
    };
  },
  beforeCreate () {
  },
  created () {
  },
  mounted () {
    const el = document.getElementsByClassName('login-wrapper')[0];
    this.cn = new CanvasNest(el, this.specialConfig);
  },
  // 这里写方法
  methods: {
    ...mapActions('login', [
      'postLogin'
    ]),
    // 点击登录
    login () {
      this.postLogin()
        .then(data => {
          console.log('输出请求返回的数据', data);
        });
    }
  },
  beforeDestroy () {
    // 特效销毁
    this.cn.destroy();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.login-wrapper {
  background-color: transparent;
  .lg-content {
    .login-tab {
      background-color: #F4F4F4;
    }
  }
}
</style>
