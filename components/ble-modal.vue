<template>
	<view class="cu-modal bottom-modal" :class="show?'show':''" @tap="close">
		<view class="cu-dialog modal-radius" @tap.stop="">
			<view class="cu-bar bg-white justify-end solid-bottom">
				<view class="content">蓝牙设备</view>
			</view>
			<scroll-view style="height: 30vh;">

			</scroll-view>
		</view>
	</view>
</template>

<script>
	export default {
		name: "ble-modal",
		props: {
			value: {
				type: Boolean
			}
		},
		data() {
			return {
				show: false
			};
		},
		watch: {
			value(e) {
				if (e) {
					this.$store.dispatch('startBluetoothDevicesDiscovery')
					.then(res => {
						this.show = true
					})
					.catch(err => {
						this.close()
						this.show = false
					})
				} else {
					this.show = false
				}
			}
		},
		methods: {
			close() {
				this.$emit('input', false)
			}
		}
	}
</script>

<style>

</style>
