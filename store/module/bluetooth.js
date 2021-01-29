// 厂商设备信息, 这个才是重点，得找厂商拿到对应功能服务的两个uuid，不然得自个一个一个试
import manufacturer from '@/common/manufacturer.js';
// 引入封装的蓝牙模块
import Bluetooth from '@/common/bluetooth.js';
// 初始化蓝牙模块
let bluetooth = new Bluetooth();
export default {
	state: {
		isOpenBle: uni.getStorageSync('isOpenBle') || false, // 是否开启蓝牙
		paired: uni.getStorageSync('paired') || [], // 已配对设备列表
		bledd: false, // 是否启用蓝牙搜索
		devicesList: [], // 搜索到的可用设备列表
		manufacturer: manufacturer.data, // 厂商设备
	},
	getters: {
		getIsOpenBle: state => state.isOpenBle,
		getPaired: state => state.paired,
		getBledd: state => state.bledd,
		getDevicesList: state => state.devicesList,
		getManufacturer: state => state.manufacturer
	},
	mutations: {
		/**
		 * 设置isOpenBle
		 * @param {Object} state
		 * @param {Boolean} isOpenBle
		 */
		setIsOpenBle(state, isOpenBle) {
			state.isOpenBle = isOpenBle
			uni.setStorageSync('isOpenBle', isOpenBle)
		},
		/**
		 * 设置bledd
		 * @param {Object} state
		 * @param {Boolean} bledd
		 */
		setBledd(state, bledd) {
			state.bledd = bledd
		},
		/**
		 * 设置devicesList
		 * @param {Object} state
		 * @param {Array} devicesList
		 */
		setDevicesList(state, devicesList) {
			state.devicesList = devicesList
		},
		/**
		 * 设置paired
		 * @param {Object} state
		 * @param {Array} paired
		 */
		setPaired(state, paired) {
			state.paired = paired
			uni.setStorageSync('paired', paired)
		}
	},
	actions: {
		/**
		 * 初始化蓝牙
		 */
		async initialization({
			dispatch,
			commit,
			state
		}) {
			var isOpenBle = state.isOpenBle
			if (isOpenBle) {
				dispatch('openBluetoothAdapter')
				dispatch('getConnectedBluetoothDevices')
			}
		},
		/**
		 * 初始化蓝牙
		 */
		async openBluetoothAdapter({
			commit,
			state
		}) {
			try {
				var isOpenBle = await bluetooth.openBluetoothAdapter();
				commit('setIsOpenBle', isOpenBle)
				uni.showToast({
					title: '蓝牙开启成功',
					icon: 'none',
					position: 'bottom'
				});
			} catch (err) {
				commit('setIsOpenBle', false)
				uni.showToast({
					title: `蓝牙初始化失败: ${err.errMsg}`,
					icon: 'none',
					position: 'bottom'
				});
			}
		},
		/**
		 * 关闭蓝牙
		 */
		closeBluetoothAdapter({
			commit,
			state
		}) {
			bluetooth.closeBluetoothAdapter();
			commit('setIsOpenBle', false)
			commit('setBledd', false)
			var paired = state.paired
			paired = paired.map(item => ({
				...item,
				status: false
			}));
			commit('setPaired', paired)
			uni.showToast({
				title: '蓝牙已关闭',
				icon: 'none',
				position: 'bottom'
			});
		},
		/**
		 * 获取设备的连接状态
		 */
		async getConnectedBluetoothDevices({
			commit,
			state
		}) {
			var paired = state.paired
			if (paired.length > 0) {
				try {
					var devices = await bluetooth.getConnectedBluetoothDevices(paired);
					if (devices > 0) {
						for (var i = 0; i < devices.length; i++) {
							for (var s = 0; s < paired.length; s++) {
								if (paired[s].deviceId == devices[i].deviceId) {
									paired[s].status = true;
								}
							}
						}
					} else {
						for (var s = 0; s < paired.length; s++) {
							paired[s].status = false;
						}
					}
				} catch (err) {}
				commit('setPaired', paired)
			}
		},
		/**
		 * 开启蓝牙搜索
		 */
		async openbledd({
			dispatch,
			commit,
			state
		}) {
			var bledd = state.bledd
			// 开启搜索
			if (!bledd) {
				if(!state.isOpenBle) {
					uni.showToast({
						title: '请先打开蓝牙',
						icon: 'none',
						position: 'bottom'
					});
				}
				try {
					await bluetooth.startBluetoothDevicesDiscovery();
					dispatch('onBluetoothDeviceFound')
					commit('setBledd', true)
					commit('setDevicesList', [])
					uni.showToast({
						title: '搜索已开启',
						icon: 'none',
						position: 'bottom'
					});
				} catch (err) {
					uni.showToast({
						title: err.errMsg,
						icon: 'none',
						position: 'bottom'
					});
					commit('setBledd', false)
				}
			} else {
				try {
					await bluetooth.stopBluetoothDevicesDiscovery();
					uni.showToast({
						title: '搜索已关闭',
						icon: 'none',
						position: 'bottom'
					});
					commit('setBledd', false)
				} catch (err) {
					uni.showToast({
						title: err.errMsg,
						icon: 'none',
						position: 'bottom'
					});
				}
			}
		},
		/**
		 * 监听寻找到新设备的事件
		 */
		onBluetoothDeviceFound({
			commit,
			state
		}) {
			var devicesList = state.devicesList,
				paired = state.paired;
			uni.onBluetoothDeviceFound(res => {
				//不重复，有名称，不存在paired中，就添加到devicesList中,
				if (
					!devicesList.some(item => {
						return item.deviceId === res.devices[0].deviceId;
					}) && res.devices[0].name &&
					!paired.some(item => {
						return item.deviceId === res.devices[0].deviceId;
					})
				) {
					devicesList.push(res.devices[0]);
					commit('setDevicesList', devicesList)
				}
			});
		},
		/**
		 * 连接设备
		 * @param {Object} item
		 */
		async createBLEConnection({
			commit,
			state
		}, item) {
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
				await bluetooth.createBLEConnection(item.deviceId);
				var paired = state.paired,
					devicesList = state.devicesList
				if (
					!paired.some(res => {
						return res.deviceId === item.deviceId;
					})
				) {
					// 第一次连接不存在paired中，写入缓存,
					paired.push(item);
					item.status = true;
					commit('setPaired', paired)
					// 删除可用设备的对应值
					var index = devicesList.findIndex(res => {
						return res.deviceId == item.deviceId;
					});
					devicesList.splice(index, 1);
					commit('setDevicesList', devicesList)
				} else {
					// 之后连接只需更改状态
					var index = paired.findIndex(res => {
						return res.deviceId == item.deviceId;
					});
					paired[index].status = true
					commit('setPaired', paired)
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
		/**
		 * 断开连接
		 * @param {Object} item
		 */
		disconnect({
			commit,
			state
		}, item) {
			uni.showModal({
				title: '警告',
				content: '您正在执行断开该设备蓝牙操作，请问是否继续',
				success: async res => {
					if (res.confirm) {
						try {
							var paired = state.paired
							await bluetooth.closeBLEConnection(item.deviceId);
							var index = paired.findIndex(res => {
								return res.deviceId == item.deviceId;
							});
							paired[index].status = false
							commit('setPaired', paired)
							uni.showToast({
								title: '断开连接成功',
								icon: 'none',
								position: 'bottom'
							});
						} catch (err) {
							uni.showToast({
								title: err.errMsg ? `断开连接失败：${err.errMsg}` : '断开连接失败',
								icon: 'none',
								position: 'bottom'
							});
						}
					}
				}
			});
		},
		/**
		 * 删除配对设备
		 * @param {Object} item
		 */
		delpaired({
			commit,
			state
		}, item) {
			uni.showModal({
				title: '警告',
				content: '您正在执行删除该设备蓝牙操作，请问是否继续',
				success: async res => {
					if (res.confirm) {
						var paired = state.paired,
							index = paired.findIndex(res => {
								return res.deviceId == item.deviceId;
							});
						// 已连接需要断开连接
						if (item.status) {
							await bluetooth.closeBLEConnection(item.deviceId);
						}
						// 删除本地极缓存
						paired.splice(index, 1);
						commit('setPaired', paired)
						uni.showToast({
							title: '删除成功',
							icon: 'none',
							position: 'bottom'
						});
					}
				}
			});
		},
		/**
		 * 修改设备特征
		 */
		changeManufacturer({
			commit,
			state
		}, {
			item,
			manufacturer
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					var paired = state.paired
					await bluetooth.getBLEDeviceServices(item.deviceId, manufacturer.serviceId);
					await bluetooth.getBLEDeviceCharacteristics(item.deviceId, manufacturer.serviceId, manufacturer.characteristicId);
					item.serviceId = manufacturer.serviceId;
					item.characteristicId = manufacturer.characteristicId;
					item.type = manufacturer.type || 'unknown';
					item.uuid = manufacturer.serviceId;
					var index = paired.findIndex(res => {
						return res.deviceId == item.deviceId;
					});
					paired[index] = item
					commit('setPaired', paired)
					resolve(true)
				} catch (err) {
					reject(err)
				}
			})
		}
	}
}
