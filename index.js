const utils = require('pinyin-utils')

const inputField = document.querySelector('.inputField')
const pinyinBtn = document.querySelector('.btn.pinyin')
const zhuyinBtn = document.querySelector('.btn.zhuyin')
const hanziBtn = document.querySelector('.btn.hanzi')
const output = document.querySelector('.output')

const addClickListeners = () => {
	output.querySelectorAll('ul').forEach(ul => {
		ul.addEventListener('click', () => {
			ul.classList.toggle('active')
		})
	})
	output.querySelectorAll('li').forEach(li => {
		li.addEventListener('click', () => {
			li.parentNode.querySelector('li.active').classList.remove('active')
			li.classList.add('active')
		})
	})
}

const buildList = items => {
	return '<ul>' + items.map((item, i) => {
		if (i === 0) {
			return '<li class="active">' + item + '</li>'
		} else {
			return '<li>' + item + '</li>'
		}
	}).join('') + '</ul>'
}

const convert = async () => {
	const text = inputField.value
	if (text.length > 0) {
		if (pinyinBtn.classList.contains('active') || zhuyinBtn.classList.contains('active')) {
			try {
				let response = null
				if (pinyinBtn.classList.contains('active')) {
					response = await fetch('https://pinyin-rest.pepebecker.com/pinyin/' + encodeURIComponent(text))
				}
				if (zhuyinBtn.classList.contains('active')) {
					response = await fetch('https://pinyin-rest.pepebecker.com/zhuyin/' + encodeURIComponent(text))
				}
				const result = await response.json()
				if (Array.isArray(result.data)) {
					output.innerHTML = result.data.map(item => {
						if (typeof item === 'string') {
							return ' ' + item + ' '
						} else {
							return ' ' + (item.length > 1 ? buildList(item) : item) + ' '
						}
					}).join('')
				} else if (result.text) {
					output.innerText = result.text
				}
				addClickListeners()
			} catch (err) {
				console.error(err)
			}
		}
		if (hanziBtn.classList.contains('active')) {
			try {
				const response = await fetch('https://pinyin-rest.pepebecker.com/hanzi/' + encodeURIComponent(text) + '?getIndex=true')
				const result = await response.json()
				output.innerHTML = result.map(item => {
					if (typeof item === 'string') {
						return item
					} else if (Array.isArray(item)) {
						return (item.length > 1 ? buildList(item) : item)
					} else {
						return item.simplified
					}
				}).join('')
				addClickListeners()
			} catch (err) {
				console.error(err)
			}
		}
	} else {
		if (pinyinBtn.classList.contains('active')) {
			output.innerHTML = `<span class="placeholder">
					wǒ de māo xǐhuan hē niúnǎi
			</span>`
		}
		if (zhuyinBtn.classList.contains('active')) {
			output.innerHTML = `<span class="placeholder">
				ㄨㄛˇ ㄉㄜ ㄇㄠ ㄒㄧˇ ㄏㄨㄢ ㄏㄜ ㄋㄧㄡˊ ㄋㄞˇ
			</span>`
		}
		if (hanziBtn.classList.contains('active')) {
			output.innerHTML = `<span class="placeholder">
				我的猫喜欢喝牛奶
			</span>`
		}
	}
}

const setMode = (mode, shouldConvert = false) => {
	if (mode === 'pinyin') {
		pinyinBtn.classList.add('active')
		zhuyinBtn.classList.remove('active')
		hanziBtn.classList.remove('active')
	}
	if (mode === 'zhuyin') {
		pinyinBtn.classList.remove('active')
		zhuyinBtn.classList.add('active')
		hanziBtn.classList.remove('active')
	}
	if (mode === 'hanzi') {
		pinyinBtn.classList.remove('active')
		zhuyinBtn.classList.remove('active')
		hanziBtn.classList.add('active')
	}
	if (shouldConvert) {
		convert()
	}
}

pinyinBtn.addEventListener('click', () => setMode('pinyin', true))
zhuyinBtn.addEventListener('click', () => setMode('zhuyin', true))
hanziBtn.addEventListener('click', () => setMode('hanzi', true))

inputField.addEventListener('input', convert)

convert()
