<template>
	<view class="cu-modal bottom-modal" :class="show?'show':''" :style="[{ marginTop: CustomBar + 'px' }]" @tap="close">
		<view class="cu-dialog modal-radius" @tap.stop="">
			<view class="cu-bar bg-white justify-end solid-bottom">
				<view class="content">蓝牙设备</view>
				<view class="cu-load load-cuIcon loading margin-right-xl" />
			</view>
			<scroll-view class="v30">
				<view class="cu-list menu">
					<view @tap="connect(item)" class="cu-item" v-for="(item,index) in devicesList" :key="index">
						<view class="content">{{item.name}}</view>
					</view>
				</view>
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
				CustomBar: this.CustomBar,
				show: false,
				devicesList: []
			};
		},
		watch: {
			// 监听蓝牙设备
			'$store.state.devicesList': {
				immediate: true,
				deep: true,
				handler(e) {
					if (e.length > 0) {
						this.devicesList = e
					}
				}
			},
			value(e) {
				if (e) {
					this.$store.dispatch('startBluetoothDevicesDiscovery')
						.then(res => {
							this.show = true
						})
						.catch(err => {
							this.close()
						})
				} else {
					this.show = false
					this.$store.dispatch('stopBluetoothDevicesDiscovery').then(res => {}).catch(err => {})
				}
			}
		},
		methods: {
			close() {
				this.$emit('input', false)
			},
			connect(item) {
				this.$emit('connect', item)
				this.close()
			}
		}
	}
</script>

<style>
	.v30 {
		height: 30vh;
	}
</style>
