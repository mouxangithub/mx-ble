<template>
	<view>
		<navigationbar :isBack="true" title="电子秤" />
		<view class="cu-bar bg-white margin radius shadow">
			<view class="action">
				<text class="cuIcon-titles" :class="device ? 'text-green' : 'text-red'" />
				电子秤
			</view>
			<button class="cu-btn margin-right radius" :class="device?'bg-green':''"
				@tap="show = true">{{device?device.name:'请选择'}}</button>
		</view>
		<ble-modal v-model="show" @connect="connect" />
		<view class="flex justify-center align-center" style="height: 68vh;">
			<view class="cit bg-white shadow">
				<image v-if="show" class="charts" :src="chartsimg" />
				<canvas :style="show?'position: fixed;left: 10000rpx;':''" canvas-id="balance" id="balance"
					class="charts" />
			</view>
		</view>
		<button class="cu-btn bottom lg bg-gradual-blue shadow radius" @tap="changeGaugeData(0)">重置</button>
	</view>
</template>

<script>
	import uCharts from '@/common/u-charts.js';
	import common from '@/common/common.js';
	let _self,
		balance = null;
	/**
	 * ArrayBuffer转16进度字符串
	 * @param {Buffer} abValue
	 */
	function getWeight(cpcl) {
		let characteristicValue = ab2hex(cpcl);
		let strValue = hexCharCodeToStr(characteristicValue)
		return strValue
	}

	function ab2hex(buffer) {
		let hexArr = Array.prototype.map.call(
			new Uint8Array(buffer),
			bit => {
				return ('00' + bit.toString(16)).slice(-2)
			}
		)
		return hexArr.join('');
	}

	function hexCharCodeToStr(hexCharCodeStr) {
		var trimedStr = hexCharCodeStr.trim();
		var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
		var len = rawStr.length;
		if (len % 2 !== 0) {
			return "Illegal Format ASCII Code!";
		}
		var curCharCode;
		var resultStr = [];
		for (var i = 0; i < len; i = i + 2) {
			curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
			resultStr.push(String.fromCharCode(curCharCode));
		}
		return resultStr.join("");
	}
	export default {
		data() {
			return {
				show: false,
				device: null,
				paired: [],
				weight: '0kg',
				chartsimg: ''
			};
		},
		onLoad() {
			// 初始化图标
			this.showGauge();
			// 转换成图片
			balance.addEventListener('renderComplete', () => {
				this.canvasToTempFilePath()
			});
		},
		methods: {
			// 打开设备弹窗搜索蓝牙
			opble() {
				this.show = true
			},
			// 连接设备
			async connect(item) {
				try {
					// 目前作者只测试了山星盛的蓝牙电子秤，所以此处先写死，如有其他厂商的可自行更改研究
					var {
						serviceId,
						characteristicId
					} = require('@/demo/sxsBalance.js')
					await this.$store.dispatch('createBLEConnection', item)
					await this.$store.dispatch('checkDeviceService', {
						deviceId: item.deviceId,
						serviceId,
						characteristicId
					})
					item.serviceId = serviceId
					item.characteristicId = characteristicId
					this.device = item
					this.notifyBLECharacteristicValueChange(item)
				} catch (err) {}
			},
			// 监听重量
			async notifyBLECharacteristicValueChange(item) {
				let self = this;
				try {
					// 启用notify，必须先启用notify才能调用onBLECharacteristicValueChange
					await this.$store.dispatch('openNotify', {
						deviceId: item.deviceId,
						serviceId: item.serviceId,
						characteristicId: item.characteristicId
					})
					uni.onBLECharacteristicValueChange(function(res) {
						var weight = getWeight(res.value);
						self.weight = weight
						self.changeGaugeData(parseFloat(weight));
					});
				} catch (err) {
					common.showToast('监听重量异常');
				}
			},
			// 初始化图表
			showGauge() {
				var weight = this.weight
				balance = new uCharts({
					$this: _self,
					canvasId: 'balance',
					type: 'gauge',
					fontSize: 11,
					title: {
						name: weight,
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
							width: uni.upx2px(30), //仪表盘背景的宽度
							startAngle: 0.75, // 仪表盘起始角度
							endAngle: 0.25, // 仪表盘结束角度
							startNumber: 0, // 仪表盘起始数值
							endNumber: 1500, // 仪表盘结束数值
							splitLine: {
								// 仪表盘刻度线配置
								fixRadius: 0, // 仪表盘刻度线径向偏移量
								splitNumber: 15, // 仪表盘刻度线分段总数量
								width: uni.upx2px(30), //仪表盘背景的宽度
								color: '#FFFFFF', // 仪表盘分割线颜色
								childNumber: 5, // 仪表盘子刻度线数量
								childWidth: uni.upx2px(30) * 0.4 //仪表盘背景的宽度
							},
							pointer: {
								// 仪表盘指针配置
								width: uni.upx2px(30) * 0.8, //指针宽度
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
						data: parseFloat(weight)
					}],
					animation: true,
					width: uni.upx2px(500),
					height: uni.upx2px(500),
					dataLabel: true
				});
			},
			// 更新图表数据
			changeGaugeData(weight) {
				balance.updateData({
					series: [{
						name: '重量',
						data: weight / 1500
					}],
					title: {
						name: weight + 'kg',
						offsetY: 60
					}
				});
			},
			// 保存转换成图片
			canvasToTempFilePath() {
				uni.canvasToTempFilePath({
					canvasId: 'balance',
					success: res => {
						this.chartsimg = res.tempFilePath
					}
				}, _self);
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
