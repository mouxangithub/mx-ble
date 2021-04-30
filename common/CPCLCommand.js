/**
 * CPCL指令合成库
 * By: 落魄实习生 2021-03-11 V1.0
 * 该插件为MIT开源，仅供学习交流
 * 如作它用所承受的法律责任一概与作者无关
 * ———————————————
 * font字号参数配置
 * ————————————————————————————————————————————————————————————————————————————————————
 * 字号 |   1   |   2   |   3   |   4   |   5   |   7   |   8   |  20   |  55   |  28
 * ------------------------------------------------------------------------------------
 * 大小 | 24*24 | 24*24 | 20*20 | 32*32 | 24*24 | 24*24 | 24*24 | 16*16 | 16*16 | 28*28
 * ————————————————————————————————————————————————————————————————————————————————————
 */
class CPCLCommand {
	/**
	 * 初始化纸张配置
	 * ! 作为控制会话的起始字符
	 * @param { } offset 0 整个标签的横向偏移量
	 * @param { } TDPPI 200 横向分辨率
	 * @param { } MDPPT 200 纵向分辨率
	 * @param { } height 800 标签的高度
	 * @param { } qty 1 标签数量
	 */
	constructor(config) {
		config = Object.assign({
			offset: 0,
			TDPPI: 200,
			MDPPT: 200,
			height: 800,
			qty: 1
		}, config)
		this.data = `! ${config.offset} ${config.TDPPI} ${config.MDPPT} ${config.height} ${config.qty}\r\n`
	}
	/**
	 * 文本TEXT命令
	 * @param {*} option {
		 * { } command TEXT 文本命令
		 * { } font 8 字号
		 * { } size 7 字体大小标识
		 * {*} x 横向起始位置
		 * {*} y 纵向起始位置
		 * {*} data 要打印的文本
	 }
	 * ——————————————————————————————————————————————
	 * command          | 效果
	 * ----------------------------------------------
	 * TEXT(或 T)       | 横向打印文本
	 * ----------------------------------------------
	 * VTEXT(或 VT)     | 逆时针旋转90度，纵向打印文本
	 * ----------------------------------------------
	 * TEXT90(或 T90)   | (同 VTEXT)
	 * ----------------------------------------------
	 * TEXT180(或 T180) | 逆时针旋转80度，反转打印文本
	 * ----------------------------------------------
	 * TEXT270(或 T270) | 逆时针旋转270度，纵向打印文本
	 * ——————————————————————————————————————————————
	 */
	text(option) {
		option = Object.assign({
			command: 'TEXT',
			font: 8,
			size: 7
		}, option)
		return this.push(
			`${option.command} ${option.font} ${option.size} ${option.x} ${option.y} ${option.data}\r\n`
		);
	}
	/**
	 * TEXT串联
	 * @param {*} option {
		 * { } command CONCAT 串联命令( CONCAT: 横向串联, VCONCAT: 纵向串联 )
		 * {*} x 横向起始位置
		 * {*} y 纵向起始位置
		 * {*} value [{
			 * { } font 8 字号
			 * { } size 7 字体大小标识
			 * { } offset 0 文本起始位置偏向单位
			 * {*} data 文本内容
		 }]
	 }
	 */
	concat(option) {
		option = Object.assign({
			command: 'CONCAT'
		}, option)
		var value = option.value,
			commandtext = ''
		for (var i = 0; i < value.length; i++) {
			value[i] = Object.assign({
				font: 8,
				size: 7,
				offset: 0
			}, value[i])
			commandtext = commandtext.concat(
				`${value[i].font} ${value[i].size} ${value[i].offset} ${value[i].data}\r\n`)
		}
		return this.push(`${option.command} ${option.x} ${option.y}\r\n${commandtext}ENDCONCAT\r\n`)
	}
	/**
	 * 连续打印多个标签
	 * { } val 数字数据依次递增或递减参数
	 */
	count(num = 1) {
		return this.push(`COUNT ${num}\r\n`)
	}
	/**
	 * 字体放大
	 * @param {*} option {
		 * { } w 0 字体宽度放大倍数，有效值为1-16
		 * { } h 0 字体高度放大倍数，有效值为1-16
	 }
	 */
	setmag(option) {
		option = Object.assign({
			w: 0,
			h: 0
		}, option)
		return this.push(`SETMAG ${w} ${h}\r\n`)
	}
	/**
	 * 条形码指令，指定高度宽度横向纵向打印条形码
	 * @param {*} option {
		 * { } command BARCODE 条形码指令( BARCODE(或 B): 横向打印条形码, VBARCODE(或 VB): 纵向打印条形码)
		 * { } type 128 条形码数据格式
		 * { } width 最窄的单位宽度
		 * { } ratio 宽条与窄条的比率
		 * {*} height 条形码的单位高度
		 * {*} x 横向起始位置
		 * {*} y 纵向起始位置
		 * {*} data 条形码数据
	 }
	 */
	barcode(option) {
		option = Object.assign({
			command: 'BARCODE',
			type: '128',
			width: 2,
			ratio: 1
		}, option)
		return this.push(
			`${option.command} ${option.type} ${option.width} ${option.ratio} ${option.height} ${option.x} ${option.y} ${option.data}\r\n`
		)
	}
	/**
	 * 条形码标记数据
	 * @param { } option {
		 * { } font 7 字号
		 * { } size 0 字体大小
		 * { } offset 5 文字距条码偏移量
	 }
	 */
	barcodeText(option) {
		option = Object.assign({
			font: 7,
			size: 0,
			offset: 5
		}, option ? option : {})
		return this.push(`BARCODE-TEXT ${option.font} ${option.size} ${option.size}\r\n`)
	}
	/**
	 * pdf417便携式数据文件
	 * @param { } option {
		 * { } command BARCODE 条形码指令( BARCODE(或 B): 横向打印条形码, VBARCODE(或 VB): 纵向打印条形码)
		 * { } XD 2 最窄的元素单位宽度，范围介于1-32之间
		 * { } YD 6 最窄的元素单位高度，范围介于1-32之间
		 * { } C 3 要使用的列数，数据列不包括起始/终止字符和左/右指示字符，范围介于1-30之间
		 * { } S 1 安全级别，指示要检测和/或纠正的最大错误量，范围介于0-8之间
		 * {*} x 横向起始位置
		 * {*} y 纵向起始位置
		 * {*} data 条形码数据
	 }
	 */
	pdf417() {
		option = Object.assign({
			command: 'BARCODE',
			XD: 2,
			YD: 6,
			C: 3,
			S: 1
		}, option)
		return this.push(
			`${option.command} PDF-417 ${option.x} ${option.y} XD ${option.XD} YD ${option.YD} C ${option.C} S ${option.S}\r\n${option.data}\r\nENDPDF\r\n`
		)
	}
	/**
	 * QRCode二维码
	 * @param { } option {
		 * { } command BARCODE 条形码指令( BARCODE(或 B): 横向打印二维码, VBARCODE(或 VB): 纵向打印二维码)
		 * { } M 2 QR Code规范编码(1: 原始规范, 2: 增强式编码)
		 * { } U 6 模块的单位宽度/单位高度 范围:1~32
		 * { } S M 纠错级别( H: 极高可靠性, Q: 最高可靠性, M: 标准可靠性, L: 高密度级别 )
		 * { } T A 纠错级别( N: 数字, A: 字母数字, Bxxx: 二进制包含由2个字节BCD表示数据字符的数量(xxx), K: Kanji )
		 * {*} x 横向起始位置
		 * {*} y 纵向起始位置
		 * {*} data 条形码数据
	 }
	 */
	qrcode(option) {
		option = Object.assign({
			command: 'BARCODE',
			M: 2,
			U: 6,
			S: 'M',
			T: 'A'
		}, option)
		return this.push(
			`${option.command} QR ${option.x} ${option.y} M ${option.M} U ${option.U}\r\n${option.S}${option.T},${option.data}\r\nENDQR\r\n'`
		)
	}
	/**
	 * box矩形边框
	 * @param {*} option {
		 * {*} lx 左上角的X坐标
		 * {*} ly 左上角的Y坐标
		 * {*} rx 右下角的Y坐标
		 * {*} ry 右下角的Y坐标
		 * { } width 1 矩形线条宽度
	 }
	 */
	box(lx,ly,rx,ry,width = 1) {
		return this.push(`BOX ${lx} ${ly} ${rx} ${ry} ${width}\r\n`)
	}
	/**
	 * 线条
	 * @param {*} option {
		 * {*} lx 左上角的X坐标
		 * {*} ly 左上角的Y坐标
		 * {*} rx 右下角的Y坐标
		 * {*} ry 右下角的Y坐标
		 * { } width 1 矩形线条宽度
	 }
	 */
	line(option) {
		option = Object.assign({
			width: 1
		}, option)
		return this.push(`LINE ${option.lx} ${option.ly} ${option.rx} ${option.ry} ${option.width}\r\n`)
	};
	/**
	 * 反转线条
	 * @param {*} option {
		 * {*} lx 左上角的X坐标
		 * {*} ly 左上角的Y坐标
		 * {*} rx 右下角的Y坐标
		 * {*} ry 右下角的Y坐标
		 * { } width 1 矩形线条宽度
	 }
	 */
	inverseLine(option) {
		option = Object.assign({
			width: 1
		}, option)
		return this.push(`INVERSE-LINE ${option.lx} ${option.ly} ${option.rx} ${option.ry} ${option.width}\r\n`)
	};
	/**
	 * 打印映射图像,扩展图像数据请用ASCII十六进制字符来表示
	 * @param {*} option {
		 * { } command EXPANDED-GRAPHICS 打印图像命令( EXPANDED-GRAPHICS(或 EG): 横向打印扩展图形, VEXPANDED-GRAPHICS(或 VEG): 纵向打印扩展图形, COMPRESSED-GRAPHICS(或 CG): 横向打印压缩图形, VCOMPRESSED-GRAPHICS(或 VCG): 纵向打印压缩图形)
		 * {*} width 图像宽度(以字节为单位)
		 * {*} height 图像高度(以点为单位)
		 * {*} x 横向起始位置
		 * {*} y 纵向起始位置
		 * {*} data 图像数据
	 }
	 */
	graphics(option) {
		option = Object.assign({
			command: 'EXPANDED-GRAPHICS'
		}, option)
		return this.push(`${option.command} ${option.width} ${option.height} ${option.x} ${option.y} ${option.data}\r\n`)
	};
	/**
	 * 对齐方式
	 * @param {*} alignMethod
	 */
	setAlign(alignMethod) {
		return this.push(`${alignMethod.toUpperCase()}\r\n`)
	}
	/**
	 * 假定页面宽度
	 * @param {*} width
	 */
	pageWidth(width) {
		return this.push('PW ${width}\r\n')
	}
	/**
	 * 手动送纸
	 */
	pace() {
		return this.push('PACE\r\n')
	}
	/**
	 * 连续打印标签相隔延迟时间
	 * @param {*} time
	 */
	wait(time) {
		return this.push('WAIT ${time}\r\n')
	}
	/**
	 * 更改文字字符间距
	 * @param {*} sp
	 */
	setsp(sp) {
		return this.push('SETSP ${sp}\r\n')
	}
	/**
	 * 结束输出打印
	 */
	print() {
		return this.push('PRINT\r\n')
	}
	/**
	 * 打印结束后切换至下一页顶部
	 */
	form() {
		return this.push('FORM\r\n')
	}
	/**
	 * 终止一项命令，也可在不打印的情况下执行一项命令
	 */
	end() {
		return this.push('END\r\n')
	}
	/**
	 * 在不打印情况下终止当前的控制会话
	 */
	abort() {
		return this.push('ABORT\r\n')
	}
	/**
	 * 写入命令集
	 * @param {*} command CPCL命令
	 */
	push(command) {
		return this.data = this.data.concat(command)
	}
}
export default CPCLCommand;
