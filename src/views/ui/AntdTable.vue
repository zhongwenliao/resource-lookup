<template>
  <demo-page
    title="Ant Design Vue 表格"
    description="a-table 用 columns 数组配置列，自定义列用 scopedSlots.customRender 声明 + 模板 slot 渲染；分页是内置能力，传 pagination 对象即可。">
    <demo-block
      :index="1"
      title="columns 配置 + 自定义渲染 + 内置分页"
      description="对比 Element 的「逐列声明」，antd 是「配置驱动」：列定义集中在 columns 数组，模板里只写自定义渲染。"
      code="columns: [
    { title: '姓名', dataIndex: 'name' },
    { title: '状态', dataIndex: 'online',
      scopedSlots: { customRender: 'online' } }
  ]

// 模板中用同名 slot 渲染（运行效果见上方表格）
<template slot=&quot;online&quot; slot-scope=&quot;text&quot;>
  <a-tag :color=&quot;text ? 'green' : 'default'&quot;>状态文本</a-tag>
</template>">
      <a-table
        :columns="columns"
        :data-source="list"
        :pagination="{ pageSize: 8 }"
        row-key="id"
        size="small"
        bordered>
        <template slot="online" slot-scope="text">
          <a-tag :color="text ? 'green' : 'default'">{{ text ? '在线' : '离线' }}</a-tag>
        </template>
        <template slot="action" slot-scope="text, record">
          <a @click="viewRow(record)">查看 {{ record.name }}</a>
        </template>
      </a-table>
    </demo-block>

    <demo-block
      :index="2"
      title="与 Element 表格的差异速记"
      description="两种风格没有优劣，团队一致性优先：">
      <ul class="point-list">
        <li>Element：模板里逐列声明，直观但模板长；antd：columns 配置，集中但多一层间接</li>
        <li>antd 自定义列需要 <b>scopedSlots.customRender</b> 与模板 slot 同名配对</li>
        <li>antd 的 pagination 是表格内置属性；Element 是独立的 el-pagination 组件</li>
        <li>antd 行 key 用 row-key；Element 用 row-key 属性同理</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

const CITIES = ['杭州', '上海', '北京', '深圳', '广州'];
const NAMES = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '王二'];
const buildList = () => Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length],
  city: CITIES[i % CITIES.length],
  online: i % 3 !== 0
}));

export default {
  name: 'AntdTable',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      list: buildList(),
      columns: [{
        title: 'ID',
        dataIndex: 'id',
        width: 70
      }, {
        title: '姓名',
        dataIndex: 'name',
        width: 120
      }, {
        title: '城市',
        dataIndex: 'city',
        width: 120
      }, {
        title: '状态',
        dataIndex: 'online',
        width: 90,
        scopedSlots: { customRender: 'online' }
      }, {
        title: '操作',
        key: 'action',
        scopedSlots: { customRender: 'action' }
      }]
    };
  },
  methods: {
    viewRow (record) {
      this.$message.info(`查看：${record.name}（${record.city}）`);
    }
  }
};
</script>

<style lang="less" scoped>
.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2.1;
  color: #555;
}
</style>
