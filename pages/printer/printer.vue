<template>
	<view>
		<ble-modal v-model="show" @connect="connect" />
		<navigationbar :isBack="true" title="打印机" />
		<view class="cu-bar bg-white margin radius shadow">
			<view class="action">
				<text class="cuIcon-titles" :class="device ? 'text-green' : 'text-red'" />
				打印机
			</view>
			<button class="cu-btn margin-right radius" :class="device?'bg-green':''"
				@tap="opble">{{device?device.name:'请选择'}}</button>
		</view>
		<view class="nav-list">
			<view class="nav-li" :class="cpcl_id == (index+1)?'bg-blue':'bg-grey'"
				:style="[{animation: 'show ' + ((index+1)*0.2+1) + 's 1'}]" v-for="(item,index) in 5" :key="index"
				@tap="cpcl_id = index+1" @longpress="openCode(index+1)">
				<view class="nav-name">模板{{index+1}}</view>
				<text style="font-size: 30rpx;right: 30rpx;width: auto;">CPCL</text>
			</view>
		</view>
		<view class="text-center text-grey">长按可弹出查看CPCL编码视图</view>
		<button v-if="!dom" class="cu-btn bg-gradual-blue shadow dom" @tap="dom = true">说明</button>
		<button class="cu-btn bottom lg bg-gradual-blue shadow radius" @tap="printer">打印</button>
		<!-- 代码弹窗 -->
		<view class="cu-modal" :class="codeShow ? 'show':''" style="background: rgb(202, 202, 202, 0.6);"
			:style="[{ marginTop: CustomBar + 'px' }]" @tap="closcode">
			<view class="cu-dialog bg-black shadow padding-lg" @tap.stop="">
				<view class="flex">
					<view class="bg-red ios-circle" />
					<view class="bg-yellow ios-circle margin-left-xs" />
					<view class="bg-green ios-circle margin-left-xs" />
				</view>
				<scroll-view scroll-y scroll-x class="text-left margin-top"
					style="white-space:pre-wrap;max-height: 60vh;">
					{{cpclCode}}
				</scroll-view>
			</view>
		</view>
		<!-- 代码弹窗 -->
		<!-- 说明弹窗 -->
		<view class="cu-modal" :class="dom?'show':''" @tap="closedom" style="transition-duration: 0.6s;"
			:style="[{ marginTop: CustomBar + 'px' }]">
			<view class="cu-dialog bg-white padding" style="border-radius: 50rpx;" @tap.stop="">
				<view class="text-bold text-lg">使用说明</view>
				<view class="text-left margin-top" style="text-indent: 40rpx;">
					该打印机蓝牙模块传输指令使用的是CPCL指令（详情请看demo目录下的CPCL编程手册），具体请自行研究CPCL指令方式，理论上所有支持CPCL编码传输的打印机都通用，主要难点在于CPCL编码，我找了一圈觉得市面上可能暂时没有可视化的工具，所以目前暂时只能手撕编码，难度我觉得不大，我们目前采用的是先编码出一个cpcl模板，后台入库进行替换参数，传前端打印，编码教程也在demo下的《CPCL编程手册》，我也尝试过去做可视化的工具，对算法要求太高（得计算纸张大小转换相应的分辨率尺寸之类的，计算方式在demo下的分辨率计算方式的图片中），日后可能会继续研究
				</view>
				<view class="text-bold text-lg margin-top">测试型号</view>
				<view class="margin-top flex align-start">
					<view class="cu-tag bg-olive radius margin-xs">汉印HM-A300 √</view>
					<view class="cu-tag bg-grey radius margin-xs">其他机型自行测试</view>
				</view>
				<button class="cu-btn bg-blue margin-top radius" @tap="closedom">关闭{{countdown}}</button>
			</view>
		</view>
		<!-- 说明弹窗 -->
	</view>
</template>

<script>
	import common from '@/common/common.js';
	let time = null
	export default {
		data() {
			return {
				CustomBar: this.CustomBar,
				dom: false,
				show: false,
				device: null,
				cpcl_id: 1,
				countdown: '',
				cpclCode: '',
				codeShow: false
			};
		},
		onLoad() {
			// 弹出说明弹窗
			setTimeout(() => {
				clearInterval(time)
				var t = 10
				this.dom = true
				this.countdown = t + 's'
				time = setInterval(() => {
					t -= 1
					this.countdown = t + 's'
					if (t == 0) {
						clearInterval(time)
						this.dom = false
						setTimeout(() => {
							this.countdown = ''
						}, 1000)
					}
				}, 1000)
			}, 800)
		},
		methods: {
			closcode() {
				setTimeout(() => {
					this.cpclCode = ''
				}, 300)
				this.codeShow = false
			},
			openCode(id) {
				var cpcl_demo = require(`@/demo/cpcl-demo${id}.js`)
				this.codeShow = true
				this.cpclCode = cpcl_demo.val
			},
			closedom() {
				clearInterval(time)
				setTimeout(() => {
					this.countdown = ''
				}, 1000)
				this.dom = false
			},
			opble() {
				this.show = true
			},
			// 连接设备
			async connect(item) {
				try {
					await this.$store.dispatch('createBLEConnection', item)
					var res = await this.$store.dispatch('getProperti', {
							deviceId: item.deviceId,
							properti: 'write'
						}),
						list = Object.assign(item, res)
					this.device = list
				} catch (err) {}
			},
			// 打印
			async printer() {
				var device = this.device,
					id = this.cpcl_id,
					cpcl_demo = require(`@/demo/cpcl-demo${id}.js`),
					val = cpcl_demo.val
				if (!device) {
					return common.showToast('请选择打印机')
				}
				if (!id) {
					return common.showToast('请选择模板')
				}
				if (!val) {
					return common.showToast('模板数据异常')
				}
				try {
					common.showLoading({
						title: '打印中...',
						mask: true
					})
					await this.$store.dispatch('printing', {
						val,
						device
					})
					common.showToast('打印成功')
				} catch (err) {
					console.log(err)
					common.showToast('打印失败')
				}
			}
		}
	};
</script>

<style>
	.dom {
		width: 110rpx;
		height: 110rpx;
		border-radius: 50%;
		padding: 0;
		position: fixed;
		bottom: 20vh;
		right: 30rpx;
	}

	.ios-circle {
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
	}

	.bg-black {
		background-color: rgba(0, 0, 0, 0.8);
		color: #ffffff;
		border-radius: 30rpx;
	}
</style>
