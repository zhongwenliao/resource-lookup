<template>
  <div>
    <div id="qrcode"></div>
    <button @click="handleCreatQrCode">生成二维码</button>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
export default {
  data() {
    return {}
  },
  created() {},
  methods: {
    handleCreatQrCode() {
      new QRCode(document.getElementById('qrcode'), {
        text: 'https://maimai.cn/activity/sms_landingpage?scheme=taoumaimai%3A%2F%2Fopenwebview%3Fid%3Dhttps%253A%252F%252Fmaimai.cn%252Fgrowth%252Fold_colleague_find%253Fcid%253D10297%2526fr%253Dsms%26touch_msg_id%3D63880eb0279753bee68c1d91&touch_msg_id=63880eb0279753bee68c1d91&sms_analytics=%7B%22tag%22%3A%22recall_recent_company_leaving_colleague_list_increase_2_0%22%2C%22emobile%22%3A%22132LbOCpi%2FRjuxhTfjcynUDqw%3D%3D%22%7D', // 需要转换为二维码的内容
        width: 100,
        height: 100,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    }
  }
}
</script>
