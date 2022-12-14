<template>
	<!-- <uni-base-page> -->
		<!-- <view style='padding-left:5px; padding-right: 5px;'>
			  <text>本隐私政策介绍本公司({{ company }})的隐私数据相关政策和惯例，这将涵盖我们如何收集、使用、处理、存储和/或披露那些通过本公司的移动App收集的关于您的个人信息。请你仔细阅读我们的隐私政策。
				<br/></text>
			  <br/>
			  <text id='id_text_title_one'>一、本公司如何收集您的个人信息</text>
			  <br/>
			  <text id='id_text_title_one_content1' class='indent'>个人信息是可用于唯一地识别或联系某人的数据。</text>
			  <br/>
			  <text id='id_text_title_one_content2' class='indent'>当您使用本公司的移动App({{ appName }})，注册用户过程中我们将会收集您的个人信息，如：电话号码。为了保护个人隐私，您不应提供除本公司特别要求之外的任何其它信息。</text>
			  <br/>
			  <br/>
			  <text id='id_text_title_two'>二、本公司如何使用您的个人信息</text>
			  <br/>
			  <text id='id_text_title_two_content1' class='indent'>1、通过您的个人信息，向您发送本公司移动App的服务信息。</text>
			  <br/>
			  <text id='id_text_title_two_content2' class='indent'>2、通过您的个人信息实现密码找回功能。</text>
			  <br/>
			  <text id='id_text_title_two_content3' class='indent'>3、除本公司发生重组、合并或出售，可将我们收集的一切个人信息转让给相关第三方外，本公司不会向任何无关第三方提供、出售、出租、分享或交易您的个人信息，除非事先得到您的许可，或该第三方和本公司单独或共同为您提供服务，且在该服务结束后，其将被禁止访问包括其以前能够访问的所有这些信息。</text>
			  <br/>
			  <br/>
			  <text id='id_text_title_three'>三、个人信息安全</text>
			  <br/>
			  <text id='id_text_title_three_content1' class='indent'>保证您的个人数据的安全对我们来说至关重要。当您在本公司的移动App中注册输入个人数据时，我们会利用安全套接字层技术 (SSL) 对这些信息进行加密。</text>
			  <br/>
			  <text id='id_text_title_three_content2' class='indent'>在数据传输和数据保管两个阶段里，我们会通过广为接受的行业标准（如防火墙、加密和数据隐私法律要求）来保护您向我们提交的信息。</text>
			  <br/>
			  <text id='id_text_title_three_content3' class='indent'>然而，没有任何一种互联网传输或电子存储方法是100%安全的。因此，尽管我们通过商业上可接受的方式来保护您的个人信息，但仍无法保证信息的绝对安全。</text>
			  <br/>
			  <br/>
			  <text id='id_text_title_four'>四、本公司会将个人信息保存多久</text>
			  <br/>
			  <text id='id_text_title_four_content' class='indent'>一般来说，本公司仅保留您的个人信息至履行收集目的所需的期限，同时将遵守适用法律规定的数据保留期限。</text>
			  <br/>
			  <br/>
			  <text id='id_text_title_five'>五、法律免责声明</text>
			  <br/>
			  <text id='id_text_title_five_content1' class='indent'>在法律要求的情况下，以及本公司认为必须披露与您有关的信息来保护本公司的法定权益和/或遵守司法程序、法院指令或适用于本公司的移动App的法律程序时，我们有权透露您的个人信息。</text>
			  <br/>
			  <text id='id_text_title_five_content2' class='indent'>如果本公司确定为了执行本公司的条款和条件或保护我们的经营，披露是合理必须的，则我们可披露与您有关的信息。</text>
			  <br/>
			  <br/>
			  <text id='id_text_title_six'>六、本隐私政策的更改</text>
			  <br/>
			  <text id='id_text_title_six_content1' class='indent'>如果决定更改隐私政策，我们会在本政策中、本公司网站中以及我们认为适当的位置发布这些更改，以便您了解我们如何收集、使用您的个人信息，哪些人可以访问这些信息，以及在什么情况下我们会透露这些信息。</text>
			  <br/>
			  <text id='id_text_title_six_content2' class='indent'>本公司保留随时修改本政策的权利，因此请经常查看。如对本政策作出重大更改，本公司会通过网站通知的形式告知。</text>
			  <br/>
			  <br/>
			  <view v-if="email">
				  <text id='id_text_title_seven'>七、遇到问题</text>
				  <br/>
				  <text id='id_text_title_seven_content' class='indent'>如果您对本政策有任何问题或投诉，请给我们发邮件到{{ email }}。</text>
			  </view>
		</view>
	</uni-base-page> -->
	<web-view :src="privacyUrl"></web-view>
</template>

<script>
	export default {
		data() {
			return {
				company: "",
				appName: "",
				email: "",
				privacyUrl: ""
			}
		},
		methods: {
			
		},
		computed: {
			title() {
				return this.$t("title");
			},
			companyConfig() {
				return this.$t("company");
			},
			appNameConfig() {
				return this.$t("app-name");
			}
		},
		onLoad(e) {
			/**
			 * e.index == 1 隐私政策
			 * e.index == 2 用户协议
			*/
		   let configParam = this.$getConfigParam();
		   if( e.index == 1 ) {
			   this.privacyUrl = configParam.h5Link + "privacy?appName=" + configParam.appName;
			   this.$setTitle(this.title["privacy-statement"] || "隐私协议");
		   }else {
			   this.privacyUrl = configParam.h5Link + "protocol?appName=" + configParam.appName;
			   // this.$setTitle(this.title["privacy-statement"] || "用户协议及隐私协议");  user-agreement
			   this.$setTitle(this.title["user-agreement"] || "用户协议");
		   }
			
		}
	}
</script>

<style>

</style>
