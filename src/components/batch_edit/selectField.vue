<template>
	<div :style="{'display': 'flex'}">
    子组件
		<el-select v-model="fieldNameKey" placeholder="请选择">
			<el-option
				v-for="item in itemdata"
				:key="item.value"
				:label="item.label"
				:value="item.value"
      >
			</el-option>
		</el-select>
    <component
      ref="field"
			v-if="config"
      :is="config.component"
      @getsdata="datainfo"
    />
		<el-button 
			type="primary"  
			title="删除" 
			@click="deleteItem"
		>
			删除
		</el-button>
	</div>
</template>

<script>

export default {
  props: {
    index: Number,
    itemdata: {
      type: Array,
      default: []
    },
    itemdata2: {
      type: Array,
      default: []
    },
  },
	data() {
		return {
      fieldNameKey: "",
      fieldValue: ""
		}
  },
  watch: {
    fieldValue() {
      this.$emit("updataField", this.fieldNameKey, this.fieldValue, this.index)
    },
    fieldNameKey() {
      this.$emit("updataField", this.fieldNameKey, this.fieldValue, this.index)
    }
  },
	methods: {
    datainfo(fieldValue) {
      this.fieldValue = fieldValue;
    },
		deleteItem() {
      this.$emit('handleDel', this.fieldNameKey, this.fieldValue, this.index);
		}
	},
	computed: {
		config() {
      if(!this.fieldNameKey) {
        return null
      }
      let result = this.itemdata2.find(i => i.value === this.fieldNameKey)
      if(!result) {
        return null
      }
      return result
		}
	},
}
</script>

<style>
</style>