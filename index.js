const cjst = require('./lib/cjst.js').cjst

const inputField = document.querySelector('.inputField')
const pinyinBtn = document.querySelector('.btn.pinyin')
const zhuyinBtn = document.querySelector('.btn.zhuyin')
const output = document.querySelector('.output')

const convert = () => {
	const text = inputField.value
	if (text.length > 0) {
		if (cjst.hasChineseCharacters(text)) {
			if (pinyinBtn.classList.contains('active')) {
				output.innerText = cjst.chineseToPinyin(text).join(' ')
			}
			if (zhuyinBtn.classList.contains('active')) {
				output.innerText = cjst.chineseToZhuyin(text)
				.map(zhuyin => zhuyin.join('')).join(' ')
			}
		} else {
			output.innerText = ''
		}
	} else {
		if (pinyinBtn.classList.contains('active')) {
			output.innerHTML = `<span class="placeholder">
					wǒ de māo xǐ huān hē niú nǎi
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
