<template>
	<view class="radio u-line-1" :class="{'radio-width-default':widthDefault}" :style="checked?activeStyle :itemStyle" @click="handleChange">
		{{label}}
	</view>
</template>

<script>
	
	/**
 * 防抖
 * @param {*} fun 
 * @param {*} delay 
 * @param {*} immediate 
 */
const debounce = function (fun, delay, immediate) {
  var timer, lasttime, context, arg
  var later = function () {
    var now = new Date().getTime(),
      l = now - lasttime
    if (l < delay && l >= 0) {
      clearTimeout(timer)
      timer = setTimeout(later, delay - l)
    } else {
      clearTimeout(timer)
      timer = null
      if (!immediate) {
        fun.apply(context, arg)
        if (!timer) context = arg = null
      }
    }
  }
  return function () {
    context = this
    arg = arguments
    lasttime = new Date().getTime()
    var callNow = immediate && !timer
    if (!timer) timer=setTimeout(later, delay)
    if (callNow) {
      fun.apply(context, arg)
      context = arg = null
    }
  }
}
	export default {
		props: {
			label: {
				type: String,
				default: ''
			},
			index: {
				default: null
			},
			value: {
				default: null,
			},
			checked: {
				type: [Boolean, Number],
				default: false
			},
			background:{
				type: String,
				default: '#f3c7c7'
			},
			itemBackground:{
				type: String,
				default: '#F6F6F6'
			},
			borderColor:{
				type: String,
				default: '#3c7ef6'
			},
			itemColor:{
				type: String,
				default: '#333333'
			},
			color:{
				type: String,
				default: '#e35d5d'
			}
		},
		computed: {
			widthDefault() {
				return this.label.length <= 3
			},
			activeStyle() {
				return `background: ${this.background} 	!important;color: ${this.color};border-color: ${this.borderColor};`
			},
			itemStyle() {
				return `background: ${this.itemBackground};color: ${this.itemColor};`
			}
		},
		data() {
			return {

			};
		},
		methods: {
			handleChange: debounce(handleChange, 200,true)
		}
	}

	function handleChange() {
		this.$emit('change', this.value,this.index)
	}
</script>

<style scoped>
	.radio {
		display: inline-block;
		height: 60upx;
		line-height: 60upx;
		padding: 0 22upx;
		border-radius: 10upx;
		font-size: 26upx;
		box-sizing: border-box;
		border: 1px solid #c3c3c3;
	}

	.radio:not(:last-child) {
		margin: 0 10upx 30upx 10upx;
	}


	.radio-width-default {
		width: 120upx;
		text-align: center;
		padding: 0;
	}
</style>
