<template>
	<view>
		<image src="/static/bgs.png" mode="widthFix" class="response"></image>
		<scroll-view scroll-y style="height: 60vh;">
			<view class="nav-list">
				<navigator hover-class='none' :url="'/pages/' + item.name + '/' + item.name" class="nav-li" navigateTo
					:class="'bg-'+item.color" :style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]"
					v-for="(item,index) in elements" :key="index">
					<view class="nav-title">{{item.title}}</view>
					<view class="nav-name">{{item.name}}</view>
					<text :class="'mx-' + item.name"></text>
				</navigator>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				elements: [{
						title: '电子秤',
						name: 'balance',
						color: 'blue'
					},
					{
						title: '打印机',
						name: 'printer',
						color: 'green'
					},
					{
						title: '血压仪',
						name: 'sphygmomanometer',
						color: 'pink'
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
	.bottom {
		position: fixed;
		bottom: 10rpx;
		text-align: center;
		width: 100%;
		color: #9f9f9f;
	}
</style>
