<template>
	<view>
		<!-- A 蓝牙/搜索开关-->
		<view class="cu-list menu r">
			<view class="cu-item">
				<view class="left">蓝牙</view>
				<switch @change="openBle" :class="isOpenBle ? 'checked' : ''" :checked="isOpenBle" />
			</view>
			<view class="cu-item">
				<view class="left">搜索</view>
				<button class="cu-btn bg-green" @tap="dispatch('openbledd')">{{ bledd ? '关闭' : '搜索' }}</button>
			</view>
		</view>
		<!-- A 蓝牙/搜索开关-->
		<!-- B 已配对设备列表 -->
		<view class="bg-white r margin-top" v-if="isOpenBle">
			<view class="cu-bar solid-bottom"><view class="action">已配对设备</view></view>
			<view class="padding-top padding-bottom text-center" v-if="paired.length == 0">暂无设备</view>
			<scroll-view v-else scroll-y="true" class="r" show-scrollbar="true">
				<view class="cu-list menu text-left r">
					<view class="cu-item" v-for="(item, index) in paired" :key="index" @tap="dispatch('createBLEConnection', item)" @longpress="longpress(item)">
						<view class="content">{{ item.name }}</view>
						<view><text class="right" :class="item.status ? 'text-green cuIcon-roundcheckfill' : 'text-red cuIcon-roundclosefill'" /></view>
						<view style="width: 100rpx;" @tap.stop="openSetting(index)">
							<button class="cu-btn cuIcon-settingsfill margin-left bg-grey" style="border-radius: 50%;width: 60rpx;height: 60rpx;" />
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- B 已配对设备列表 -->
		<!-- C 可用设备列表 -->
		<view class="bg-white r margin-top" v-if="isOpenBle">
			<view class="cu-bar solid-bottom">
				<view class="action">可用设备</view>
				<view class="action"><view class="cu-load load-cuIcon" :class="bledd ? 'loading' : 'over'"></view></view>
			</view>
			<view class="padding-top padding-bottom text-center" v-if="devicesList.length == 0 && !bledd">暂无设备</view>
			<view class="padding-top padding-bottom text-center" v-else-if="devicesList.length == 0 && bledd">正在搜索...</view>
			<scroll-view v-else scroll-y="true" class="r" show-scrollbar="true">
				<view class="cu-list menu text-left r">
					<view class="cu-item" v-for="(item, index) in devicesList" :key="index" @tap="dispatch('createBLEConnection', item)">
						<view class="content">{{ item.name }}</view>
						<text class="right text-blue cuIcon-roundaddfill" />
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- C 可用设备列表 -->
	</view>
</template>

<script>
export default {
	name: 'bluetooth',
	data() {
		return {
			isOpenBle: this.$store.getters.getIsOpenBle, // 是否开启蓝牙
			paired: this.$store.getters.getPaired, // 已配对设备列表
			bledd: this.$store.getters.getBledd, // 是否启用蓝牙搜索
			devicesList: this.$store.getters.getDevicesList, // 可用设备列表
			manufacturer: this.$store.getters.getManufacturer // 厂商设备
		};
	},
	props: {
		drawer: {
			type: String
		}
	},
	watch: {
		'$store.state.bluetooth': {
			handler(e) {
				this.isOpenBle = e.isOpenBle;
				this.paired = e.paired;
				this.bledd = e.bledd;
				this.devicesList = e.devicesList;
			},
			immediate: true,
			deep: true
		}
	},
	methods: {
		// 打开蓝牙
		openBle(e) {
			!this.isOpenBle ? this.dispatch('openBluetoothAdapter') : this.dispatch('closeBluetoothAdapter');
		},
		// 使用store的函数
		dispatch(name, item) {
			this.$store.dispatch(name, item);
		},
		// 长按操作
		longpress(item) {
			// 如果无连接执行删除
			if (item.status) {
				this.$emit('longpress', item);
			} else {
				this.dispatch('delpaired', item);
			}
		},
		openSetting(index) {
			this.$emit('openSetting', index);
		}
	}
};
</script>

<style>
.r {
	border-radius: 30rpx;
}
</style>
