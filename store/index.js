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
		bledd: false
	},
	getters: {},
	mutations: {
		setBledd(state, bledd) {
			state.state = bledd
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
		}
	},
	actions: {
		/**
		 * 开启蓝牙搜索
		 */
		startBluetoothDevicesDiscovery({
			commit,
			state
		}) {
			return new Promise(async (resolve, reject) => {
				try {
					if (!state.isOpenBle) {
						await commit('openBluetoothAdapter')
					}
					await bluetooth.startBluetoothDevicesDiscovery();
					commit('setBledd', true)
					resolve(true)
				} catch (err) {
					commit('setBledd', false)
					if (err.errCode) {
						common.showToast(bluetooth.bleerrcode(err.errCode));
					} else if (err.errMsg) {
						common.showToast(err.errMsg);
					}
					reject(false)
				}
			})
		}
	}
})
