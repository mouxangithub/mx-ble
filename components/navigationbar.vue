<template>
	<!-- 状态栏 -->
	<view class="cu-custom" :style="[{ height: CustomBar + 'px' }]">
		<view class="cu-bar fixed" :class="bgColor" :style="style">
			<view v-if="isBack" class="action border-custom customs">
				<text class="cuIcon-back" @tap="BackPage"></text>
				<text class="cuIcon-homefill" @tap="toHome"></text>
			</view>
			<view class="content" :style="[{ top: StatusBar + 'px' }]">
				<view>{{title}}</view>
			</view>
		</view>
	</view>
</template>
<script>
	export default {
		name: 'navigationbar',
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar
			};
		},
		computed: {
			style() {
				var StatusBar = this.StatusBar;
				var CustomBar = this.CustomBar;
				var bgImage = this.bgImage;
				var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				if (this.bgImage) {
					style = `${style}background-image:url(${bgImage});`;
				}
				return style;
			}
		},
		props: {
			bgColor: {
				type: String,
				default: "bg-gradual-blue"
			},
			isBack: {
				type: [Boolean, String],
				default: false
			},
			bgImage: {
				type: String,
				default: ''
			},
			title: {
				type: String,
				default: ''
			}
		},
		methods: {
			/**
			 * 返回上一页
			 */
			BackPage() {
				var pages = getCurrentPages()
				if (pages.length >= 2) {
					uni.navigateBack({
						delta: 1
					})
				} else {
					uni.showToast({
						title: '当前已是最后一页，请点击返回首页',
						icon: 'none',
						duration: 1000
					})
				}
			},
			/**
			 * 返回首页
			 */
			toHome() {
				var pages = getCurrentPages()
				if (pages[0].route == 'pages/index/index') {
					uni.navigateBack({
						delta: pages.length
					})
				} else {
					uni.redirectTo({
						url: '/pages/index/index'
					})
				}
			}
		}
	};
</script>

<style>
	.customs {
		width: 170rpx;
		height: 60rpx !important;
		margin-left: 20rpx !important;
	}
</style>
