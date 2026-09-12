<template>
  <div class="license-gate">
    <!-- 试用提示条:试用期内顶部常驻,显示剩余天数 -->
    <div v-if="status === 'trial'" class="trial-bar">
      <i class="el-icon-time trial-icon"></i>
      <span>试用版 · 剩余 <b>{{ state.daysLeft }}</b> 天(至 {{ trialEndText }})</span>
      <el-button type="text" class="activate-link" @click="openDialog">输入授权码激活</el-button>
    </div>

    <!-- 主内容:浏览器模式 / 试用中 / 已激活 才渲染 -->
    <template v-if="status === 'browser' || status === 'trial' || status === 'activated'">
      <slot></slot>
    </template>

    <!-- 过期遮罩:全屏激活界面,不渲染主功能 -->
    <div v-if="status === 'expired'" class="gate-mask">
      <div class="gate-card">
        <div class="gate-icon"><i class="el-icon-lock"></i></div>
        <h2 class="gate-title">试用期已结束</h2>
        <p class="gate-desc">
          <template v-if="state.tampered">检测到授权数据异常(状态文件被修改),请输入授权码重新激活。</template>
          <template v-else>本软件提供 3 天免费试用,试用期已于 {{ trialEndText }} 到期。<br>请输入授权码解锁完整功能。</template>
        </p>
        <div class="machine-row">
          <span class="machine-label">本机机器码</span>
          <code class="machine-code">{{ state.machineCode }}</code>
          <el-button size="mini" icon="el-icon-document-copy" @click="copyMachineCode">复制</el-button>
        </div>
        <el-input v-model="inputCode" placeholder="请输入授权码,如 ABCDE-FGHIJ-KLMNO-PQRST-UVWXY"
          class="code-input" clearable @keyup.enter.native="doActivate"></el-input>
        <p v-if="activateErr" class="activate-err"><i class="el-icon-warning"></i> {{ activateErr }}</p>
        <el-button type="primary" class="activate-btn" :loading="activating" @click="doActivate">立即激活</el-button>
        <p class="gate-tip">请将上方机器码发送给软件提供方,获取与该机器绑定的授权码。</p>
      </div>
    </div>

    <!-- 试用期内主动激活:对话框(表单与遮罩共用数据/方法) -->
    <el-dialog title="软件激活" :visible.sync="dialogVisible" width="520px" :close-on-click-modal="false"
      @closed="activateErr = ''">
      <div class="dlg-body">
        <p class="machine-label">本机机器码</p>
        <div class="machine-row">
          <code class="machine-code">{{ state.machineCode }}</code>
          <el-button size="mini" icon="el-icon-document-copy" @click="copyMachineCode">复制</el-button>
        </div>
        <el-input v-model="inputCode" placeholder="请输入授权码" class="code-input" clearable
          @keyup.enter.native="doActivate"></el-input>
        <p v-if="activateErr" class="activate-err"><i class="el-icon-warning"></i> {{ activateErr }}</p>
        <p class="gate-tip">请将机器码发送给软件提供方,获取与该机器绑定的授权码;激活后永久有效。</p>
      </div>
      <template slot="footer">
        <el-button @click="dialogVisible = false">暂不激活</el-button>
        <el-button type="primary" :loading="activating" @click="doActivate">立即激活</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
/**
 * 授权门卫组件:包裹全部业务内容
 *
 *   browser   浏览器模式(npm run dev,无 Electron 主进程)→ 不做限制,方便开发调试
 *   trial     试用期内 → 顶部提示条 + 正常使用
 *   activated 已激活   → 正常使用
 *   expired   试用期过 → 全屏激活界面,主功能不渲染
 *
 * 状态与校验全部在 Electron 主进程完成(license.js),渲染层只展示与提交。
 */
export default {
  name: 'LicenseGate',
  data () {
    return {
      status: 'loading', // loading / browser / trial / activated / expired
      state: {}, // 主进程返回的授权状态
      inputCode: '', // 用户输入的授权码
      activateErr: '', // 激活错误提示
      activating: false, // 激活请求中
      dialogVisible: false // 试用期内主动激活对话框
    };
  },
  computed: {
    /** 试用截止日期文本(YYYY-MM-DD) */
    trialEndText () {
      const d = this.state.trialEndDate;
      if (!d) return '';
      const pad = n => (n < 10 ? '0' + n : '' + n);
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }
  },
  mounted () {
    if (window.electronAPI && window.electronAPI.getLicenseState) {
      window.electronAPI.getLicenseState().then(st => {
        this.state = st || {};
        this.status = (st && st.status) || 'browser';
      }).catch(() => { this.status = 'browser'; });
    } else {
      // 浏览器模式:无主进程,跳过授权
      this.status = 'browser';
    }
  },
  methods: {
    /** 打开试用期内激活对话框 */
    openDialog () {
      this.activateErr = '';
      this.dialogVisible = true;
    },
    /** 复制机器码到剪贴板(file:// 下 clipboard API 可能受限,execCommand 兜底) */
    copyMachineCode () {
      const text = this.state.machineCode || '';
      const done = () => this.$message.success('机器码已复制');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => this.copyFallback(text, done));
      } else {
        this.copyFallback(text, done);
      }
    },
    copyFallback (text, done) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { this.$message.warning('复制失败,请手动选中复制'); }
      document.body.removeChild(ta);
    },
    /** 提交激活:主进程校验授权码与机器码绑定关系 */
    async doActivate () {
      if (this.activating) return;
      const code = this.inputCode.trim();
      if (!code) {
        this.activateErr = '请输入授权码';
        return;
      }
      this.activating = true;
      this.activateErr = '';
      try {
        const res = await window.electronAPI.activateLicense(code);
        if (res && res.ok) {
          this.status = 'activated';
          this.dialogVisible = false;
          this.$message.success('激活成功,感谢使用!');
        } else {
          this.activateErr = (res && res.error) || '激活失败,请重试';
        }
      } catch (e) {
        this.activateErr = '激活失败:' + (e && e.message ? e.message : '未知错误');
      } finally {
        this.activating = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
// 试用提示条:顶部浅黄横条
.trial-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 16px;
  font-size: 13px;
  color: #8c6d1f;
  background: #fdf6ec;
  border-bottom: 1px solid #f5dab1;

  .trial-icon {
    font-size: 14px;
  }

  b {
    color: #e6a23c;
    font-size: 15px;
  }

  .activate-link {
    margin-left: 10px;
    padding: 0;
    color: #e6a23c;
    font-weight: 600;

    &:hover {
      color: #cf9236;
    }
  }
}

// 过期遮罩:全屏毛玻璃 + 居中激活卡片
.gate-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
}

.gate-card {
  width: 460px;
  max-width: calc(100vw - 48px);
  padding: 36px 40px 28px;
  text-align: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.gate-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  font-size: 30px;
  color: #e6a23c;
  background: #fdf6ec;
  border-radius: 50%;
}

.gate-title {
  margin: 0 0 10px;
  font-size: 20px;
  color: #303133;
}

.gate-desc {
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 1.8;
  color: #909399;
}

// 机器码展示行:等宽字体 + 复制按钮
.machine-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.machine-label {
  font-size: 12px;
  color: #909399;
}

.machine-code {
  padding: 5px 12px;
  font-family: Consolas, monospace;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #409eff;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  user-select: all;
}

.code-input {
  margin-bottom: 4px;

  /deep/ .el-input__inner {
    font-family: Consolas, monospace;
    letter-spacing: 1px;
  }
}

.activate-err {
  margin: 8px 0 0;
  font-size: 12px;
  color: #f5222d;
  text-align: left;
}

.activate-btn {
  width: 100%;
  margin-top: 16px;
}

.gate-tip {
  margin: 14px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: #c0c4cc;
}

// 对话框内表单
.dlg-body {
  .machine-row {
    justify-content: flex-start;
    margin-bottom: 12px;
  }
}
</style>
