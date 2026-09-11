<template>
  <demo-page
    title="Ant Design Vue 表单"
    description="antd 1.x 表单的核心心智：数据由 form 实例托管（受控模式），字段用 v-decorator 注册并绑定 rules，取值/校验都通过 form 实例完成。与 Element「数据在 data」的模式形成对照。">
    <demo-block
      :index="1"
      title="v-decorator 受控表单"
      description="created 中 this.$form.createForm(this) 创建实例；v-decorator 数组第一项是字段名，第二项配置 initialValue 与 rules。"
      code="created () {
  this.form = this.$form.createForm(this);
}

&lt;a-input v-decorator=&quot;['userName', {
  initialValue: '',
  rules: [{ required: true, message: '请输入用户名' }]
}]&quot; />

this.form.validateFields((err, values) => { ... })
this.form.resetFields()">
      <a-form
        :form="form"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
        class="demo-form"
        @submit.prevent="submit">
        <a-form-item label="用户名">
          <a-input
            v-decorator="['userName', {
              initialValue: '',
              rules: [{ required: true, message: '请输入用户名' }, { min: 3, max: 10, message: '长度 3-10 个字符' }]
            }]"
            placeholder="3-10 个字符"></a-input>
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input
            v-decorator="['email', {
              initialValue: '',
              rules: [{ type: 'email', message: '邮箱格式不正确' }]
            }]"
            placeholder="选填，填了会校验格式"></a-input>
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-decorator="['role', {
              initialValue: undefined,
              rules: [{ required: true, message: '请选择角色' }]
            }]"
            placeholder="请选择">
            <a-select-option value="admin">管理员</a-select-option>
            <a-select-option value="user">用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 16, offset: 6 }">
          <a-button type="primary" html-type="submit">提交（validateFields）</a-button>
          <a-button class="demo-btn" @click="reset">重置（resetFields）</a-button>
        </a-form-item>
      </a-form>
    </demo-block>

    <demo-block
      :index="2"
      title="与 Element 的差异速记"
      description="从 Element 迁移到 antd 时最容易踩的坑：">
      <ul class="point-list">
        <li>字段值不在 this.data 里，取值用 <b>validateFields / getFieldsValue</b></li>
        <li>没有 v-model，改值用 <b>setFieldsValue</b>，取单值用 <b>getFieldValue</b></li>
        <li>校验规则跟字段绑定在 v-decorator 里，而不是集中在 form 的 rules</li>
        <li>form 实例必须在 created 之前创建（createForm），否则 v-decorator 报错</li>
        <li>label 布局用 label-col / wrapper-col 栅格，而非 label-width</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

export default {
  name: 'AntdForm',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      // form 实例在 created 中创建（非响应式数据，不需要放 data 里声明）
      form: null
    };
  },
  created () {
    // 技术点：antd 1.x 高阶表单 —— $form.createForm 创建受控表单实例
    this.form = this.$form.createForm(this);
  },
  methods: {
    submit () {
      this.form.validateFields((err, values) => {
        if (err) {
          this.$message.error('校验未通过');
          return;
        }
        this.$message.success(`校验通过：${JSON.stringify(values)}`);
      });
    },
    reset () {
      this.form.resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.demo-form {
  max-width: 460px;

  .demo-btn {
    margin-left: 8px;
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}
</style>
