import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false

import cuCustom from './components/cu-custom.vue'
Vue.component('cu-custom', cuCustom)

import bluetoothSettings from './components/bluetooth-settings.vue'
Vue.component('bluetooth-settings', bluetoothSettings)

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
