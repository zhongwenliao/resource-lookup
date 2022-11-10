export const myUrl = (url)=>{
	return new Promise((resolve,reject)=>{
		uni.request({
			url: url,
			method: 'GET',
			responseType: 'arraybuffer',
			success: res => {
			var base64 = wx.arrayBufferToBase64(res.data); //把arraybuffer转成base64
			this.ImgUrl = base64
			}
		})
	})
}