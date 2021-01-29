/**
 * UNIAPP蓝牙连接配置模块
 * By: 落魄实习生 2021-01-27 V1.0
 * 该插件为MIT开源，仅供学习交流
 * 如作它用所承受的法律责任一概与作者无关
 */
class Bluetooth {
	/**
	 * 初始化蓝牙模块
	 */
	openBluetoothAdapter() {
		return new Promise((resolve, reject) => {
			uni.openBluetoothAdapter({
				success: res => {
					resolve(true);
				},
				fail: err => {
					reject(err);
				},
			});
		});
	}
	/**
	 * 关闭蓝牙模块
	 */
	closeBluetoothAdapter() {
		uni.closeBluetoothAdapter();
	}
	/**
	 * 根据 uuid 获取处于已连接状态的设备。
	 * @param {Object} services
	 */
	getConnectedBluetoothDevices(services) {
		return new Promise((resolve, reject) => {
			uni.getConnectedBluetoothDevices({
				services,
				success(res) {
					resolve(res.devices)
				},
				fail(err) {
					reject(err)
				}
			});
		});
	}
	/**
	 * 搜索蓝牙
	 */
	startBluetoothDevicesDiscovery() {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				uni.startBluetoothDevicesDiscovery({
					allowDuplicatesKey: true, // 启用重复上报方便删除后可快速拿到设备
					success: res => {
						resolve(true)
					},
					fail: err => {
						reject(err);
					}
				})
			}, 300);
		});
	}
	/**
	 * 停止搜索
	 */
	stopBluetoothDevicesDiscovery() {
		return new Promise((resolve, reject) => {
			uni.stopBluetoothDevicesDiscovery({
				success: res => {
					resolve(true)
				},
				fail: err => {
					reject(err)
				}
			})
		});
	}
	/**
	 * 连接低功耗蓝牙设备
	 * @param {String} deviceId
	 */
	createBLEConnection(deviceId) {
		return new Promise((resolve, reject) => {
			uni.createBLEConnection({
				deviceId,
				success: async res => {
					resolve(true)
				},
				fail: err => {
					reject(err);
				}
			})
		});
	}
	/**
	 * 断开连接的设备
	 * @param {String} deviceId
	 */
	closeBLEConnection(deviceId) {
		return new Promise((resolve, reject) => {
			uni.closeBLEConnection({
				deviceId,
				success: async res => {
					resolve(true)
				},
				fail: err => {
					reject(err);
				}
			})
		})
	}
	/**
	 * 获取蓝牙设备所有服务(service) uuid 搜索对应的服务uuid
	 * @param {String} deviceId
	 * @param {String} serviceId
	 */
	getBLEDeviceServices(deviceId, serviceId) {
		let self = this;
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				uni.getBLEDeviceServices({
					deviceId,
					success: async res => {
						// 未传则直接返回所有服务
						if (!serviceId) {
							return resolve(res.services)
						}
						let sure = false;
						for (let i = 0; i < res.services.length; i++) {
							if (res.services[i].uuid.toUpperCase().indexOf(serviceId) != -1) {
								sure = true
								break;
							}
						}
						sure ? resolve(true) : reject({
							errMsg: '设备功能不匹配'
						})
					},
					fail: err => {
						reject(err);
					},
				})
			}, 1000)
		});
	}
	/**
	 * 获取蓝牙设备某个服务中所有特征值(characteristic)
	 * @param {String} deviceId
	 * @param {String} serviceId
	 * @param {String} characteristicId
	 */
	getBLEDeviceCharacteristics(deviceId, serviceId, characteristicId) {
		let self = this;
		return new Promise((resolve, reject) => {
			uni.getBLEDeviceCharacteristics({
				deviceId,
				serviceId,
				success: async res => {
					if (!characteristicId) {
						return resolve(res.characteristics)
					}
					let sure = false;
					for (var i = 0; i < res.characteristics.length; i++) {
						if (res.characteristics[i].uuid.toUpperCase().indexOf(characteristicId) != -1) {
							sure = true
							break;
						}
					}
					sure ? resolve(true) : reject({
						errMsg: '设备功能不匹配'
					})
				},
				fail: err => {
					reject(false);
				}
			})
		});
	}
	/**
	 * 启用低功耗蓝牙设备特征值变化时的 notify 功能，订阅特征值
	 * @param {String} deviceId
	 * @param {String} serviceId
	 * @param {String} characteristicId
	 */
	notifyBLECharacteristicValueChange(deviceId, serviceId, characteristicId) {
		return new Promise((resolve, reject) => {
			uni.notifyBLECharacteristicValueChange({
				state: true, // 启用 notify 功能
				deviceId,
				serviceId,
				characteristicId,
				success: async res => {
					resolve(true)
				},
				fail(err) {
					reject(err)
				}
			});
		})
	}
	/**
	 * 设置蓝牙最大传输单元
	 * @param {String} deviceId
	 * @param {Number} mtu
	 */
	setBLEMTU(deviceId, mtu) {
		return new Promise((resolve, reject) => {
			uni.setBLEMTU({
				deviceId,
				mtu,
				success(res) {

				}
			})
		})
	}
	/**
	 * 读取低功耗蓝牙设备的特征值的二进制数据值。注意：必须设备的特征值支持 read 才可以成功调用
	 * @param {String} deviceId
	 * @param {String} serviceId
	 * @param {String} characteristicId
	 */
	readBLECharacteristicValue(deviceId, serviceId, characteristicId) {
		wx.readBLECharacteristicValue({
			deviceId, //蓝牙设备 id
			serviceId, //蓝牙特征值对应服务的 uuid
			characteristicId,
			success(res) {
				console.log(res)
			}
		})
	}
	/**
	 * 向低功耗蓝牙设备特征值中写入二进制数据
	 * @param {String} deviceId
	 * @param {String} serviceId
	 * @param {String} characteristicId
	 * @param {Buffer} value
	 */
	writeBLECharacteristicValue(deviceId, serviceId, characteristicId, value) {
		uni.writeBLECharacteristicValue({
			deviceId, //蓝牙设备 id
			serviceId, //蓝牙特征值对应服务的 uuid
			characteristicId,
			value,
			success(res) {
				console.log(res)
			}
		})
	}
	/**
	 * ArrayBuffer转16进度字符串示例
	 * @param {Buffer} abValue
	 */
	ab2Weight(abValue) {
		let characteristicValue = this.ab2hex(abValue);
		let strValue = this.hexCharCodeToStr(characteristicValue)
		return strValue
	}
	ab2hex(buffer) {
		let hexArr = Array.prototype.map.call(
			new Uint8Array(buffer),
			bit => {
				return ('00' + bit.toString(16)).slice(-2)
			}
		)
		return hexArr.join('');
	}
	hexCharCodeToStr(hexCharCodeStr) {
		var trimedStr = hexCharCodeStr.trim();
		var rawStr =
			trimedStr.substr(0, 2).toLowerCase() === "0x" ?
			trimedStr.substr(2) :
			trimedStr;
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
}

export default Bluetooth;
