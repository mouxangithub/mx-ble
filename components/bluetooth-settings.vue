<template>
	<view class="cu-modal drawer-modal justify-end" :class="show ? 'show' : ''" @tap="hideModal">
		<view class="cu-dialog bg-gray text-black basis-lg" @tap.stop="" :style="[{ top: CustomBar + 'px', height: 'calc(100vh - ' + CustomBar + 'px)' }]">
			<view class="cu-list menu margin-top margin-left-sm margin-right-sm r">
				<view class="cu-item">
					<view class="left">蓝牙</view>
					<switch @change="openBle" :class="isOpenBle ? 'checked' : ''" :checked="isOpenBle" />
				</view>
				<view class="cu-item">
					<view class="left">搜索</view>
					<button class="cu-btn bg-green" @tap="openbledd">{{ bledd ? '关闭' : '搜索' }}</button>
				</view>
			</view>
			<!-- 已配对设备 -->
			<view class="bg-white r margin-top margin-left-sm margin-right-sm" v-if="isOpenBle && paired.length > 0">
				<view class="cu-bar solid-bottom"><view class="action">已配对设备</view></view>
				<scroll-view scroll-y="true" style="max-height: 25vh;" class="r" show-scrollbar="true">
					<view class="cu-list menu text-left r">
						<view class="cu-item arrow" v-for="(item, index) in paired" :key="index" @tap="select_deviceId(item)">
							<view class="content">{{ item.name }}</view>
							<text class="right" :class="[item.status ? 'text-green cuIcon-roundcheckfill' : 'text-red cuIcon-roundclosefill']" />
						</view>
					</view>
				</scroll-view>
			</view>
			<!-- 可用设备 -->
			<view class="bg-white r margin-top margin-left-sm margin-right-sm" v-if="isOpenBle && bledd">
				<view class="cu-bar solid-bottom">
					<view class="action">可用设备</view>
					<view class="action"><view class="cu-load load-cuIcon" :class="bledd ? 'loading' : 'over'"></view></view>
				</view>
				<view class="padding-top padding-bottom" v-if="devicesList.length == 0 && bledd">正在搜索...</view>
				<scroll-view v-else scroll-y="true" style="max-height: 25vh;" class="r" show-scrollbar="true">
					<view class="cu-list menu text-left r">
						<view class="cu-item" v-for="(item, index) in devicesList" :key="index" @tap="select_deviceId(item)">
							<view class="content">{{ item.name }}</view>
							<text class="right text-blue cuIcon-roundaddfill" />
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import Bluetooth from '@/common/bluetooth.js';
let blews = new Bluetooth();
// 这个才是重点，得找厂商拿到对应功能服务的两个uuid，不然得自个一个一个试
let eqp = {
	name: 'FAYA', // 设备名称
	type: 'balance', // 设备类型
	manufacturer: '山星盛', // 厂商
	serviceId: "49535343-FE7D-4AE5-8FA9-9FAFD205E455", // 蓝牙特征值对应服务的 uuid
	characteristicId: "49535343-1E4D-4BD9-BA61-23C647249616" // 蓝牙特征值的 uuid
}
export default {
	name: 'bluetooth-settings',
	data() {
		return {
			CustomBar: this.CustomBar, // 状态栏高度
			isOpenBle: false, // 是否开启蓝牙
			bledd: false, // 是否启用蓝牙搜索
			devicesList: [], // 设备列表
			paired: [], // 已配对设备列表
			deviceId: '', // 选中的deviceId
			weight: 0 // 重量
		};
	},
	props: {
		show: {
			type: Boolean
		}
	},
	watch: {
		paired(e) {
			this.$emit('paired', e);
		}
	},
	created() {
		var paired = uni.getStorageSync('paired') || [];
		this.isOpenBle = uni.getStorageSync('isOpenBle') || false;
		if (this.isOpenBle) {
			this.openBluetoothAdapter();
			var self = this;
			uni.getConnectedBluetoothDevices({
				services: paired,
				success(res) {
					var devices = res.devices;
					for (var i = 0; i < devices.length; i++) {
						for (var s = 0; s < paired.length; s++) {
							if (paired[s].deviceId == devices[i].deviceId) {
								paired[s].status = true;
							}
						}
					}
					self.paired = paired;
				}
			});
		} else {
			this.paired = paired;
		}
	},
	methods: {
		// 打开蓝牙
		openBle(e) {
			if (e.detail.value) {
				this.openBluetoothAdapter();
			} else {
				this.closeBluetoothAdapter();
			}
		},
		// 初始化蓝牙
		async openBluetoothAdapter() {
			try {
				this.isOpenBle = blews.isOpenBle = await blews.openBluetoothAdapter();
				uni.showToast({
					title: '蓝牙开启成功',
					icon: 'none',
					position: 'bottom'
				});
			} catch (err) {
				this.isOpenBle = blews.isOpenBle = false;
				uni.showToast({
					title: `蓝牙初始化失败: ${err.errMsg}`,
					icon: 'none',
					position: 'bottom'
				});
			}
			uni.setStorageSync('isOpenBle', this.isOpenBle);
		},
		// 关闭蓝牙
		closeBluetoothAdapter() {
			blews.closeBluetoothAdapter();
			this.isOpenBle = this.bledd = blews.isOpenBle = false;
			this.paired = this.paired.map(item => ({
				...item,
				status: false
			}));
			uni.showToast({
				title: '蓝牙已关闭',
				icon: 'none',
				position: 'bottom'
			});
			uni.setStorageSync('isOpenBle', this.isOpenBle);
		},
		// 开启蓝牙搜索
		async openbledd(e) {
			if (!this.bledd) {
				try {
					await blews.startBluetoothDevicesDiscovery();
					uni.showToast({
						title: '正在获取蓝牙设备',
						icon: 'none',
						position: 'bottom'
					});
					this.onBluetoothDeviceFound();
					this.bledd = true;
				} catch (err) {
					uni.showToast({
						title: err.errMsg,
						icon: 'none',
						position: 'bottom'
					});
					this.bledd = false;
				}
			} else {
				try {
					await blews.stopBluetoothDevicesDiscovery();
					uni.showToast({
						title: '搜索已关闭',
						icon: 'none',
						position: 'bottom'
					});
					this.bledd = false;
				} catch (err) {
					uni.showToast({
						title: err.errMsg,
						icon: 'none',
						position: 'bottom'
					});
				}
			}
		},
		// 监听寻找到新设备的事件
		onBluetoothDeviceFound() {
			var self = this;
			self.devicesList = [];
			uni.onBluetoothDeviceFound(devices => {
				//不重复,就添加到devicesList中,
				if (
					!self.devicesList.some(item => {
						return item.deviceId === devices.devices[0].deviceId;
					}) &&
					devices.devices[0].name &&
					!self.paired.some(item => {
						return item.deviceId === devices.devices[0].deviceId;
					})
				) {
					self.devicesList.push(devices.devices[0]);
				}
			});
		},
		// 连接设备
		async select_deviceId(item) {
			uni.showLoading({
				mask: true,
				title: `连接${item.name}中...`
			});
			if (item.status) {
				return uni.showToast({
					title: `${item.name}已连接`,
					icon: 'none',
					position: 'bottom'
				});
			}
			try {
				// 连接低功耗蓝牙设备
				await blews.createBLEConnection(item.deviceId);
				// 获取蓝牙设备所有服务，并匹配对应的服务
				await blews.getBLEDeviceServices(item.deviceId,eqp.serviceId);
				// 获取蓝牙设备某个服务中所有特征值(characteristic),并匹配
				await blews.getBLEDeviceCharacteristics(item.deviceId, eqp.serviceId, eqp.characteristicId)
				// 第一次连接不存在paired中,
				if (
					!this.paired.some(res => {
						return res.deviceId === item.deviceId;
					})
				) {
					// 写入设备的类型和uuid
					item.serviceId = eqp.serviceId;
					item.characteristicId = eqp.characteristicId;
					item.type = eqp.type;
					var idf = this.paired.push(item);
					uni.setStorageSync('paired', this.paired);
					// 修改连接状态
					item.status = true;
					this.$set(this.paired, idf - 1, item);
					// 删除可用设备的值
					var index = this.devicesList.findIndex(res => {
						return res.deviceId == item.deviceId;
					});
					this.devicesList.splice(index, 1);
				} else {
					// 修改连接状态
					item.status = true;
					var index = this.paired.findIndex(res => {
						return res.deviceId == item.deviceId;
					});
					this.$set(this.paired, index, item);
				}
				uni.showToast({
					title: `${item.name}连接成功`,
					icon: 'none',
					position: 'bottom'
				});
			} catch (e) {
				uni.showToast({
					title: e.errMsg,
					icon: 'none',
					position: 'bottom'
				});
			}
		},
		// 关闭弹窗
		hideModal(e) {
			this.$emit('show', false);
		}
	}
};
</script>

<style>
.r {
	border-radius: 20rpx;
}
</style>
