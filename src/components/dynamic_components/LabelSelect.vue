<template>
	<div>
    双皮奶值
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
        label: '黄金糕-label'
      }, {
        value: '选项2',
        label: '双皮奶-label'
      }, {
        value: '选项3',
        label: '蚵仔煎-label'
      }, {
        value: '选项4',
        label: '龙须面-label'
      }],
      fieldValue: ''
    }
  }
}
</script>

<style>
</style>
