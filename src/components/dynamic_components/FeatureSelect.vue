<template>
	<div>
    龙须面值
		<el-select v-model="fieldValue" placeholder="请选择">
			<el-option
				v-for="item in options"
				:key="item.value"
				:label="item.label"
				:value="item.value">
			</el-option>
		</el-select>
	</div>
</template>

<script>
export default {
  watch: {
    fieldValue(newVal, oldVal) {
      if (newVal ) {
          console.log('这里触发事件'); 
          this.$emit('getsdata',newVal);
      }
    }
  },
  data () {
    return {
      options: [{
        value: '选项1',
        label: '黄金糕-feature'
      }, {
        value: '选项2',
        label: '双皮奶-feature'
      }, {
        value: '选项3',
        label: '蚵仔煎-feature'
      }, {
        value: '选项4',
        label: '龙须面-feature'
      }],
      fieldValue: ''
    }
  }
}
</script>

<style>
</style>
