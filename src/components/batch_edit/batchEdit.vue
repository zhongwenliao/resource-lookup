<template>
	<div>
		父组件
		<div>
			<template v-for="(item, index) in selectFields">
				<SelectField :key="index+ index" :itemdata="tempdata" :itemdata2="tempdata2"  :index="index" @handleDel="del" @updataField="updataField"></SelectField>
			</template>
		</div>
		<div>
			<el-button type="primary" title="新增字段" @click="addField">
				新增字段
			</el-button>
		</div>
		<div>
			<el-button 
				type="primary"  
				title="保存" 
				@click="confirmBatchEdit"
			>
				保存
			</el-button>
			<el-button
				type="primary" 
				title="取消" 
				@click="closeBatchEdit"
			>
				取消
			</el-button>
		</div>
	</div>
</template>

<script>
import SelectField from "./selectField";
import UserSelect from '../dynamic_components/UserSelect';
import LabelSelect from '../dynamic_components/labelSelect';
import ModuleSelect from '../dynamic_components/moduleSelect';
import FeatureSelect from '../dynamic_components/featureSelect';
import _ from 'lodash';

export default {
  components: {
    SelectField
	},
  data() {
    return {
			selectFields: [],
			keylist: [],
			tempdata: [
        {
          label: '黄金糕',
          value: 'assigner',
          component: UserSelect
        },
        {
          label: '双皮奶',
          value: 'LabelSelect',
          component: LabelSelect
        }, {
          label: '蚵仔煎',
          value: 'module',
          component: ModuleSelect
        }, {
          label: '龙须面',
          value: 'feature',
          component: FeatureSelect
        }
      ],
	  	tempdata2: [
				{
          label: '黄金糕',
          value: 'assigner',
          component: UserSelect
        },
        {
          label: '双皮奶',
          value: 'LabelSelect',
          component: LabelSelect
        }, {
          label: '蚵仔煎',
          value: 'module',
          component: ModuleSelect
        }, {
          label: '龙须面',
          value: 'feature',
          component: FeatureSelect
        }
      ]
    };
  },
  methods: {
	  closeBatchEdit() {
		  console.log("关闭")
	  },
	  confirmBatchEdit() {
		  console.log(this.selectFields);
	  },
	  addField() {
			let array = [];
			for(let i = 0; i < this.tempdata.length; i++) {
				array.push(this.tempdata[i].value);
			}
			for(let i = 0; i < this.selectFields.length; i++) {
				if(array.includes((this.selectFields[i].fieldNameKey))) {
					let index5 = this.tempdata.findIndex(x => x.value === this.selectFields[i].fieldNameKey);
					this.tempdata.splice(index5, 1);
				}
			}
			this.selectFields.push({
				fieldNameKey: "",
				fieldValue:""
			});
		},
		updataField(fieldNameKey, fieldValue, index) {
			this.selectFields[index].fieldNameKey = fieldNameKey;
			this.selectFields[index].fieldValue = fieldValue;
			this.keylist.push(fieldNameKey);
			// 去重
			this.keylist = _.uniq(this.keylist);
			let sref = this;
			this.keylist.forEach((z) => {
				_.remove(this.tempdata,sref.tempdata2.find(i => i.value === z));
			});
			console.log('修改',this.tempdata);
		},
	  del (fieldNameKey, fieldValue, index) {
			// let result = this.tempdata2.find(i => i.value === fieldNameKey)
			// // console.log(result);
			// this.tempdata.push(result);
			this.selectFields.splice(index, 1);
		},
		remove(arr, item) {  
			var result=[];  
				for(var i=0; i<arr.length; i++){  
				if(arr[i]!=item){  
					result.push(arr[i]);  
				}  
			}  
			return result;  
		}  
  },
}
</script>

<style scoped>
</style>