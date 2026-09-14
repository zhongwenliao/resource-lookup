<template>
  <demo-page
    title="深拷贝：从 JSON 到结构化克隆"
    description="对象引用赋值是浅拷贝的根源。本页对比四种方案的能耐边界：JSON 序列化（丢函数/环报错）、递归手写（面试必写）、MessageChannel（异步、支持环）、structuredClone（原生、不支持函数）。">
    <demo-block
      :index="1"
      title="四种方案实测"
      description="构造一个含嵌套对象、数组、Date、环引用的复杂对象，逐个方案拷贝并验证："
      code="// 1. JSON 快糙猛：丢 undefined/函数/Symbol，Date 变字符串，环直接报错
const clone = JSON.parse(JSON.stringify(obj));

// 2. 手写递归：WeakMap 记录已拷贝对象，解决环引用
function deepClone (obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (map.has(obj)) return map.get(obj);        // 技术点：环引用命中缓存
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  Object.keys(obj).forEach(k => { clone[k] = deepClone(obj[k], map); });
  return clone;
}

// 3. MessageChannel：异步结构化克隆，支持环、Date、Map、Set
// 4. structuredClone：现代浏览器原生 API，同上但同步、不支持函数">
      <div class="demo-row">
        <el-button size="small" type="primary" @click="runAll">执行四种方案拷贝</el-button>
        <el-button size="small" @click="results = []">清空结果</el-button>
      </div>
      <ul class="result-list">
        <li v-for="r in results" :key="r.name" :class="r.ok ? 'ok' : 'fail'">
          <b>{{ r.name }}</b>
          <span>{{ r.text }}</span>
        </li>
        <li v-if="!results.length" class="empty">（点击执行，观察各方案表现）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="2"
      title="方案能力矩阵"
      description="选型速查：">
      <ul class="point-list">
        <li><b>JSON.parse(JSON.stringify)</b> —— 简单纯数据够用；丢 undefined / 函数 / Symbol，Date 变 ISO 字符串，NaN 变 null，环引用直接 TypeError</li>
        <li><b>手写递归 + WeakMap</b> —— 面试标准答案；WeakMap 而非 Map 是关键（弱引用不阻止回收，且天然支持环）；默认只拷自身可枚举属性</li>
        <li><b>MessageChannel</b> —— new MessageChannel().port1.onmessage + port2.postMessage(obj)，浏览器结构化克隆算法，支持环 / Date / Map / Set / TypedArray；缺点是异步</li>
        <li><b>structuredClone</b> —— 2022+ 原生 API，能力同 MessageChannel 且同步；同样<b>不拷函数</b>（直接抛 DataCloneError）</li>
        <li><b>lodash cloneDeep</b> —— 生产首选：处理了原型链、Symbol 键、Buffer、Dom 节点等边角，性能经过大规模验证</li>
        <li><b>Vue 场景</b> —— Vuex 提交前深拷贝初始 state、表单「编辑副本 / 取消还原」场景，别用 JSON 方案（Date 字段会变字符串，提交接口炸）</li>
      </ul>
    </demo-block>

    <demo-block
      :index="3"
      title="浅拷贝速记"
      description="一行代码的浅拷贝也要分清：">
      <ul class="point-list">
        <li><b>展开运算符 / Object.assign</b> —— 只拷第一层，嵌套对象仍是引用（改 clone.a.b 会动到原对象）</li>
        <li><b>数组 slice / concat</b> —— 同样只浅拷一层</li>
        <li><b>Object.getOwnPropertyDescriptors</b> —— 连 getter/setter、不可枚举属性一起拷，Vue 源码里组件选项合并的用法</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import DemoPage from '@/components/DemoPage';
import DemoBlock from '@/components/DemoBlock';

/**
 * 技术点：手写深拷贝 —— WeakMap 解决环引用
 * 面向演示覆盖 Date / RegExp / 数组 / 普通对象 / null
 */
function deepClone (obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (map.has(obj)) return map.get(obj);
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  Object.keys(obj).forEach(k => {
    clone[k] = deepClone(obj[k], map);
  });
  return clone;
}

// 构造测试对象：嵌套 + Date + 环引用
function buildTarget () {
  const obj = {
    name: '原始对象',
    date: new Date('2026-01-01'),
    tags: ['a', 'b'],
    nested: { level: 2, inner: { level: 3 } }
  };
  obj.self = obj; // 环引用
  return obj;
}

export default {
  name: 'DeepClone',
  components: { DemoPage, DemoBlock },
  data () {
    return {
      results: []
    };
  },
  methods: {
    pushResult (name, ok, text) {
      this.results.push({ name, ok, text });
    },
    runAll () {
      this.results = [];
      // 1. JSON 方案：环引用直接抛错
      try {
        JSON.parse(JSON.stringify(buildTarget()));
        this.pushResult('JSON.stringify', true, '拷贝成功（未构造环时才可行）');
      } catch (e) {
        this.pushResult('JSON.stringify', false, 'TypeError: ' + (e.message || 'Converting circular structure to JSON').slice(0, 60));
      }
      // 2. 手写递归：环引用 OK
      const cloned = deepClone(buildTarget());
      const ringOk = cloned.self === cloned && cloned.self.self === cloned;
      const dateOk = cloned.date instanceof Date;
      this.pushResult('手写递归 + WeakMap', ringOk && dateOk, `环引用保持：${ringOk}；Date 类型保持：${dateOk}`);
      // 3. structuredClone：原生结构化克隆
      if (typeof structuredClone === 'function') {
        const sc = structuredClone(buildTarget());
        this.pushResult('structuredClone', sc.self === sc && sc.date instanceof Date, '原生 API，环 / Date 均支持（函数会抛 DataCloneError）');
      } else {
        this.pushResult('structuredClone', false, '当前浏览器不支持');
      }
      // 4. MessageChannel：异步结构化克隆
      const mc = new MessageChannel();
      mc.port1.onmessage = (e) => {
        const data = e.data;
        this.pushResult('MessageChannel', data.self === data && data.date instanceof Date, '异步结构化克隆成功，能力与 structuredClone 一致');
      };
      mc.port2.postMessage(buildTarget());
    }
  }
};
</script>

<style lang="less" scoped>
.demo-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.result-list {
  margin: 0;
  padding: 12px;
  list-style: none;
  background: #fafafa;
  border-radius: 4px;
  font-size: 13px;

  li {
    display: flex;
    gap: 10px;
    line-height: 2;

    b {
      width: 190px;
      flex-shrink: 0;
    }

    span {
      flex: 1;
      color: #666;
    }
  }

  .ok b { color: #52c41a; }
  .fail b { color: #f5222d; }

  .empty {
    color: #bbb;
  }
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
