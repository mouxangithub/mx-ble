// 此处存储厂商提供的服务Id
let data = [{
	id: 'sxs',
	name: 'FAYA', // 设备名称
	type: 'balance', // 设备类型
	manufacturer_name: '山星盛衡器', // 厂商
	serviceId: "49535343-FE7D-4AE5-8FA9-9FAFD205E455", // 蓝牙特征值对应服务的 uuid
	characteristicId: "49535343-1E4D-4BD9-BA61-23C647249616" // 蓝牙特征值的 uuid
}, {
	id: 'hprt',
	name: 'HM-A300-120A', // 设备名称
	type: 'printer', // 设备类型
	manufacturer_name: '汉印打印机', // 厂商
	serviceId: "0000FF00-0000-1000-8000-00805F9B34FB", // 蓝牙特征值对应服务的 uuid
	characteristicId: "0000FF02-0000-1000-8000-00805F9B34FB" // 蓝牙特征值的 uuid
}]
module.exports = {
	data: data
}
