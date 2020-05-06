<template>
  <div>
    <h1>欢迎进入新世界</h1>
    <CheckVue></CheckVue>
  </div>
</template>

<script>
import CheckVue from './batch_edit/batchEdit';

export default {
  components: {
    CheckVue
  },
  name: 'HelloWorld',
  data () {
    return {
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
