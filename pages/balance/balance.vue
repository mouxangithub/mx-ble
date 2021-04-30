<template>
	<view>
		<navigationbar :isBack="true" title="电子秤" />
		<view class="cu-bar bg-white margin radius shadow">
			<view class="action">
				<text class="cuIcon-titles" :class="[paired[0] && paired[0].status ? 'text-green' : 'text-red']" />
				电子秤
			</view>
			<button class="cu-btn margin-right radius" @tap="opble">请选择</button>
		</view>
		<view class="flex justify-center align-center" style="height: 70vh;">
			<view class="cit bg-white shadow">
				<canvas canvas-id="canvasGauge" id="canvasGauge" class="charts" />
			</view>
		</view>
		<button class="cu-btn bottom lg bg-gradual-blue shadow radius" @tap="changeGaugeData(0)">重置</button>
		<ble-modal v-model="show" />
	</view>
</template>

<script>
	import uCharts from '@/common/u-charts/u-charts.js';
	let _self,
		canvasObj = {}
	export default {
		data() {
			return {
				show: false,
				paired: [],
				weight: '0kg',
				cWidth: uni.upx2px(500),
				cHeight: uni.upx2px(500),
				gaugeWidth: uni.upx2px(30)
			};
		},
		onLoad() {
			_self = this;
		},
		onReady() {
			this.showGauge();
		},
		watch: {
			weight(e) {
				this.changeGaugeData(parseFloat(e));
			}
		},
		methods: {
			opble() {
				this.show = true
			},
			// // 检测重量
			// async notifyBLECharacteristicValueChange(item) {
			// 	let self = this;
			// 	try {
			// 		// 检测服务
			// 		await blews.getBLEDeviceServices(item.deviceId, item.serviceId);
			// 		await blews.getBLEDeviceCharacteristics(item.deviceId, item.serviceId, item.characteristicId);
			// 		// 启用notify，必须先启用notify才能调用onBLECharacteristicValueChange
			// 		await blews.notifyBLECharacteristicValueChange(item.deviceId, item.serviceId, item
			// 			.characteristicId);
			// 		uni.onBLECharacteristicValueChange(function(res) {
			// 			self.weight = blews.getWeight(res.value);
			// 		});
			// 	} catch (err) {
			// 		uni.showToast({
			// 			title: e.errMsg,
			// 			icon: 'none',
			// 			position: 'bottom'
			// 		});
			// 	}
			// },
			showGauge() {
				canvasObj['canvasGauge'] = new uCharts({
					$this: _self,
					canvasId: 'canvasGauge',
					type: 'gauge',
					fontSize: 11,
					title: {
						name: '0kg',
						offsetY: 60
					},
					subtitle: {
						name: '重量',
						color: '#666666',
						offsetY: 60
					},
					extra: {
						// 仪表盘相关配置
						gauge: {
							type: 'default', // 仪表盘样式
							width: _self.gaugeWidth, //仪表盘背景的宽度
							startAngle: 0.75, // 仪表盘起始角度
							endAngle: 0.25, // 仪表盘结束角度
							startNumber: 0, // 仪表盘起始数值
							endNumber: 1500, // 仪表盘结束数值
							splitLine: {
								// 仪表盘刻度线配置
								fixRadius: 0, // 仪表盘刻度线径向偏移量
								splitNumber: 15, // 仪表盘刻度线分段总数量
								width: _self.gaugeWidth, //仪表盘背景的宽度
								color: '#FFFFFF', // 仪表盘分割线颜色
								childNumber: 5, // 仪表盘子刻度线数量
								childWidth: _self.gaugeWidth * 0.4 //仪表盘背景的宽度
							},
							pointer: {
								// 仪表盘指针配置
								width: _self.gaugeWidth * 0.8, //指针宽度
								color: 'auto'
							}
						}
					},
					background: '#FFFFFF',
					categories: [{
							value: 0.2,
							color: '#1890ff'
						},
						{
							value: 0.8,
							color: '#2fc25b'
						},
						{
							value: 1,
							color: '#f04864'
						}
					],
					series: [{
						name: '重量',
						data: 0
					}],
					animation: true,
					width: _self.cWidth,
					height: _self.cHeight,
					dataLabel: true
				});
			},
			changeGaugeData(weight) {
				canvasObj['canvasGauge'].updateData({
					series: [{
						name: '重量',
						data: weight / 1500
					}],
					title: {
						name: weight + 'kg',
						offsetY: 60
					}
				});
			}
		}
	};
</script>
<style>
	.cit {
		border-radius: 50%;
		padding: 30rpx;
	}

	.charts {
		width: 500rpx;
		height: 500rpx;
		background-color: #ffffff;
		border-radius: 50%;
	}
</style>
