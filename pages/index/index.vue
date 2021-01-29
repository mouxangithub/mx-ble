<template name="components">
	<view>
		<scroll-view scroll-y class="page">
			<image src="/static/bgs.png" mode="widthFix" class="response"></image>
			<!-- <view style="position: fixed;font-size: 100rpx;top: 160rpx;width: 100%;text-align: center;color: #fff;">蓝牙模块</view> -->
			<view class="nav-list">
				<navigator hover-class='none' :url="'/pages/' + item.name + '/' + item.name" class="nav-li" navigateTo :class="'bg-'+item.color"
				 :style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]" v-for="(item,index) in elements" :key="index">
					<view class="nav-title">{{item.title}}</view>
					<view class="nav-name">{{item.name}}</view>
					<text :class="'cuIcon-' + item.cuIcon"></text>
				</navigator>
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				elements: [{
						title: '山星盛',
						name: 'sxs',
						color: 'blue',
						cuIcon: 'shake'
					},
					{
						title: '蓝牙设置',
						name: 'settings',
						color: 'red',
						cuIcon: 'settings'
					}
				],
			};
		}
	}
</script>

<style>
	.page {
		height: 100vh;
	}
</style>
