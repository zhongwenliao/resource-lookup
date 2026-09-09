<template>
  <demo-page
    title="Element UI 表格 + 分页"
    description="el-table 逐列声明（el-table-column），自定义列用作用域插槽 slot-scope；el-pagination 前端模拟分页联动。">
    <demo-block
      :index="1"
      title="基础表格 + 自定义列 + 分页"
      description="状态列用作用域插槽渲染标签；操作列绑定行数据；分页改变时截取数据源。"
      code="<el-table :data=&quot;pagedList&quot;>
  <el-table-column prop=&quot;name&quot; label=&quot;姓名&quot; />
  <el-table-column label=&quot;状态&quot;>
    <template slot-scope=&quot;{ row }&quot;>
      <el-tag :type=&quot;row.online ? 'success' : 'info'&quot;>状态文本</el-tag>
    </template>
  </el-table-column>
</el-table>">
      <el-table :data="pagedList" border size="small">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="city" label="城市" width="120"></el-table-column>
        <el-table-column prop="score" label="分数" width="90" sortable></el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="{ row }">
            <el-tag :type="row.online ? 'success' : 'info'" size="small">
              {{ row.online ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="text" size="small" @click="viewRow(row)">查看 {{ row.name }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="demo-pagination"
        layout="total, prev, pager, next"
        :total="list.length"
        :page-size="pageSize"
        :current-page.sync="page">
      </el-pagination>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/common/components/DemoPage';
import DemoBlock from '@/common/components/DemoBlock';

// 本地生成 30 条模拟数据
const CITIES = ['杭州', '上海', '北京', '深圳', '广州'];
const NAMES = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑一', '王二'];
const buildList = () => Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length],
  city: CITIES[i % CITIES.length],
  score: 60 + ((i * 7) % 40),
  online: i % 3 !== 0
}));

export default {
  name: 'ElementTable',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      list: buildList(),
      page: 1,
      pageSize: 8
    };
  },
  computed: {
    // 技术点：computed 派生分页数据，page 变化自动重算
    pagedList () {
      const start = (this.page - 1) * this.pageSize;
      return this.list.slice(start, start + this.pageSize);
    }
  },
  methods: {
    viewRow (row) {
      this.$message.info(`查看：${row.name}（${row.city}，${row.score} 分）`);
    }
  }
};
</script>

<style lang="less" scoped>
.demo-pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
