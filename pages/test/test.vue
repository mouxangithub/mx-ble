<template>
	<view class="content">
		<view class="" v-for="device in devicesList" :key="device">
			<text>{{device}}</text>
		</view>
		<button type="primary" @tap="nextToDiscoveryBLE">下一步</button>
		<button type="primary" @tap="pickUpOnce">测量一次</button>
		<view class="">
			<text>动态血压值: {{measureResult[0].pressure}}</text>
		</view>
		<view class="">
			<text>收缩压值: {{measureResult[0].SYS}}</text>
		</view>
		<view class="">
			<text>舒张压值: {{measureResult[0].DIA}}</text>
		</view>
		<view class="">
			<text>脉搏值: {{measureResult[0].PUL}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		components: {},
		data() {
			return {
				//是否已经打开蓝牙，默认为false，当蓝牙适配器初始化成功后为true
				isOpenBle: false,
				//主服务的UUID
				primaryUUID: "FFF0",
				//设备列表
				devicesList: [{
					"device": "初始设备"
				}],
				//设备Id
				deviceId: "",
				//服务Id
				serviceId: "",
				//特征值ID
				characteristicId: [{
					//支持写入操作的特征值
					writeId: "",
					//支持notify操作的特征值
					notifyId: ""
				}],
				//控制命令
				wirteControlCode: [{
					//开始测量命令
					beginMeasure: "0240DD04FFFD020198",
					//停止测量命令
					stopMeasure: "",
					//上传数据命令
					uploadData: "",
					//停止上传数据命令
					stopUploadData: "0240DD04FFFD02059C",
					//关机命令
					shutDown: ""
				}],
				//测量结果
				measureResult: [{
					//动态压力值
					pressure: "",
					//收缩压
					SYS: "",
					//舒张压
					DIA: "",
					//脉搏
					PUL: ""
				}]
			}
		},
		onLoad() {
			//在页面加载时候初始化蓝牙适配器
			uni.openBluetoothAdapter({
				success: e => {
					console.log('初始化蓝牙成功:' + e.errMsg);
					this.$data.isOpenBle = true;
					console.log(this.$data.isOpenBle);
				},
				fail: e => {
					console.log('初始化蓝牙失败，错误码：' + (e.errCode || e.errMsg));
				}
			});
			//同时监听蓝牙连接状态
			this.onBLEConnectionStateChange();
		},
		methods: {
			//下一步按钮
			nextToDiscoveryBLE() {
				//下一步去查找设备
				this.startBluetoothDeviceDiscovery();
			},
			//测量一次
			pickUpOnce() {
				this.notifyBLECharacteristicValue();
				let self = this;
				setTimeout(function() {
					self.writeBLECharacteristicValue(self.wirteControlCode[0].beginMeasure);
				}, 500);
			},
			startBluetoothDeviceDiscovery() {
				//在页面显示的时候判断是都已经初始化完成蓝牙适配器若成功，则开始查找设备
				let self = this;
				setTimeout(function() {
					if (self.isOpenBle) {
						console.log("开始搜寻智能设备");
						// 血压仪的主服务ID为FFF0
						uni.startBluetoothDevicesDiscovery({
							//services: ['fff0'],
							success: res => {
								//
								self.onBluetoothDeviceFound();
							},
							fail: res => {
								console.log("查找设备失败!");
								uni.showToast({
									icon: "none",
									title: "查找设备失败！",
									duration: 3000
								})
							}
						});
					} else {
						console.log("未初始化蓝牙是配饰器：" + self.isOpenBle);
					}
				}, 300);
			},
			/**
			 * 停止搜索蓝牙设备
			 */
			stopBluetoothDevicesDiscovery() {
				uni.stopBluetoothDevicesDiscovery({
					success: e => {
						console.log('停止搜索蓝牙设备:' + e.errMsg);
					},
					fail: e => {
						console.log('停止搜索蓝牙设备失败，错误码：' + e.errCode);
					}
				});
			},
			/**
			 * 发现外围设备
			 */
			onBluetoothDeviceFound() {
				console.log("监听寻找新设备");
				//this.getBluetoothDevices();
				uni.onBluetoothDeviceFound(devices => {
					console.log('开始监听寻找到新设备的事件');
					this.getBluetoothDevices();
				});
			},
			/**
			 * 获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。
			 */
			getBluetoothDevices() {
				console.log("获取蓝牙设备");
				uni.getBluetoothDevices({
					success: res => {
						console.log('获取蓝牙设备成功:' + res.errMsg);
						this.devicesList = res.devices;
						//在这里查找Belter_BT名称的血压仪
						for (let i = 0; i < this.devicesList.length; i++) {
							let eq = this.devicesList[i];
							if (eq.name === "Belter_BT") {
								this.deviceId = eq.deviceId;
								console.log("查找到了血压仪：设备deviceId：" + this.deviceId);
								//在这准备连接设备
								this.createBLEConnection();
								//停止搜索设备
								this.stopBluetoothDevicesDiscovery();
								break;
							}
						}
					},
					fail: e => {
						console.log('获取蓝牙设备错误，错误码：' + e.errCode);
					}
				});
			},
			/**
			 * 连接设备
			 */
			createBLEConnection() {
				//设备deviceId
				let deviceId = this.deviceId;
				let self = this;
				uni.createBLEConnection({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId,
					success: res => {
						console.log("设备连接成功！");
						//延迟1.5s获取设备的services
						setTimeout(function() {
							console.log("获取设备的services");
							self.getBLEDeviceServices();
						}, 1500);
					},
					fail: res => {
						console.log(JSON.stringify(res));
						console.log("设备连接失败！");
					}
				});
			},
			/**
			 * 获取设备的服务ID
			 */
			getBLEDeviceServices() {
				let deviceId = this.deviceId;
				let serviceList = [];
				let self = this;
				uni.getBLEDeviceServices({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId,
					success: res => {
						console.log(JSON.stringify(res));
						serviceList = res.services;
						for (let i = 0; i < serviceList.length; i++) {
							let service = serviceList[i];
							console.log(JSON.stringify(service) + "----serviceID：" + service.uuid);
							//比对service是否是FFF0服务
							if (service.uuid.indexOf('FFF0') != -1) {
								self.serviceId = service.uuid;
								console.log("设备的serviceId： " + self.serviceId);
								//开始获取指定服务的特征值
								self.getBLEDeviceCharacteristics();
								break;
							}
						}
					},
					fail: res => {
						console.log('device services:', res.services)
					}
				});
			},
			/**
			 * 获取指定服务的特征值
			 */
			getBLEDeviceCharacteristics() {
				let deviceId = this.deviceId;
				let serviceId = this.serviceId;
				let characteristicsList = [];
				let self = this;
				uni.getBLEDeviceCharacteristics({
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
					deviceId,
					// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					serviceId,
					success: res => {
						console.log(JSON.stringify(res));
						console.log("获取的" + serviceId + "服务的特征值：" + JSON.stringify(res.characteristics));
						characteristicsList = res.characteristics;
						for (let i = 0; i < characteristicsList.length; i++) {
							let characteristic = characteristicsList[i];
							//判断服务特征值中的特征值FFF3 和 FFF4
							if (characteristic.uuid.indexOf("FFF3") != -1) {
								self.characteristicId[0].writeId = characteristic.uuid;
								console.log("设备的特征值写入ID： " + self.characteristicId[0].writeId);
							}
							if (characteristic.uuid.indexOf("FFF4") != -1) {
								self.characteristicId[0].notifyId = characteristic.uuid;
								console.log("设备的特征值notifyID： " + self.characteristicId[0].notifyId);
							}
							if (self.characteristicId[0].writeId != "" && self.characteristicId[0].notifyId !=
								"") {
								break;
							}
						}
					},
					fail: res => {
						console.log('device getBLEDeviceCharacteristics failed:', JSON.stringify(res))
					}
				})
			},
			/**
			 * 开启订阅特征值
			 */
			notifyBLECharacteristicValue() {
				let deviceId = this.deviceId;
				let serviceId = this.serviceId;
				let characteristicId = this.characteristicId[0].notifyId;
				let notify = true;
				let self = this;
				uni.notifyBLECharacteristicValueChange({
					state: true, // 启用 notify 功能
					// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
					deviceId,
					// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					serviceId,
					// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
					characteristicId,
					success(res) {
						console.log('notifyBLECharacteristicValueChange success:' + JSON.stringify(res));

						// ArrayBuffer转16进度字符串示例
						function ab2hex(buffer) {
							const hexArr = Array.prototype.map.call(
								new Uint8Array(buffer),
								function(bit) {
									return ('00' + bit.toString(16)).slice(-2)
								}
							)
							return hexArr.join('')
						}
						uni.onBLECharacteristicValueChange(function(res) {
							console.log(
								`characteristic ${res.characteristicId} has changed, now is ${JSON.stringify(res.value)}`
								)
							var value = ab2hex(res.value);
							console.log(value);
							if (value.length === 14) {
								let result = parseInt(value.slice(10, 12), 16);
								console.log("动态压力值：" + result);
								self.measureResult[0].pressure = result;
							}
							if (value.length === 34) {
								let sys = parseInt(value.slice(10, 14), 16);
								let dia = parseInt(value.slice(14, 18), 16);
								let pul = parseInt(value.slice(22, 26), 16);
								console.log("高压值 SYS：" + sys);
								console.log("低压值 DIA：" + dia);
								console.log("脉搏值 PUL：" + pul);
								self.measureResult[0].SYS = sys;
								self.measureResult[0].DIA = dia;
								self.measureResult[0].PUL = pul;
								//停止上传数据
								self.writeBLECharacteristicValue(self.wirteControlCode[0].stopUploadData);
							}
							console.log("----------------------------------------------");
						});
					},
					fail(res) {
						console.log('notifyBLECharacteristicValueChange failed:' + res.errMsg);
						var value = ab2hex(res.value);
						console.log(value);
					}
				});
			},
			/**
			 * 写入控制命令
			 * writeCode 写入的控制命令
			 */
			writeBLECharacteristicValue(writeCode) {
				let deviceId = this.deviceId;
				let serviceId = this.serviceId;
				let characteristicId = this.characteristicId[0].writeId;

				//因为协议文档中，一个字节两个字符的控制命令，codeLength为命令字节数
				let codeLength = writeCode.length / 2;
				const buffer = new ArrayBuffer(codeLength);
				const dataView = new DataView(buffer)

				//在这里解析将要写入的值
				for (let i = 0; i < codeLength; i++) {
					dataView.setUint8(i, '0X' + writeCode.substring(i * 2, i * 2 + 2));
					console.log("次数：" + i + "-----" + writeCode.substring(2 * i, 2 * i + 2));
				}

				console.log("写入数据中deviceId：" + deviceId);
				console.log("写入数据中serviceId:" + serviceId);
				console.log("写入数据中characteristicId:" + characteristicId);
				console.log("分割线************************************");

				console.log("发送的数据：")
				for (let i = 0; i < dataView.byteLength; i++) {
					console.log("0x" + dataView.getUint8(i).toString(16))
				}

				uni.writeBLECharacteristicValue({
					// 这里的 deviceId 需要在 getBluetoothDevices 或 onBluetoothDeviceFound 接口中获取
					deviceId,
					// 这里的 serviceId 需要在 getBLEDeviceServices 接口中获取
					serviceId,
					// 这里的 characteristicId 需要在 getBLEDeviceCharacteristics 接口中获取
					characteristicId,
					// 这里的value是ArrayBuffer类型
					value: buffer,
					success(res) {
						console.log('writeBLECharacteristicValue success', res.errMsg)
						console.log('writeBLECharacteristicValue success', JSON.stringify(res))
						//this.notifyCharacteristicValueChange();
					},
					fail(res) {
						console.log("写入数据失败", res.errMsg)
					}
				});
			},
			/**
			 * 监听低功耗蓝牙连接状态的改变事件。包括开发者主动连接或断开连接，设备丢失，连接异常断开等等
			 */
			onBLEConnectionStateChange() {
				let count = 0;
				uni.onBLEConnectionStateChange(res => {
					// 该方法回调中可以用于处理连接意外断开等异常情况
					console.log(`蓝牙连接状态 -------------------------->`);
					console.log(JSON.stringify(res));
					if (!res.connected) {
						if (this.isStop) return;
						console.log('断开低功耗蓝牙成功:');

						uni.showToast({
							icon: "none",
							title: "蓝牙已经断开！",
							mask: false,
							duration: 3000
						});

						//在这里尝试重连
						//this.createBLEConnection();
						//关闭连接
						this.closeBluetoothAdapter();
					}
				});
			},
			/**
			 * 断开蓝牙连接
			 */
			closeBluetoothAdapter() {
				uni.closeBluetoothAdapter({
					success: res => {
						console.log('断开蓝牙模块成功');

						uni.showToast({
							icon: "none",
							title: "蓝牙已经断开！",
							mask: false,
							duration: 3000
						});
					}
				});
			}
		}
	}
</script>

<style>
	.content {}
</style>
