<template>
  <demo-page
    title="Element UI 表单"
    description="el-form 的核心心智：表单数据放在组件 data，v-model 双向绑定，rules 声明式校验，el-form-item 的 prop 指定校验字段。">
    <demo-block
      :index="1"
      title="声明式校验 + 提交 / 重置"
      description="required、自定义 validator 两种校验；validate 返回 Promise，resetFields 重置为初始值。"
      code="<el-form :model=&quot;form&quot; :rules=&quot;rules&quot; ref=&quot;form&quot;>
  <el-form-item label=&quot;用户名&quot; prop=&quot;userName&quot;>
    <el-input v-model=&quot;form.userName&quot; />
  </el-form-item>
</el-form>

this.$refs.form.validate().then(() => { ... })
this.$refs.form.resetFields()">
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="90px"
        size="small"
        class="demo-form">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="3-10 个字符"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="选填，填了会校验格式"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择">
            <el-option label="管理员" value="admin"></el-option>
            <el-option label="用户" value="user"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submit">提交（validate）</el-button>
          <el-button @click="reset">重置（resetFields）</el-button>
        </el-form-item>
      </el-form>
    </demo-block>

    <demo-block
      :index="2"
      title="要点速记"
      description="Element 表单的几个易错点：">
      <ul class="point-list">
        <li>el-form-item 必须写 <b>prop</b> 属性，否则 rules 不生效</li>
        <li>resetFields 重置的是「初始值」，所以表单初始数据要在 data 里定义好</li>
        <li>自定义 validator 校验通过必须调用 <b>callback()</b>，否则一直 pending</li>
        <li>validate 不传回调时返回 Promise（element-ui 2.x）</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

export default {
  name: 'ElementForm',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      form: {
        userName: '',
        email: '',
        role: ''
      },
      rules: {
        userName: [{
          required: true,
          message: '请输入用户名',
          trigger: 'blur'
        }, {
          min: 3,
          max: 10,
          message: '长度 3-10 个字符',
          trigger: 'blur'
        }],
        email: [{
          type: 'email',
          message: '邮箱格式不正确',
          trigger: 'blur'
        }],
        role: [{
          required: true,
          message: '请选择角色',
          trigger: 'change'
        }]
      }
    };
  },
  methods: {
    submit () {
      this.$refs.form.validate()
        .then(() => {
          this.$message.success(`校验通过：${JSON.stringify(this.form)}`);
        })
        .catch(() => {
          this.$message.error('校验未通过');
        });
    },
    reset () {
      this.$refs.form.resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.demo-form {
  max-width: 460px;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}
</style>
