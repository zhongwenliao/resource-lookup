<template>
  <demo-page
    title="大文件上传"
    description="完整链路：文件分片（Blob.slice）→ hash 计算（SparkMD5 增量）→ 秒传/断点续传检查 → 并发池上传（Promise.race 补位）→ 暂停恢复（xhr.abort）→ 通知合并。配套本地服务：npm run upload:server（端口 8082）。">
    <demo-block
      :index="1"
      title="第一步：文件分片 Blob.slice"
      description="File 继承自 Blob，slice(start, end) 返回一个新的 Blob 切片视图，不复制数据、不占额外内存。演示按 5MB 一片切割。"
      :code="codeSlice">
      <div class="file-picker">
        <label class="pick-btn">
          选择文件
          <input type="file" @change="onFileChange">
        </label>
        <span v-if="file" class="file-meta">
          {{ file.name }}（{{ fmtSize(file.size) }}）
        </span>
      </div>
      <div v-if="chunks.length" class="chunk-info">
        <el-tag>单片 5MB</el-tag>
        <el-tag type="success">共 {{ chunks.length }} 片</el-tag>
        <span class="tip">选一个大于 5MB 的文件才能看到多片效果</span>
      </div>
    </demo-block>

    <demo-block
      :index="2"
      title="第二步：hash 计算 + 秒传/续传检查"
      description="SparkMD5 按分片增量计算全文件 MD5（生产环境应放入 Web Worker 避免阻塞主线程）。hash 两大用途：秒传判断（服务端已有同内容文件则跳过上传）、断点续传的文件标识。"
      :code="codeHash">
      <template v-if="file">
        <el-progress
          v-if="hashProgress < 100"
          :percentage="hashProgress" />
        <div v-else class="hash-result">
          <span class="label">文件 hash：</span>
          <code>{{ fileHash }}</code>
        </div>
        <div v-if="instantHit" class="flag-row">
          <el-tag type="success">秒传命中：服务端已存在相同文件，无需再传</el-tag>
        </div>
        <div v-if="resumedCount > 0" class="flag-row">
          <el-tag type="warning">断点续传：{{ resumedCount }} 个分片已在服务端，将自动跳过</el-tag>
        </div>
      </template>
      <p v-else class="empty-tip">请先选择文件</p>
    </demo-block>

    <demo-block
      :index="3"
      title="第三步：并发池上传 + 暂停恢复"
      description="并发池保持 3 路在途请求（Promise.race 空出一个位立刻补位）；暂停 = abort 所有在途请求；恢复 = 只传剩余分片。服务端 progress 接口让刷新页面后也能续传。"
      :code="codePool">
      <template v-if="file">
        <div class="toolbar">
          <el-button
            type="primary"
            :disabled="!file || uploading || allDone"
            @click="startUpload">
            开始上传
          </el-button>
          <el-button
            type="warning"
            :disabled="!uploading"
            @click="pause">
            暂停
          </el-button>
          <el-tag v-if="uploading">上传中…</el-tag>
          <el-tag v-else-if="paused" type="warning">已暂停</el-tag>
          <el-tag v-else-if="allDone" type="success">全部分片完成</el-tag>
        </div>
        <el-progress
          :percentage="percent"
          :stroke-width="16"
          :text-inside="true" />
        <div class="stat">
          已传 {{ uploadedCount }} / {{ chunks.length }} 片 ·
          {{ fmtSize(uploadedBytes) }} / {{ fmtSize(totalSize) }}
        </div>
        <div class="chunk-grid">
          <div
            v-for="c in chunks"
            :key="c.index"
            class="cell"
            :class="chunkClass(c)"
            :title="'分片 ' + c.index">
            {{ c.index }}
          </div>
        </div>
        <div class="legend">
          <span><i class="dot pending" />待传</span>
          <span><i class="dot active" />在途</span>
          <span><i class="dot done" />完成</span>
        </div>
        <div class="logs">
          <p v-for="(l, i) in logs" :key="i">{{ l }}</p>
        </div>
      </template>
      <p v-else class="empty-tip">请先选择文件</p>
    </demo-block>

    <demo-block
      :index="4"
      title="第四步：通知合并"
      description="全部分片到齐后，前端发 merge 请求带上 hash 与文件名，服务端按索引顺序拼接分片、清理临时目录，返回最终文件信息。"
      :code="codeXhr">
      <div v-if="result">
        <el-alert
          type="success"
          :title="'合并成功：' + result.filename + '（' + fmtSize(result.size) + '，共 ' + result.chunks + ' 片）'"
          :closable="false" />
        <p class="result-path">服务端落盘：upload-finished/{{ result.filename }}</p>
      </div>
      <p v-else class="empty-tip">上传完成后自动合并，结果展示在这里</p>
    </demo-block>

    <demo-block
      :index="5"
      title="技术点速记"
      description="大文件上传方案的核心取舍：">
      <ul class="point-list">
        <li><b>为什么分片</b>：单请求超时/失败重传代价大；分片后可并发、可重试单片、可断点续传</li>
        <li><b>hash 的意义</b>：内容寻址（秒传）+ 续传标识；SparkMD5 增量计算避免一次性读入内存，生产放 Web Worker</li>
        <li><b>并发池</b>：Promise.race 空位补位模式，比一次性 Promise.all(pending) 更平稳</li>
        <li><b>进度聚合</b>：xhr.upload.onprogress 提供分片级已传字节，总和 / 文件总大小 = 总进度</li>
        <li><b>暂停</b>：abort 在途请求；<b>恢复</b>：过滤已传分片再跑一遍并发池</li>
        <li><b>合并时机</b>：前端计数到齐后发 merge；更严谨的做法是服务端分片数达标自动合并</li>
      </ul>
    </demo-block>
  </demo-page>
</template>

<script>
import SparkMD5 from 'spark-md5';

const BASE_URL = 'http://127.0.0.1:8082';
const CHUNK_SIZE = 5 * 1024 * 1024; // 每片 5MB
const CONCURRENT = 3;               // 并发上传路数

export default {
  name: 'BigFileUpload',
  data () {
    return {
      file: null,
      chunks: [],
      fileHash: '',
      hashProgress: 0,
      instantHit: false,
      resumedCount: 0,
      uploadedMap: {},   // index -> true（已完成）
      chunkLoaded: {},   // index -> 已传字节（含在途）
      uploading: false,
      paused: false,
      result: null,
      logs: [],
      codeSlice: 'const chunks = []\nfor (let start = 0; start < file.size; start += CHUNK_SIZE) {\n  chunks.push({\n    index: chunks.length,\n    blob: file.slice(start, start + CHUNK_SIZE)\n  })\n}',
      codeHash: 'const spark = new SparkMD5.ArrayBuffer()\nfor (const chunk of chunks) {\n  // FileReader 读出 ArrayBuffer，增量 append，内存只驻留一片\n  spark.append(await readBlob(chunk.blob))\n}\nconst hash = spark.end()',
      codePool: 'const pool = []\nfor (const chunk of pending) {\n  const task = uploadChunk(chunk)\n    .then(() => pool.splice(pool.indexOf(task), 1))\n  pool.push(task)\n  // 池满则等任一请求结束，空出一个位再补下一个\n  if (pool.length >= CONCURRENT) await Promise.race(pool)\n}\nawait Promise.all(pool) // 收尾在途请求',
      codeXhr: 'const xhr = new XMLHttpRequest()\nxhr.open(\'POST\', \'/upload/chunk?hash=xxx&index=n\')\nxhr.setRequestHeader(\'Content-Type\', \'application/octet-stream\')\nxhr.upload.onprogress = (e) => { loaded[index] = e.loaded }\nxhr.onload = () => { done[index] = true }\nxhr.send(chunk.blob) // Blob 直接作为请求体'
    };
  },
  computed: {
    totalSize () {
      return this.file ? this.file.size : 0;
    },
    uploadedCount () {
      return Object.keys(this.uploadedMap).length;
    },
    uploadedBytes () {
      let sum = 0;
      this.chunks.forEach((c) => {
        sum += this.chunkLoaded[c.index] || 0;
      });
      return sum;
    },
    percent () {
      if (!this.totalSize) return 0;
      return Math.floor((this.uploadedBytes / this.totalSize) * 100);
    },
    allDone () {
      return this.chunks.length > 0 && this.uploadedCount === this.chunks.length;
    }
  },
  created () {
    // 在途 xhr 引用不参与渲染，不放 data 避免无谓的响应式开销
    this.xhrMap = {};
  },
  methods: {
    fmtSize (bytes) {
      if (!bytes) return '0 B';
      const units = ['B', 'KB', 'MB', 'GB'];
      let i = 0;
      let n = bytes;
      while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
      }
      return n.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    },
    log (msg) {
      const time = new Date().toTimeString().slice(0, 8);
      this.logs.unshift('[' + time + '] ' + msg);
      if (this.logs.length > 30) this.logs.pop();
    },
    chunkClass (c) {
      if (this.uploadedMap[c.index]) return 'done';
      if (this.chunkLoaded[c.index]) return 'active';
      return 'pending';
    },
    onFileChange (e) {
      const file = e.target.files[0];
      if (!file) return;
      // 重置全部状态
      this.file = file;
      this.chunks = [];
      this.fileHash = '';
      this.hashProgress = 0;
      this.instantHit = false;
      this.resumedCount = 0;
      this.uploadedMap = {};
      this.chunkLoaded = {};
      this.uploading = false;
      this.paused = false;
      this.result = null;
      this.logs = [];
      this.xhrMap = {};
      this.chunks = this.createChunks(file);
      this.log('已分片：' + this.chunks.length + ' 片，单片 ' + this.fmtSize(CHUNK_SIZE));
      this.prepare();
    },
    createChunks (file) {
      const chunks = [];
      for (let start = 0; start < file.size; start += CHUNK_SIZE) {
        chunks.push({
          index: chunks.length,
          blob: file.slice(start, start + CHUNK_SIZE),
          size: Math.min(CHUNK_SIZE, file.size - start)
        });
      }
      return chunks;
    },
    readBlob (blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });
    },
    // hash 计算 + 秒传检查 + 断点续传探测
    async prepare () {
      // 1. SparkMD5 分片增量计算
      const spark = new SparkMD5.ArrayBuffer();
      for (let i = 0; i < this.chunks.length; i++) {
        const buf = await this.readBlob(this.chunks[i].blob);
        spark.append(buf);
        this.hashProgress = Math.round(((i + 1) / this.chunks.length) * 100);
      }
      this.fileHash = spark.end();
      this.log('hash 计算完成：' + this.fileHash);
      try {
        // 2. 秒传检查
        const check = await this.api('/upload/check?hash=' + this.fileHash);
        if (check.exists) {
          this.instantHit = true;
          this.chunks.forEach((c) => {
            this.$set(this.uploadedMap, c.index, true);
            this.$set(this.chunkLoaded, c.index, c.size);
          });
          this.log('秒传命中，跳过上传');
          return;
        }
        // 3. 断点续传：标记服务端已有的分片
        const progress = await this.api('/upload/progress?hash=' + this.fileHash);
        if (progress.uploaded && progress.uploaded.length) {
          this.resumedCount = progress.uploaded.length;
          progress.uploaded.forEach((i) => {
            const chunk = this.chunks[i];
            if (chunk) {
              this.$set(this.uploadedMap, i, true);
              this.$set(this.chunkLoaded, i, chunk.size);
            }
          });
          this.log('断点续传：跳过已上传的 ' + this.resumedCount + ' 片');
        }
      } catch (err) {
        this.log('服务不可用（' + err.message + '），请先运行 npm run upload:server');
      }
    },
    api (path, options) {
      return fetch(BASE_URL + path, options).then((res) => res.json());
    },
    async startUpload () {
      if (!this.file || this.uploading) return;
      this.uploading = true;
      this.paused = false;
      const pending = this.chunks.filter((c) => !this.uploadedMap[c.index]);
      this.log('开始上传，待传 ' + pending.length + ' 片，并发 ' + CONCURRENT + ' 路');
      const pool = [];
      for (const chunk of pending) {
        if (this.paused) break;
        const task = this.uploadChunk(chunk).catch(() => {}).then(() => {
          const i = pool.indexOf(task);
          if (i > -1) pool.splice(i, 1);
        });
        pool.push(task);
        // 池满：等任一请求结束腾出空位
        if (pool.length >= CONCURRENT) {
          await Promise.race(pool);
        }
      }
      await Promise.all(pool);
      this.uploading = false;
      if (!this.paused && this.allDone) {
        await this.mergeFile();
      }
    },
    uploadChunk (chunk) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', BASE_URL + '/upload/chunk?hash=' + this.fileHash + '&index=' + chunk.index);
        xhr.setRequestHeader('Content-Type', 'application/octet-stream');
        xhr.upload.onprogress = (e) => {
          this.$set(this.chunkLoaded, chunk.index, e.loaded);
        };
        xhr.onload = () => {
          this.$set(this.uploadedMap, chunk.index, true);
          this.$set(this.chunkLoaded, chunk.index, chunk.size);
          this.log('分片 ' + chunk.index + ' 完成（' + this.fmtSize(chunk.size) + '）');
          resolve();
        };
        xhr.onerror = () => reject(new Error('chunk ' + chunk.index + ' failed'));
        xhr.onabort = () => reject(new Error('aborted'));
        this.xhrMap[chunk.index] = xhr;
        xhr.send(chunk.blob);
      });
    },
    pause () {
      this.paused = true;
      Object.keys(this.xhrMap).forEach((i) => {
        this.xhrMap[i].abort();
      });
      this.xhrMap = {};
      this.log('已暂停，在途请求已中断');
    },
    async mergeFile () {
      this.log('全部分片到齐，发起合并请求');
      try {
        const data = await this.api(
          '/upload/merge?hash=' + this.fileHash +
          '&filename=' + encodeURIComponent(this.file.name),
          { method: 'POST' }
        );
        if (data.ok) {
          this.result = data;
          this.log('合并完成：' + data.filename);
        } else {
          this.log('合并失败：' + (data.error || 'unknown'));
        }
      } catch (err) {
        this.log('合并请求失败：' + err.message);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.file-picker {
  display: flex;
  align-items: center;
  gap: 12px;

  .pick-btn {
    position: relative;
    display: inline-block;
    padding: 8px 20px;
    background: #1890ff;
    color: #fff;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;

    &:hover {
      background: #40a9ff;
    }

    input {
      position: absolute;
      left: -9999px;
    }
  }

  .file-meta {
    font-size: 13px;
    color: #555;
  }
}

.chunk-info {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  .tip {
    font-size: 12px;
    color: #999;
  }
}

.hash-result {
  font-size: 13px;

  .label {
    color: #888;
  }

  code {
    padding: 2px 8px;
    background: #f5f5f5;
    border-radius: 3px;
    font-size: 12px;
    color: #1890ff;
  }
}

.flag-row {
  margin-top: 10px;
}

.empty-tip {
  font-size: 13px;
  color: #bbb;
}

.toolbar {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.stat {
  margin: 10px 0 14px;
  font-size: 13px;
  color: #666;
}

.chunk-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;

  .cell {
    width: 34px;
    height: 24px;
    line-height: 24px;
    text-align: center;
    font-size: 11px;
    border-radius: 3px;
    color: #fff;

    &.pending {
      background: #d9d9d9;
      color: #888;
    }

    &.active {
      background: #1890ff;
    }

    &.done {
      background: #52c41a;
    }
  }
}

.legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;

  .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    margin-right: 4px;

    &.pending { background: #d9d9d9; }
    &.active { background: #1890ff; }
    &.done { background: #52c41a; }
  }
}

.logs {
  max-height: 150px;
  overflow-y: auto;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;

  p {
    margin: 2px 0;
    line-height: 1.6;
  }
}

.result-path {
  margin: 10px 0 0;
  font-size: 12px;
  color: #999;
}

.point-list {
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  line-height: 2;
  color: #555;
}
</style>
