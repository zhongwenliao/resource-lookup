<template>
    <div :class="className">
        <h2>{{ title }}</h2>
        <slot></slot>
    </div>
</template>

<script>
export default {
  name: 'MainHead',
  props: {
    title: {
      type: String,
      default: ''
    },
    className: {
      type: String,
      default: 'manage-area-title'
    }
  },
  methods: {

  }
}
</script>
