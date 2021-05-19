<template>
	<view>
		<navigationbar :isBack="true" title="血压仪" />
		<view class="cu-bar bg-white margin radius shadow">
			<view class="action">
				<text class="cuIcon-titles" :class="device ? 'text-green' : 'text-red'" />
				血压仪
			</view>
			<button class="cu-btn margin-right radius" :class="device?'bg-green':''"
				@tap="show = true">{{device?device.name:'请选择'}}</button>
		</view>
		<ble-modal v-model="show" @connect="connect" />
		<view class="cu-list menu bg-white shadow sm-border radius margin">
			<view class="cu-item">
				<view class="content">动态血压值：</view>
				<view class="right">0</view>
			</view>
			<view class="cu-item">
				<view class="content">收缩压值：</view>
				<view class="right">0</view>
			</view>
			<view class="cu-item">
				<view class="content">舒张压值：</view>
				<view class="right">0</view>
			</view>
			<view class="cu-item">
				<view class="content">脉搏值：</view>
				<view class="right">0</view>
			</view>
		</view>
		<view class="flex justify-center" style="position: fixed;bottom: 80rpx;width: 100%;">
			<view class="outter-circle">
				<button class="parts bg-blue cu-btn shadow">
					<text class="rotate">开始测量</text>
				</button>
				<button class="parts bg-green cu-btn shadow">
					<text class="rotate">上传数据</text>
				</button>
				<button class="parts bg-cyan cu-btn shadow">
					<text class="rotate">停止上传</text>
				</button>
				<button class="parts bg-orange cu-btn shadow">
					<text class="rotate">停止测量</text>
				</button>
				<button class="circle cu-btn bg-red">
					<text class="rotate">关机</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import common from '@/common/common.js';
	export default {
		data() {
			return {
				show: false,
				device: null
			}
		},
		onLoad() {
			common.showToast('该功能暂未完善');
		},
		methods: {
			// 连接设备
			async connect(item) {
				try {
					await this.$store.dispatch('createBLEConnection', item)
					var res = await this.$store.dispatch('getSphygmomanometerServer', item.deviceId),
						list = Object.assign(item, res)
					this.device = list
				} catch (err) {}
			},
			// 测量
			measure() {

			}
		}
	}
</script>

<style>
	.outter-circle {
		position: relative;
		width: 500rpx;
		height: 500rpx;
		border-radius: 100%;
		transform-origin: center;
		transform: rotate(45deg);
	}

	.parts {
		position: relative;
		float: left;
		width: 200rpx;
		height: 200rpx;
		line-height: 200rpx;
		text-align: center;
		margin: 20rpx;
		padding: 0;
		border-radius: 30rpx;
	}

	.circle {
		position: absolute;
		top: 140rpx;
		left: 130rpx;
		width: 200rpx;
		height: 200rpx;
		line-height: 180rpx;
		text-align: center;
		border-radius: 50%;
		padding: 0;
	}

	.rotate {
		transform: rotate(-45deg);
	}
</style>
