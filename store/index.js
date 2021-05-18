import Vue from 'vue'
import Vuex from 'vuex'
import common from '@/common/common.js';
// 引入封装的蓝牙模块
import Bluetooth from '@/common/bluetooth.js';
// 初始化蓝牙模块
var bluetooth = new Bluetooth();
Vue.use(Vuex)
export default new Vuex.Store({
	state: {
		isOpenBle: false,
		bledd: false,
		devicesList: []
	},
	getters: {},
	mutations: {
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
		 * 初始化蓝牙
		 */
		async openBluetoothAdapter(state) {
			try {
				var isOpenBle = await bluetooth.openBluetoothAdapter();
				state.isOpenBle = true
				common.showToast('蓝牙初始化成功');
			} catch (err) {
				state.isOpenBle = false
				if (err.errCode) {
					common.showToast(bluetooth.bleerrcode(err.errCode));
				} else if (err.errMsg) {
					common.showToast(err.errMsg);
				} else {
					common.showToast('蓝牙初始化失败');
				}
			}
		},
		/**
		 * 关闭蓝牙
		 */
		closeBluetoothAdapter(state) {
			bluetooth.closeBluetoothAdapter();
			state.isOpenBle = false
			state.bledd = false
		},
	},
	actions: {
		/**
		 * 开启蓝牙搜索
		 */
		startBluetoothDevicesDiscovery({
			commit,
			dispatch,
			state
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					if (!state.isOpenBle) {
						await commit('openBluetoothAdapter')
					}
					await bluetooth.startBluetoothDevicesDiscovery();
					commit('setBledd', true)
					dispatch('onBluetoothDeviceFound')
					commit('setDevicesList', [])
					resolve(true)
				} catch (err) {
					commit('setBledd', false)
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					reject(err)
				}
			})
		},
		/**
		 * 关闭搜索
		 */
		stopBluetoothDevicesDiscovery({
			commit,
			state
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					await bluetooth.stopBluetoothDevicesDiscovery();
					commit('setBledd', false)
					resolve(true)
				} catch (err) {
					commit('setBledd', false)
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					reject(err)
				}
			})
		},
		/**
		 * 监听寻找到新设备的事件
		 */
		onBluetoothDeviceFound({
			commit,
			state
		}) {
			var devicesList = state.devicesList
			uni.onBluetoothDeviceFound(res => {
				//不重复，有名称，就添加到devicesList中
				if (
					res.devices[0].name &&
					!devicesList.some(item => {
						return item.deviceId === res.devices[0].deviceId;
					})
				) {
					devicesList.push(res.devices[0]);
					commit('setDevicesList', devicesList)
				}
			});
		},
		/**
		 * 连接低功耗蓝牙设备
		 * @param {Object} item 设备信息
		 */
		createBLEConnection(ten, item) {
			return new Promise(async (resolve, reject) => {
				try {
					await bluetooth.createBLEConnection(item.deviceId);
					common.showToast(`${item.name}连接成功`);
					resolve(true)
				} catch (err) {
					if (err.errCode) {
						common.showToast(`${item.name}连接失败：` + bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(`${item.name}连接失败：` + err.errMsg);
					} else {
						common.showToast(`${item.name}连接失败：`);
					}
					reject(err)
				}
			})
		},
		/**
		 * 断开蓝牙
		 * @param {String} deviceId 蓝牙设备 id
		 */
		async closeBLEConnection(ten, deviceId) {
			return new Promise(async (resolve, reject) => {
				try {
					await bluetooth.closeBLEConnection(deviceId);
					resolve(true)
				} catch (err) {
					if (err.errCode) {
						common.showToast(`${item.name}连接失败：` + bluetooth.bleerrcode(err
							.errCode));
					} else if (err.errMsg) {
						common.showToast(`${item.name}连接失败：` + err.errMsg);
					} else {
						common.showToast(`${item.name}连接失败：`);
					}
					reject(err)
				}
			})
		},
		/**
		 * 启用设备的notify服务
		 * @param {String} deviceId 蓝牙设备 id
		 * @param {String} serviceId
		 * @param {String} characteristicId
		 */
		openNotify({
			dispatch
		}, {
			deviceId,
			serviceId,
			characteristicId
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					await bluetooth.notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId);
					resolve(true)
				} catch (err) {
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					reject(err)
				}
			})
		},
		/**
		 * 检测匹配设备服务
		 * @param {String} deviceId 蓝牙设备 id
		 * @param {String} serviceId
		 * @param {String} characteristicId
		 */
		checkDeviceService({
			dispatch
		}, {
			deviceId,
			serviceId,
			characteristicId
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					await bluetooth.getBLEDeviceServices(deviceId, serviceId)
					await bluetooth.getBLEDeviceCharacteristics(deviceId, serviceId, characteristicId);
					resolve(true)
				} catch (err) {
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					dispatch('closeBLEConnection', deviceId)
					reject(err)
				}
			})
		},
		/**
		 * 根据properti匹配对应操作权限的特征
		 * @param {String} deviceId 蓝牙设备 id
		 * @param [String,Array] properti 需要匹配的操作权限（write,read,notify,indicate）
		 */
		getProperti(ten, {
			deviceId,
			properti = 'write'
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					var services = await bluetooth.getBLEDeviceServices(deviceId)
					if (services.length > 0) {
						for (var i = 0; i < services.length; i++) {
							if (services[i].isPrimary) {
								var res = await bluetooth.getBLEDeviceCharacteristics(deviceId,
									services[i].uuid)
								if (res.length > 0) {
									for (var s = 0; s < res.length; s++) {
										if (res[s].properties[properti]) {
											return resolve({
												characteristicId: res[s].uuid,
												serviceId: services[i].uuid
											})
										}
									}
								}
							}
						}
						common.showToast(`该设备无${properti}权限，可能无法使用该功能`);
						dispatch('closeBLEConnection', deviceId)
						reject({
							errMsg: `该设备无${properti}权限，可能无法使用该功能`
						})
					} else {
						common.showToast(`获取设备服务失败`);
						dispatch('closeBLEConnection', deviceId)
						reject({
							errMsg: '获取设备服务失败'
						})
					}
				} catch (err) {
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					dispatch('closeBLEConnection', deviceId)
					reject(err)
				}
			})
		},
		/**
		 * 获取血压仪的服务
		 * @param {String} deviceId 蓝牙设备 id
		 * @param [String,Array] uuid 需要匹配的uuid
		 */
		getSphygmomanometerServer(ten, deviceId) {
			return new Promise(async (resolve, reject) => {
				try {
					var services = await bluetooth.getBLEDeviceServices(deviceId)
					if (services.length > 0) {
						for (var i = 0; i < services.length; i++) {
							let service = services[i];
							// 比对service是否是FFF0服务
							if (service && service.uuid.indexOf('FFF0') != -1) {
								var res = await bluetooth.getBLEDeviceCharacteristics(deviceId,service.uuid)
								if (res.length > 0) {
									for (var s = 0; s < res.length; s++) {
										var characteristic = res[s],
										    writeId = '',
										    notifyId = ''
										//判断服务特征值中的特征值FFF3 和 FFF4
										if (characteristic.uuid.indexOf("FFF3") != -1) {
											writeId = characteristic.uuid;
										}
										if (characteristic.uuid.indexOf("FFF4") != -1) {
											notifyId = characteristic.uuid;
										}
										if (writeId && notifyId) {
											return resolve({
												writeId,
												notifyId,
												serviceId: service.uuid
											})
										}
									}
								}
							}
						}
						common.showToast(`该设备无相应的服务，可能无法使用该功能`);
						dispatch('closeBLEConnection', deviceId)
						reject({
							errMsg: `该设备无相应的服务，可能无法使用该功能`
						})
					} else {
						common.showToast(`获取设备服务失败`);
						dispatch('closeBLEConnection', deviceId)
						reject({
							errMsg: '获取设备服务失败'
						})
					}
				} catch (err) {
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					dispatch('closeBLEConnection', deviceId)
					reject(err)
				}
			})
		}
	}
})
