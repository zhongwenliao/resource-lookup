<template>
  <div id="app">
    <GlobalHeader v-if="!isLoading"></GlobalHeader>
    <router-view/>
  </div>
</template>

<script>
import GlobalHeader from './common/GlobalHeader'

export default {
  name: 'App',
  components: {
    GlobalHeader
  },
  data () {
    return {
    }
  },
  computed: {
    isLoading () {
      return this.$route.name === 'Login';
    }
  }
};
</script>

<style>
#app{
  height: 100%;
}
</style>
