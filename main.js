import Vue from 'vue'
import App from './App'

import store from '@/store';

import navigationbar from './components/navigationbar.vue'
Vue.component('navigationbar', navigationbar)

import bleModal from './components/ble-modal.vue'
Vue.component('ble-modal', bleModal)

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App,
	store
})
app.$mount()
