<template>
	<view>
		<view class="cu-modal drawer-modal justify-end" :class="show ? 'show' : ''" @tap="hideModal">
			<view class="cu-dialog bg-gray text-black basis-lg padding" @tap.stop="" style="background: url(../../static/bg2.png);height: 100%;background-size:100% 100%;" :style="[{ top: CustomBar + 'px', height: 'calc(100vh - ' + CustomBar + 'px)' }]">
				<bluetooth type="drawer" @longpress="longpress" @openSetting="openSetting" />
			</view>
		</view>
		<bluetoothSettings :setting="setting" :index="sindex" @hide="hideSetting"/>
		<view class="cu-modal bottom-modal" :class="lgshow ? 'show' : ''" @tap="hideLgshow">
			<view class="cu-dialog" style="background-color: transparent;bottom: 50rpx;" @tap.stop="">
				<view class="margin"><button style="width: 80%;" class="cu-btn bg-orange lg" @tap="dispatch('disconnect',lgitem)">关闭连接</button></view>
				<view class="margin"><button style="width: 80%;" class="cu-btn bg-red lg" @tap="dispatch('delpaired',lgitem)">删除设备</button></view>
			</view>
		</view>
	</view>
</template>

<script>
import bluetoothSettings from '@/components/bluetooth-settings.vue'
export default {
	name: 'drawer-settings',
	data() {
		return {
			CustomBar: this.CustomBar,
			lgshow: false,
			lgitem: null,
			setting: false,
			sindex: null
		};
	},
	components:{
		bluetoothSettings
	},
	props: {
		show: {
			type: Boolean
		}
	},
	methods: {
		longpress(item) {
			this.lgshow = true;
			this.lgitem = item;
		},
		hideLgshow() {
			this.lgitem = null;
			this.lgshow = false;
		},
		openSetting(index) {
			this.sindex = index
			this.setting = true
		},
		hideSetting() {
			this.sindex = null
			this.setting = false
		},
		// 使用store的函数
		dispatch(name, item) {
			this.lgshow = false;
			this.$store.dispatch(name, item);
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
