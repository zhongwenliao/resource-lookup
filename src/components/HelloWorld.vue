<template>
  <div class="hello">
    <h1>欢迎进入新世界</h1>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    };
  },
  beforeCreate () {
    this.$router.push({name: 'Login'});
    console.log('创建以前执行');
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
