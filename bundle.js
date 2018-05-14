(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
		inputField.placeholder = 'wo3 de mao1 xi3huan he1 niu2nai3'
	} else {
		inputField.placeholder = '我的猫喜欢喝牛奶'
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

},{"pinyin-utils":2}],2:[function(require,module,exports){
'use strict'

const trim = require('trim')

const codepointToUnicode = codepoint => {
	if (typeof codepoint === 'string') {
		codepoint = codepoint.replace('U+', '')
		
		if (!/^0x/.test(codepoint)) {
			codepoint = '0x' + codepoint
		}
	}

	return String.fromCodePoint(codepoint)
}

const capitalize = text => {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const vovels = {
	"a": ['ā', 'á', 'ǎ', 'à'],
	"e": ['ē', 'é', 'ě', 'è'],
	"i": ['ī', 'í', 'ǐ', 'ì'],
	"o": ['ō', 'ó', 'ǒ', 'ò'],
	"u": ['ū', 'ú', 'ǔ', 'ù'],
	"ü": ['ǖ', 'ǘ', 'ǚ', 'ǜ'],
	"m": ['m̄', 'ḿ', 'm̌', 'm̀'],
	"n": ['n̄', 'ń', 'ň', 'ǹ']
}

const getToneNumber = text => {
	text = text.toLowerCase()

	const toneNumberRegex = /[a-zü](\d)/
	if (toneNumberRegex.test(text)) {
		return parseInt(text.match(toneNumberRegex)[1])
	}

	for (let v in vovels) {
		for (var i = 0; i < vovels[v].length; i++) {
			if (text.match(vovels[v][i])) {
				return i + 1
			}
		}
	}

	return 5
}

const removeTone = text => {
	// remove tone from pinyin with tone marks
	for (let i in vovels) {
		for (let t of vovels[i]) {
			if (text.match(t)) {
				return text.replace(t, i)
			}
		}
	}

	// remove tone from pinyin with tone numbers
	return text.replace(/\d/g, '')
}

const markToNumber = (syllables, fithTone = true) => {
	const process = pinyin => {
		if (trim(pinyin).length === 0) return pinyin
		if (fithTone) {
			return removeTone(pinyin) + getToneNumber(pinyin)
		} else {
			const tone = getToneNumber(pinyin)
			return tone === 5 ? removeTone(pinyin) : removeTone(pinyin) + tone
		}
	}

	if (Array.isArray(syllables)) {
		return syllables.map(process)
	} else {
		return process(syllables)
	}
}

const numberToMark = syllables => {
	const process = pinyin => {
		if (trim(pinyin).length === 0) return pinyin

		const tone = getToneNumber(pinyin)

		pinyin = removeTone(pinyin)
	
		if (tone !== 5) {
			const matchedNM = pinyin.match(/^[nm]$/)
			if (matchedNM) {
				const letter = matchedNM[matchedNM.length - 1]
				pinyin = pinyin.replace(letter, vovels[letter][tone - 1])
			} else {
				const matchedVovels = pinyin.match(/[aeiouü]/g)
				if (matchedVovels) {
					let vovel = matchedVovels[matchedVovels.length-1]
		
					if (pinyin.match('ou')) vovel = 'o'
					if (pinyin.match('a')) vovel = 'a'
					if (pinyin.match('e')) vovel = 'e'
		
					pinyin = pinyin.replace(vovel, vovels[vovel][tone-1])
				}
			}
		}

		return pinyin
	}

	if (Array.isArray(syllables)) {
		return syllables.map(process)
	} else {
		return process(syllables)
	}
}

module.exports = {codepointToUnicode, capitalize, vovels, getToneNumber, removeTone, markToNumber, numberToMark}

},{"trim":3}],3:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}]},{},[1]);
