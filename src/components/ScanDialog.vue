<template>
  <!-- 摄像头扫码弹层：单码模式识别成功自动停流关闭并抛出码值；连续模式（绑定页）不停流持续识别 -->
  <el-dialog title="摄像头扫码" :visible="visible" width="420px" append-to-body
    :close-on-click-modal="!continuous"
    @update:visible="$emit('update:visible', $event)" @closed="stopCamera">
    <video ref="scanVideo" class="scan-video" muted playsinline></video>
    <p v-if="cameraErr" class="camera-err"><i class="el-icon-warning"></i> {{ cameraErr }}</p>
    <template v-else>
      <p class="camera-tip">{{ tip }}</p>
      <!-- 连续模式进度反馈：操作员据此确认每个码都被取到 -->
      <p v-if="continuous && scanCount" class="scan-count">本次已识别 {{ scanCount }} 个，最近 {{ lastCodePreview }}</p>
    </template>
  </el-dialog>
</template>

<script>
/**
 * 摄像头扫码公共组件
 *
 * getUserMedia 后置摄像头 → <video> → 每 200ms 抽帧到 <canvas> → jsQR 识别。
 * 两种模式：
 *   - 单码模式（默认，溯源查询页用）：识别成功即停流、关闭弹层并抛出码值（@scan）；
 *   - 连续模式（continuous，绑定页用）：不停流不关弹层，识别一个抛一个，
 *     操作员逐个扫码逐个绑定，全程无需点击。冷却期 + 同码抑制防止同一实物
 *     在取景框内的连续帧被当成多次扫码。
 * 摄像头不可用（权限被拒/无设备/环境不支持）时给出原因提示，由父页面降级为手动输入。
 * 纯前端识别，码值不离开本机。
 */
import jsQR from 'jsqr';

// 摄像头抽帧识别间隔（ms）
const SCAN_INTERVAL_MS = 200;
// 连续模式识别成功后的冷却期（ms）：留给操作员移开已绑实物，避免连续帧重复触发
const SCAN_COOLDOWN_MS = 1000;
// 连续模式同码抑制窗口（ms）：同一实物仍在取景框内时不重复上报；超窗后同码可再触发（支持删绑后重扫）
const DUP_SAME_MS = 3000;

export default {
  name: 'ScanDialog',
  props: {
    // 弹层显隐（父组件 :visible.sync 双向绑定）
    visible: { type: Boolean, default: false },
    // 取景提示文案（绑定页与查询页措辞不同）
    tip: { type: String, default: '将二维码对准取景框，识别成功后自动关闭' },
    // 连续扫码模式（绑定页用）：识别成功不停流不关弹层，持续识别下一码
    continuous: { type: Boolean, default: false }
  },
  data () {
    return {
      cameraErr: '', // 摄像头不可用原因，空串表示正常取景中
      scanCount: 0, // 连续模式本次会话已识别码数（进度反馈）
      lastCode: '' // 连续模式最近识别的码值（进度反馈）
    };
  },
  computed: {
    /** 最近码值预览（超长截断，进度行宽度有限） */
    lastCodePreview () {
      const s = this.lastCode || '';
      return s.length > 24 ? s.slice(0, 24) + '…' : s;
    }
  },
  watch: {
    // 弹层每次打开重新取景（上次关闭已停流）；关闭即停流释放摄像头
    visible (v) {
      if (v) {
        this.cameraErr = '';
        this.scanCount = 0;
        this.lastCode = '';
        this._lastCode = null; // 连续模式同码抑制状态（无需响应式）
        this._lastScanAt = 0;
        this.$nextTick(() => this.startCamera());
      } else {
        this.stopCamera();
      }
    }
  },
  beforeDestroy () {
    this.stopCamera();
  },
  methods: {
    async startCamera () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.cameraErr = '当前环境不支持摄像头调用（需 https 页面或 Electron 环境）';
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        this._stream = stream;
        const video = this.$refs.scanVideo;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        this.startScanLoop();
      } catch (e) {
        this.cameraErr = this.cameraErrMsg(e);
      }
    },
    /** 每 200ms 抽帧到 canvas 交给 jsQR 识别，成功即停流回填并抛给父组件 */
    startScanLoop () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      this.stopScanTimer();
      this._scanTimer = setInterval(() => {
        const video = this.$refs.scanVideo;
        if (!video || video.readyState < 2 || !video.videoWidth) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let code = null;
        try {
          code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        } catch (e) {
          code = null;
        }
        if (code && code.data) {
          if (this.continuous) {
            // 连续模式：识别一个抛一个（绑定页扫码即绑定）；
            // 冷却期 + 同码抑制避免同一实物在框内的连续帧被当成多次扫码
            const now = Date.now();
            const inCooldown = this._lastScanAt && now - this._lastScanAt < SCAN_COOLDOWN_MS;
            const sameDup = code.data === this._lastCode && this._lastScanAt &&
              now - this._lastScanAt < DUP_SAME_MS;
            if (!inCooldown && !sameDup) {
              this._lastCode = code.data;
              this._lastScanAt = now;
              this.scanCount++;
              this.lastCode = code.data;
              this.$emit('scan', code.data);
            }
          } else {
            this.stopCamera();
            this.$emit('update:visible', false);
            this.$emit('scan', code.data);
          }
        }
      }, SCAN_INTERVAL_MS);
    },
    stopScanTimer () {
      if (this._scanTimer) {
        clearInterval(this._scanTimer);
        this._scanTimer = null;
      }
    },
    stopCamera () {
      this.stopScanTimer();
      if (this._stream) {
        this._stream.getTracks().forEach(t => t.stop());
        this._stream = null;
      }
    },
    cameraErrMsg (e) {
      const name = e && e.name;
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') return '摄像头权限被拒绝';
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return '未检测到可用摄像头';
      if (name === 'NotReadableError' || name === 'TrackStartError') return '摄像头被其他应用占用';
      return '摄像头启动失败：' + ((e && e.message) || '未知原因');
    }
  }
};
</script>

<style lang="less" scoped>
.scan-video {
  display: block;
  width: 100%;
  height: 315px;
  background: #000;
  border-radius: 6px;
}

.camera-tip {
  margin: 10px 0 0;
  font-size: 13px;
  color: #666;
  text-align: center;
}

.scan-count {
  margin: 6px 0 0;
  font-size: 12px;
  color: #389e0d;
  text-align: center;
}

.camera-err {
  margin: 10px 0 0;
  font-size: 13px;
  color: #cf1322;
  text-align: center;
}
</style>
