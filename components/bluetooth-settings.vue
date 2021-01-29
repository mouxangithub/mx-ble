<template>
	<view>
		<!-- D 设备设置窗口 -->
		<view class="cu-modal" :class="setting ? 'show' : ''" @tap="hide()">
			<view class="cu-dialog" style="background-color: transparent;top: 5%;" @tap.stop="hide()">
				<!-- title -->
				<view class="cu-bar margin bg-white shadow justify-end solid-bottom r" @tap.stop=""><view class="content">设备配置</view></view>
				<!-- title -->
				<!-- 设备信息 -->
				<view class="text-left margin padding bg-white shadow r" @tap.stop="" v-if="paired.length > 0 && (index || index == 0)">
					<view class="padding-xs solid-bottom flex">
						<view class="flex-sub">设备名称：</view>
						<view class="flex-sub text-left">{{ paired[index].name }}</view>
						<view class="flex-sub text-right"><button @tap="$store.dispatch('delpaired', paired[index])" class="cu-btn cuIcon bg-red cuIcon-deletefill" /></view>
					</view>
					<view class="padding-xs solid-bottom flex">
						<view class="flex-sub">状态：</view>
						<view class="flex-sub flex">
							<text class="cu-tag round" :class="paired[index].status ? 'bg-green' : 'bg-red'">{{ paired[index].status ? '已连接' : '未连接' }}</text>
						</view>
						<view class="flex-sub text-right">
							<button class="cu-btn bg-orange cuIcon cuIcon-infofill" @tap="$store.dispatch('disconnect', paired[index])" v-if="paired[index].status" />
							<button class="cu-btn cuIcon bg-green cuIcon-roundaddfill" @tap="$store.dispatch('createBLEConnection', paired[index])" v-else />
						</view>
					</view>
					<view class="padding-xs solid-bottom flex">
						<view class="flex-sub">信号强度：</view>
						<view class="flex-sub text-left">
							<text v-if="paired[index].status">{{ paired[index].RSSI }}dBm ({{ Math.max(100 + paired[index].RSSI, 0) }}%)</text>
							<text class="cu-tag round bg-red" v-else>未连接</text>
						</view>
						<view class="flex-sub text-right"></view>
					</view>
					<view class="padding-xs flex">
						<view class="flex-sub">设备ID：</view>
						<view class="flex-sub text-left">{{ paired[index].deviceId }}</view>
					</view>
				</view>
				<!-- 设备信息 -->
				<!-- 服务特征 -->
				<view class="margin bg-white shadow r" @tap.stop="" v-if="paired.length > 0 && (index || index == 0)">
					<view class="padding solid-bottom">设备服务特征</view>
					<scroll-view scroll-y="true r" style="max-height: 40vh;" show-scrollbar="true">
						<view
							class="padding solid-bottom flex"
							v-for="(item, i) in manufacturer"
							:key="i"
							@tap="paired[index] && paired[index].status ? changeManufacturer(paired[index], item) : tips"
						>
							<view class="flex-sub text-left">
								<text
									class="text-green cuIcon-roundcheckfill text-lg"
									v-if="paired[index] && paired[index].serviceId === item.serviceId && paired[index].characteristicId === item.characteristicId"
								/>
							</view>
							<view class="flex-sub">{{ item.manufacturer_name }}</view>
							<view class="flex-sub text-right">
								<text class="cu-tag round bg-green margin-left">{{ item.type | bletype }}</text>
							</view>
						</view>
						<view
							class="padding flex text-center"
							@tap="paired[index] && paired[index].status ? optional() : tips"
							v-if="(paired[index] && paired[index].status) || tp(paired[index])"
						>
							<view class="flex-sub text-left" v-if="tp(paired[index])"><text class="text-green cuIcon-roundcheckfill text-lg" v-if="tp(paired[index])" /></view>
							<view class="flex-sub">{{ tp(paired[index]) ? paired[index].uuid : '自选设备特征' }}</view>
						</view>
					</scroll-view>
				</view>
				<!-- 服务特征 -->
			</view>
		</view>
		<!-- D 设备设置窗口 -->
		<!-- 获取设备的服务特征 -->
		<view class="cu-modal" :class="optionalShow ? 'show' : ''" @tap="optional()">
			<view class="cu-dialog" style="border-radius: 30rpx;" @tap.stop="">
				<view v-if="!eqpServices || eqpServices.length == 0">正在加载...</view>
				<scroll-view v-else scroll-y="true" class="r" show-scrollbar="true" style="max-height: 70vh;">
					<view class="cu-list menu text-left r">
						<view class="cu-item" v-for="(item, i) in eqpServices" :key="i" @tap="changeManufacturer(paired[index], item)" @tap.stop="optional()">
							<view class="content">{{ item.uuid }}</view>
							<!-- 显示特征的权限 -->
							<view v-if="item.properties && typeof item.properties != '{}'">
								<text class="cu-tag round" :class="item.properties.read ? 'bg-green' : 'bg-grey'">R</text>
								<text class="cu-tag round" :class="item.properties.write ? 'bg-green' : 'bg-grey'">W</text>
								<text class="cu-tag round" :class="item.properties.notify ? 'bg-green' : 'bg-grey'">N</text>
								<text class="cu-tag round" :class="item.properties.indicate ? 'bg-green' : 'bg-grey'">I</text>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import Bluetooth from '@/common/bluetooth.js';
let bluetooth = new Bluetooth();
export default {
	data() {
		return {
			eqpServices: [], // 设备所有服务特征
			optionalShow: false,
			paired: this.$store.getters.getPaired,
			manufacturer: this.$store.getters.getManufacturer
		};
	},
	props: {
		setting: {
			type: Boolean
		},
		index: {
			type: Number
		}
	},
	computed: {
		tp() {
			return val => {
				var t = true,
					ms = this.manufacturer;
				if (ms.length > 0) {
					for (var i = 0; i < ms.length; i++) {
						if (ms[i].serviceId === val.serviceId && ms[i].characteristicId === val.characteristicId) {
							t = false;
							break;
						}
					}
				} else {
					t = false;
				}
				return t;
			};
		}
	},
	filters: {
		bletype(val) {
			if (val === 'balance') {
				return '电子秤';
			} else if (val === 'printer') {
				return '打印机';
			} else if (val === 'unknown') {
				return '未知';
			}
		}
	},
	watch: {
		'$store.state.bluetooth.paired': {
			handler(e) {
				this.paired = e;
			},
			immediate: true,
			deep: true
		},
		async optionalShow(e) {
			if (e) {
				let paired = this.paired,
					index = this.index;
				if (paired.length > 0 && (index == 0 || index) && paired[index].status) {
					var pairedset = paired[index];
					try {
						// 获取蓝牙设备所有服务，并匹配对应的服务
						var res = await bluetooth.getBLEDeviceServices(pairedset.deviceId),
							eqpServices = [];
						if (res.length > 0) {
							for (var i = 0; i < res.length; i++) {
								var list = await bluetooth.getBLEDeviceCharacteristics(pairedset.deviceId, res[i].uuid);
								list.map(item => {
									item.serviceId = res[i].uuid;
									item.characteristicId = item.uuid;
									eqpServices.push(item);
								});
							}
							this.eqpServices = eqpServices;
						} else {
							this.optional();
							uni.showToast({
								title: '该设备暂无可用服务',
								icon: 'none',
								position: 'bottom'
							});
						}
					} catch (err) {
						uni.showToast({
							title: err.errMsg,
							icon: 'none',
							position: 'bottom'
						});
						this.optional();
					}
				}
			}
		}
	},
	methods: {
		tips() {
			uni.showToast({
				title: '请连接后再操作',
				icon: 'none',
				position: 'bottom'
			});
		},
		// 修改配置
		async changeManufacturer(item, manufacturer) {
			var index = this.index;
			if (manufacturer && typeof manufacturer != '{}' && item) {
				try {
					await this.$store.dispatch('changeManufacturer', { item, manufacturer });
					this.hide();
					uni.showToast({
						title: '成功修改设备特征',
						icon: 'none',
						position: 'bottom'
					});
				} catch (err) {
					uni.showToast({
						title: err.errMsg ? `设备特征修改失败：${err.errMsg}` : '设备特征修改失败',
						icon: 'none',
						position: 'bottom'
					});
				}
			}
		},
		// 设置配置
		hide(index = null) {
			this.$emit('hide');
		},
		// 打开自选窗口
		optional() {
			this.optionalShow = !this.optionalShow;
		}
	}
};
</script>

<style>
.r {
	border-radius: 20rpx;
}
</style>
