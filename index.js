const cjst = require('./lib/cjst.js').cjst
const utils = require('pinyin-utils')

const inputField = document.querySelector('.inputField')
const pinyinBtn = document.querySelector('.btn.pinyin')
const zhuyinBtn = document.querySelector('.btn.zhuyin')
const output = document.querySelector('.output')

const convert = () => {
	const text = inputField.value
	if (text.length > 0) {
		if (pinyinBtn.classList.contains('active')) {
			fetch('https://pinyin-rest.pepebecker.com/pinyin/' + encodeURIComponent(text))
			.then(response => response.json())
			.then(result => {
				if (result.text) {
					output.innerText = result.text
				}
			})
			.catch(err => {
				console.error(err)
			})
		}
		if (zhuyinBtn.classList.contains('active')) {
			if (cjst.hasChineseCharacters(text)) {
				output.innerText = cjst.chineseToZhuyin(text)
				.map(zhuyin => zhuyin.join('')).join(' ')
			} else {
				fetch('https://pinyin-rest.pepebecker.com/pinyin/' + encodeURIComponent(text) + '?split=true')
				.then(response => response.json())
				.then(result => {
					if (result.data) {
						result = result.data.map(utils.numberToMark).join(' ')
						output.innerText = cjst.pinyinToZhuyin(result)
						.map(zhuyin => zhuyin.join('')).join(' ')
					}
				})
				.catch(err => {
					console.error(err)
				})
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
	}
}

const setMode = (mode, shouldConvert = false) => {
	if (mode === 'pinyin') {
		pinyinBtn.classList.add('active')
		zhuyinBtn.classList.remove('active')
	}
	if (mode === 'zhuyin') {
		pinyinBtn.classList.remove('active')
		zhuyinBtn.classList.add('active')
	}
	if (shouldConvert) {
		convert()
	}
}

pinyinBtn.addEventListener('click', () => setMode('pinyin', true))
zhuyinBtn.addEventListener('click', () => setMode('zhuyin', true))

inputField.addEventListener('input', convert)

convert()
