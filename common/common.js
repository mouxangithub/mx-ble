const common = {
	isShowLoading: false,
	showLoading(object) {
		common.isShowLoading = true
		uni.showLoading(object)
	},
	hideLoading() {
		uni.hideLoading()
		common.isShowLoading = false
	},
	showToast(title, icon = 'none', position = 'bottom', duration = 1500, mask = false) {
		uni.showToast({
			title,
			icon,
			duration,
			position,
			mask
		})
	},
	showModal(content, title = '提示', fn, config) {
		uni.showModal({
			title,
			content,
			showCancel: config && config.showCancel != undefined ? config.showCancel : true,
			cancelText: config && config.cancelText ? config.cancelText : '取消',
			cancelColor: config && config.cancelColor ? config.cancelColor : '#000000',
			confirmText: config && config.confirmText ? config.confirmText : '确定',
			confirmColor: config && config.confirmColor ? config.confirmColor : '#576B95',
			success(res) {
				fn && fn(res)
			}
		})
	}
}
module.exports = common;
