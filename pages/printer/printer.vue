<template>
	<view>
		<navigationbar :isBack="true" title="打印机" />
		<view class="cu-bar bg-white margin radius shadow">
			<view class="action">
				<text class="cuIcon-titles text-red" />
				打印机
			</view>
			<button class="cu-btn margin-right radius" @tap="opble">请选择</button>
		</view>
		<button class="cu-btn bottom lg bg-gradual-blue shadow radius">打印</button>
		<ble-modal v-model="show" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				show: false
			};
		},
		methods: {
			opble() {
				this.show = true
			}
		}
	};
</script>

<style>
</style>
