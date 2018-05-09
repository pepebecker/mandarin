(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const utils = require('pinyin-utils')
const zhuyin = require('zhuyin')

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
				if (typeof result.data === 'string') {
					output.innerHTML = result.data
				} else if (Array.isArray(result.data)) {
					output.innerHTML = result.data.map(item => {
						if (typeof item === 'string') {
							return item
						} else {
							return '<ul>' + item.map((word, i) => {
								if (i === 0) {
									return '<li class="active">' + word + '</li>'
								} else return '<li>' + word + '</li>'
							}).join('') + '</ul>'
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
				const response = await fetch('https://pinyin-rest.pepebecker.com/hanzi/' + encodeURIComponent(text))
				const result = await response.json()
				output.innerHTML = result.map(item => {
					if (item.length === 1) {
						return item[0].simplified
					} else {
						return '<ul>' + item.map((cahr, i) => {
							if (i === 0) {
								return '<li class="active">' + cahr.simplified + '</li>'
							} else return '<li>' + cahr.simplified + '</li>'
						}).join('') + '</ul>'
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

inputField.value = 'wǒ de māo xǐhuan hē niúnǎi'
convert()

},{"pinyin-utils":4,"zhuyin":6}],2:[function(require,module,exports){
'use strict'

const utils = require('pinyin-utils')
const wordsData = require('./words.json')

let allWords = Object.values(wordsData).reduce((o, i) => o.concat(i), [])

const wordsCount = allWords.length
for (let i = 0; i < wordsCount; i++) {
  for (let n = 1; n <= 5; n++) {
    allWords.push(utils.numberToMark(allWords[i] + n))
    allWords.push(allWords[i] + n)
  }
}

const split = (text, everything) => {
  const list = []
  let wordEnd = text.length
  while (wordEnd > 0) {
    let count = wordEnd
    let wordFound = false
    while (count > 1) {
      const word = text.substring(wordEnd - count, wordEnd)
      if (allWords.includes(word.toLowerCase())) {
        wordFound = true
        list.push(everything ? [word] : word)
        wordEnd -= (count - 1)
        break
      }
      count--
    }
    if (!wordFound && everything) {
      if (wordEnd === text.length || typeof list[list.length - 1] === 'object') {
        list.push(text[wordEnd - 1])
      }
      else if (typeof list[list.length - 1] === 'string') {
        list[list.length - 1] = text[wordEnd - 1] + list[list.length - 1]
      }
    }
    wordEnd --
  }
  return list.reverse()
}

module.exports = split

},{"./words.json":3,"pinyin-utils":4}],3:[function(require,module,exports){
module.exports={
	"a": ["a", "ba", "pa", "ma", "fa", "da", "ta", "na", "la", "ga", "ka", "ha", "zha", "cha", "sha", "za", "ca", "sa"],
	"i": ["yi", "bi", "pi", "mi", "di", "ti", "ni", "li", "ji", "qi", "xi", "zhi", "chi", "shi", "ri", "zi", "ci", "si"],
	"o": ["o", "bo", "po", "mo", "fo", "lo"],
	"e": ["e", "me", "de", "te", "ne", "le", "ge", "ke", "he", "zhe", "che", "she", "re", "ze", "ce", "se"],
	"ai": ["ai", "bai", "pai", "mai", "dai", "tai", "nai", "lai", "gai", "kai", "hai", "zhai", "chai", "shai", "zai", "cai", "sai"],
	"ei": ["ei", "bei", "pei", "mei", "fei", "dei", "tei", "nei", "lei", "gei", "kei", "hei", "zhei", "shei", "zei", "sei"],
	"ao": ["ao", "bao", "pao", "mao", "dao", "tao", "nao", "lao", "gao", "kao", "hao", "zhao", "chao", "shao", "rao", "zao", "cao", "sao"],
	"ou": ["ou", "pou", "mou", "dou", "fou", "tou", "nou", "lou", "gou", "kou", "hou", "zhou", "chou", "shou", "rou", "zou", "cou", "sou"],
	"an": ["an", "ban", "pan", "man", "fan", "dan", "tan", "nan", "lan", "gan", "kan", "han", "zhan", "chan", "shan", "ran", "zan", "can", "san"],
	"en": ["en", "ben", "pen", "men", "fen", "den", "nen", "gen", "ken", "hen", "zhen", "chen", "shen", "ren", "zen", "cen", "sen"],
	"ang": ["ang", "bang", "pang", "mang", "fang", "dang", "tang", "nang", "lang", "gang", "kang", "hang", "zhang", "chang", "shang", "rang", "zang", "cang", "sang"],
	"eng": ["eng", "beng", "peng", "meng", "feng", "deng", "teng", "neng", "leng", "geng", "keng", "heng", "zheng", "cheng", "sheng", "reng", "zeng", "ceng", "seng"],
	"er": ["er"],
	"ia": ["ya", "dia", "nia", "lia", "jia", "qia", "xia"],
	"io": ["yo"],
	"ie": ["ye", "bie", "pie", "mie", "die", "tie", "nie", "lie", "jie", "qie", "xie"],
	"iai": ["yai"],
	"iao": ["yao", "biao", "piao", "miao", "fiao", "diao", "tiao", "niao", "liao", "jiao", "qiao", "xiao"],
	"iu": ["you", "miu", "diu", "niu", "liu", "jiu", "qiu", "xiu"],
	"ian": ["yan", "bian", "pian", "mian", "dian", "tian", "nian", "lian", "jian", "qian", "xian"],
	"in": ["yin", "bin", "pin", "min", "nin", "lin", "jin", "qin", "xin"],
	"iang": ["yang", "biang", "diang", "niang", "liang", "jiang", "qiang", "xiang"],
	"ing": ["ying", "bing", "ping", "ming", "ding", "ting", "ning", "ling", "jing", "qing", "xing"],
	"u": ["wu", "bu", "pu", "mu", "fu", "du", "tu", "nu", "lu", "gu", "ku", "hu", "zhu", "chu", "shu", "ru", "zu", "cu", "su"],
	"ua": ["wa", "gua", "kua", "hua", "zhua", "chua", "shua", "rua"],
	"uo": ["wo", "duo", "tuo", "nuo", "luo", "guo", "kuo", "huo", "zhuo", "chuo", "shuo", "ruo", "zuo", "cuo", "suo"],
	"uai": ["wai", "guai", "kuai", "huai", "zhuai", "chuai", "shuai"],
	"ui": ["wei", "dui", "tui", "gui", "kui", "hui", "zhui", "chui", "shui", "rui", "zui", "cui", "sui"],
	"uan": ["wan", "duan", "tuan", "nuan", "luan", "guan", "kuan", "huan", "zhuan", "chuan", "shuan", "ruan", "zuan", "cuan", "suan"],
	"un": ["wen", "dun", "tun", "nun", "lun", "gun", "kun", "hun", "zhun", "chun", "shun", "run", "zun", "cun", "sun"],
	"uang": ["wang", "guang", "kuang", "huang", "zhuang", "chuang", "shuang"],
	"ong": ["weng", "dong", "tong", "nong", "long", "gong", "kong", "hong", "zhong", "chong", "shong", "rong", "zong", "cong", "song"],
	"ü": ["yu", "nü", "lü", "ju", "qu", "xu"],
	"üe": ["yue", "nüe", "lüe", "jue", "que", "xue"],
	"üan": ["yuan", "juan", "quan", "xuan"],
	"ün": ["yun", "lün", "jun", "qun", "xun"],
	"iong": ["yong", "jiong", "qiong", "xiong"]
}

},{}],4:[function(require,module,exports){
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

},{"trim":5}],5:[function(require,module,exports){

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

},{}],6:[function(require,module,exports){
'use strict'

const pinyinUtils = require('pinyin-utils')
const pinyinSplit = require('pinyin-split')
const py2zh = require('./py2zh')

const zhuyinTones = ["", "ˊ", "ˇ", "`", "˙"]

const fromPinyin = (input, everything) => {
  const translate = pinyin => {
    return pinyinSplit(pinyin, everything).map(item => {
      if (everything) {
        if (typeof item === 'string') return item
        else {
          let zh = py2zh[pinyinUtils.removeTone(item[0])]
          return [zh + zhuyinTones[pinyinUtils.getToneNumber(item[0]) - 1]]
        }
      } else {
        let zh = py2zh[pinyinUtils.removeTone(item)]
        return zh + zhuyinTones[pinyinUtils.getToneNumber(item) - 1]
      }
    })
  }
  if (typeof input === 'string') return translate(input)
  else return input.map(translate)
}

const splitZhuyin = (zhuyin, everything) => {
  const list = []
  let index = 0
  while (index < zhuyin.length) {
    let count = zhuyin.length - index
    let wordFound = false
    while (count > 1) {
      let word = zhuyin.substr(index, count)
      if (Object.values(py2zh).includes(word)) { // word found
        wordFound = true

        if (zhuyinTones.includes(zhuyin[index + count])) { // tone found after word
          word += zhuyin[index + count]
          count ++
        }

        list.push(everything ? [word] : word)
        index += count - 1
        break
      }
      count --
    }

    if (!wordFound && everything) {
      if (index === 0 || typeof list[list.length - 1] === 'object') {
        list.push(zhuyin[index])
      } else if (typeof list[list.length - 1] === 'string') {
        list[list.length - 1] += zhuyin[index]
      }
    }

    index ++
  }
  return list
}

const toPinyin = (zhuyin, opts = {}) => {
  let list = splitZhuyin(zhuyin, opts.everything)
  if (!opts.everything) list = list.filter(item => typeof item === 'string')
  list = list.map(item => {
    if (opts.everything && typeof item === 'string') return item
    else if (typeof item !== 'string') item = item[0]

    let tone = zhuyinTones.indexOf(item[item.length - 1]) + 1
    if (tone > 0) {
      item = item.substr(0, item.length - 1)
    } else {
      tone = 1
    }

    let pinyinIndex = Object.values(py2zh).indexOf(item)
    if (pinyinIndex > -1) {
      const pinyin = Object.keys(py2zh)[pinyinIndex] + tone
      if (opts.numbered) return (opts.everything ? [pinyin] : pinyin)
      else if (opts.everything) return [pinyinUtils.numberToMark(pinyin)]
      else return pinyinUtils.numberToMark(pinyin)
    } else {
      return item
    }
  })
  return list
}

module.exports = fromPinyin
module.exports.fromPinyin = fromPinyin
module.exports.toPinyin = toPinyin
module.exports.split = splitZhuyin

},{"./py2zh":7,"pinyin-split":2,"pinyin-utils":4}],7:[function(require,module,exports){
module.exports={
	"a": "ㄚ",
	"ai": "ㄞ",
	"an": "ㄢ",
	"ang": "ㄤ",
	"ao": "ㄠ",
	"ba": "ㄅㄚ",
	"bai": "ㄅㄞ",
	"ban": "ㄅㄢ",
	"bang": "ㄅㄤ",
	"bao": "ㄅㄠ",
	"bei": "ㄅㄟ",
	"ben": "ㄅㄣ",
	"beng": "ㄅㄥ",
	"bi": "ㄅㄧ",
	"bian": "ㄅㄧㄢ",
	"biao": "ㄅㄧㄠ",
	"bie": "ㄅㄧㄝ",
	"bin": "ㄅㄧㄣ",
	"bing": "ㄅㄧㄥ",
	"bo": "ㄅㄛ",
	"bu": "ㄅㄨ",
	"ca": "ㄘㄚ",
	"cai": "ㄘㄞ",
	"can": "ㄘㄢ",
	"cang": "ㄘㄤ",
	"cao": "ㄘㄠ",
	"ce": "ㄘㄜ",
	"cei": "ㄘㄟ",
	"cen": "ㄘㄣ",
	"ceng": "ㄘㄥ",
	"cha": "ㄔㄚ",
	"chai": "ㄔㄞ",
	"chan": "ㄔㄢ",
	"chang": "ㄔㄤ",
	"chao": "ㄔㄠ",
	"che": "ㄔㄜ",
	"chen": "ㄔㄣ",
	"cheng": "ㄔㄥ",
	"chi": "ㄔ",
	"chong": "ㄔㄨㄥ",
	"chou": "ㄔㄡ",
	"chu": "ㄔㄨ",
	"chua": "ㄔㄨㄚ",
	"chuai": "ㄔㄨㄞ",
	"chuan": "ㄔㄨㄢ",
	"chuang": "ㄔㄨㄤ",
	"chui": "ㄔㄨㄟ",
	"chun": "ㄔㄨㄣ",
	"chuo": "ㄔㄨㄛ",
	"ci": "ㄘ",
	"cong": "ㄘㄨㄥ",
	"cou": "ㄘㄡ",
	"cu": "ㄘㄨ",
	"cuan": "ㄘㄨㄢ",
	"cui": "ㄘㄨㄟ",
	"cun": "ㄘㄨㄣ",
	"cuo": "ㄘㄨㄛ",
	"da": "ㄉㄚ",
	"dai": "ㄉㄞ",
	"dan": "ㄉㄢ",
	"dang": "ㄉㄤ",
	"dao": "ㄉㄠ",
	"de": "ㄉㄜ",
	"dei": "ㄉㄟ",
	"den": "ㄉㄣ",
	"deng": "ㄉㄥ",
	"di": "ㄉㄧ",
	"dia": "ㄉㄧㄚ",
	"dian": "ㄉㄧㄢ",
	"diao": "ㄉㄧㄠ",
	"die": "ㄉㄧㄝ",
	"ding": "ㄉㄧㄥ",
	"diu": "ㄉㄧㄡ",
	"dong": "ㄉㄨㄥ",
	"dou": "ㄉㄡ",
	"du": "ㄉㄨ",
	"duan": "ㄉㄨㄢ",
	"dui": "ㄉㄨㄟ",
	"dun": "ㄉㄨㄣ",
	"duo": "ㄉㄨㄛ",
	"e": "ㄜ",
	"ei": "ㄟ",
	"en": "ㄣ",
	"eng": "ㄥ",
	"er": "ㄦ",
	"fa": "ㄈㄚ",
	"fan": "ㄈㄢ",
	"fang": "ㄈㄤ",
	"fei": "ㄈㄟ",
	"fen": "ㄈㄣ",
	"feng": "ㄈㄥ",
	"fo": "ㄈㄛ",
	"fou": "ㄈㄡ",
	"fu": "ㄈㄨ",
	"ga": "ㄍㄚ",
	"gai": "ㄍㄞ",
	"gan": "ㄍㄢ",
	"gang": "ㄍㄤ",
	"gao": "ㄍㄠ",
	"ge": "ㄍㄜ",
	"gei": "ㄍㄟ",
	"gen": "ㄍㄣ",
	"geng": "ㄍㄥ",
	"gong": "ㄍㄨㄥ",
	"gou": "ㄍㄡ",
	"gu": "ㄍㄨ",
	"gua": "ㄍㄨㄚ",
	"guai": "ㄍㄨㄞ",
	"guan": "ㄍㄨㄢ",
	"guang": "ㄍㄨㄤ",
	"gui": "ㄍㄨㄟ",
	"gun": "ㄍㄨㄣ",
	"guo": "ㄍㄨㄛ",
	"ha": "ㄏㄚ",
	"hai": "ㄏㄞ",
	"han": "ㄏㄢ",
	"hang": "ㄏㄤ",
	"hao": "ㄏㄠ",
	"he": "ㄏㄜ",
	"hei": "ㄏㄟ",
	"hen": "ㄏㄣ",
	"heng": "ㄏㄥ",
	"hm": "ㄏㄇ",
	"hng": "ㄏㄫ",
	"hong": "ㄏㄨㄥ",
	"hou": "ㄏㄡ",
	"hu": "ㄏㄨ",
	"hua": "ㄏㄨㄚ",
	"huai": "ㄏㄨㄞ",
	"huan": "ㄏㄨㄢ",
	"huang": "ㄏㄨㄤ",
	"hui": "ㄏㄨㄟ",
	"hun": "ㄏㄨㄣ",
	"huo": "ㄏㄨㄛ",
	"ji": "ㄐㄧ",
	"jia": "ㄐㄧㄚ",
	"jian": "ㄐㄧㄢ",
	"jiang": "ㄐㄧㄤ",
	"jiao": "ㄐㄧㄠ",
	"jie": "ㄐㄧㄝ",
	"jin": "ㄐㄧㄣ",
	"jing": "ㄐㄧㄥ",
	"jiong": "ㄐㄩㄥ",
	"jiu": "ㄐㄧㄡ",
	"ju": "ㄐㄩ",
	"juan": "ㄐㄩㄢ",
	"jue": "ㄐㄩㄝ",
	"jun": "ㄐㄩㄣ",
	"ka": "ㄎㄚ",
	"kai": "ㄎㄞ",
	"kan": "ㄎㄢ",
	"kang": "ㄎㄤ",
	"kao": "ㄎㄠ",
	"ke": "ㄎㄜ",
	"kei": "ㄎㄟ",
	"ken": "ㄎㄣ",
	"keng": "ㄎㄥ",
	"kong": "ㄎㄨㄥ",
	"kou": "ㄎㄡ",
	"ku": "ㄎㄨ",
	"kua": "ㄎㄨㄚ",
	"kuai": "ㄎㄨㄞ",
	"kuan": "ㄎㄨㄢ",
	"kuang": "ㄎㄨㄤ",
	"kui": "ㄎㄨㄟ",
	"kun": "ㄎㄨㄣ",
	"kuo": "ㄎㄨㄛ",
	"la": "ㄌㄚ",
	"lai": "ㄌㄞ",
	"lan": "ㄌㄢ",
	"lang": "ㄌㄤ",
	"lao": "ㄌㄠ",
	"le": "ㄌㄜ",
	"lei": "ㄌㄟ",
	"leng": "ㄌㄥ",
	"li": "ㄌㄧ",
	"lia": "ㄌㄧㄚ",
	"lian": "ㄌㄧㄢ",
	"liang": "ㄌㄧㄤ",
	"liao": "ㄌㄧㄠ",
	"lie": "ㄌㄧㄝ",
	"lin": "ㄌㄧㄣ",
	"ling": "ㄌㄧㄥ",
	"liu": "ㄌㄧㄡ",
	"lo": "ㄌㄛ",
	"long": "ㄌㄨㄥ",
	"lou": "ㄌㄡ",
	"lu": "ㄌㄨ",
	"lv": "ㄌㄩ",
	"luan": "ㄌㄨㄢ",
	"lve": "ㄌㄩㄝ",
	"lun": "ㄌㄨㄣ",
	"luo": "ㄌㄨㄛ",
	"m": "ㄇ",
	"ma": "ㄇㄚ",
	"mai": "ㄇㄞ",
	"man": "ㄇㄢ",
	"mang": "ㄇㄤ",
	"mao": "ㄇㄠ",
	"me": "ㄇㄜ",
	"mei": "ㄇㄟ",
	"men": "ㄇㄣ",
	"meng": "ㄇㄥ",
	"mi": "ㄇㄧ",
	"mian": "ㄇㄧㄢ",
	"miao": "ㄇㄧㄠ",
	"mie": "ㄇㄧㄝ",
	"min": "ㄇㄧㄣ",
	"ming": "ㄇㄧㄥ",
	"miu": "ㄇㄧㄡ",
	"mo": "ㄇㄛ",
	"mou": "ㄇㄡ",
	"mu": "ㄇㄨ",
	"n": "ㄋ",
	"na": "ㄋㄚ",
	"nai": "ㄋㄞ",
	"nan": "ㄋㄢ",
	"nang": "ㄋㄤ",
	"nao": "ㄋㄠ",
	"ne": "ㄋㄜ",
	"nei": "ㄋㄟ",
	"nen": "ㄋㄣ",
	"neng": "ㄋㄥ",
	"ng": "ㄫ",
	"ni": "ㄋㄧ",
	"nia": "ㄋㄧㄚ",
	"nian": "ㄋㄧㄢ",
	"niang": "ㄋㄧㄤ",
	"niao": "ㄋㄧㄠ",
	"nie": "ㄋㄧㄝ",
	"nin": "ㄋㄧㄣ",
	"ning": "ㄋㄧㄥ",
	"niu": "ㄋㄧㄡ",
	"nong": "ㄋㄨㄥ",
	"nou": "ㄋㄡ",
	"nu": "ㄋㄨ",
	"nv": "ㄋㄩ",
	"nuan": "ㄋㄨㄢ",
	"nve": "ㄋㄩㄝ",
	"nuo": "ㄋㄨㄛ",
	"o": "ㄛ",
	"ou": "ㄡ",
	"pa": "ㄆㄚ",
	"pai": "ㄆㄞ",
	"pan": "ㄆㄢ",
	"pang": "ㄆㄤ",
	"pao": "ㄆㄠ",
	"pei": "ㄆㄟ",
	"pen": "ㄆㄣ",
	"peng": "ㄆㄥ",
	"pi": "ㄆㄧ",
	"pian": "ㄆㄧㄢ",
	"piao": "ㄆㄧㄠ",
	"pie": "ㄆㄧㄝ",
	"pin": "ㄆㄧㄣ",
	"ping": "ㄆㄧㄥ",
	"po": "ㄆㄛ",
	"pou": "ㄆㄡ",
	"pu": "ㄆㄨ",
	"qi": "ㄑㄧ",
	"qia": "ㄑㄧㄚ",
	"qian": "ㄑㄧㄢ",
	"qiang": "ㄑㄧㄤ",
	"qiao": "ㄑㄧㄠ",
	"qie": "ㄑㄧㄝ",
	"qin": "ㄑㄧㄣ",
	"qing": "ㄑㄧㄥ",
	"qiong": "ㄑㄩㄥ",
	"qiu": "ㄑㄧㄡ",
	"qu": "ㄑㄩ",
	"quan": "ㄑㄩㄢ",
	"que": "ㄑㄩㄝ",
	"qun": "ㄑㄩㄣ",
	"r": "ㄦ",
	"ran": "ㄖㄢ",
	"rang": "ㄖㄤ",
	"rao": "ㄖㄠ",
	"re": "ㄖㄜ",
	"ren": "ㄖㄣ",
	"reng": "ㄖㄥ",
	"ri": "ㄖ",
	"rong": "ㄖㄨㄥ",
	"rou": "ㄖㄡ",
	"ru": "ㄖㄨ",
	"rua": "ㄖㄨㄚ",
	"ruan": "ㄖㄨㄢ",
	"rui": "ㄖㄨㄟ",
	"run": "ㄖㄨㄣ",
	"ruo": "ㄖㄨㄛ",
	"sa": "ㄙㄚ",
	"sai": "ㄙㄞ",
	"san": "ㄙㄢ",
	"sang": "ㄙㄤ",
	"sao": "ㄙㄠ",
	"se": "ㄙㄜ",
	"sen": "ㄙㄣ",
	"seng": "ㄙㄥ",
	"sha": "ㄕㄚ",
	"shai": "ㄕㄞ",
	"shan": "ㄕㄢ",
	"shang": "ㄕㄤ",
	"shao": "ㄕㄠ",
	"she": "ㄕㄜ",
	"shei": "ㄕㄟ",
	"shen": "ㄕㄣ",
	"sheng": "ㄕㄥ",
	"shi": "ㄕ",
	"shou": "ㄕㄡ",
	"shu": "ㄕㄨ",
	"shua": "ㄕㄨㄚ",
	"shuai": "ㄕㄨㄞ",
	"shuan": "ㄕㄨㄢ",
	"shuang": "ㄕㄨㄤ",
	"shui": "ㄕㄨㄟ",
	"shun": "ㄕㄨㄣ",
	"shuo": "ㄕㄨㄛ",
	"si": "ㄙ",
	"song": "ㄙㄨㄥ",
	"sou": "ㄙㄡ",
	"su": "ㄙㄨ",
	"suan": "ㄙㄨㄢ",
	"sui": "ㄙㄨㄟ",
	"sun": "ㄙㄨㄣ",
	"suo": "ㄙㄨㄛ",
	"ta": "ㄊㄚ",
	"tai": "ㄊㄞ",
	"tan": "ㄊㄢ",
	"tang": "ㄊㄤ",
	"tao": "ㄊㄠ",
	"te": "ㄊㄜ",
	"tei": "ㄊㄟ",
	"teng": "ㄊㄥ",
	"ti": "ㄊㄧ",
	"tian": "ㄊㄧㄢ",
	"tiao": "ㄊㄧㄠ",
	"tie": "ㄊㄧㄝ",
	"ting": "ㄊㄧㄥ",
	"tong": "ㄊㄨㄥ",
	"tou": "ㄊㄡ",
	"tu": "ㄊㄨ",
	"tuan": "ㄊㄨㄢ",
	"tui": "ㄊㄨㄟ",
	"tun": "ㄊㄨㄣ",
	"tuo": "ㄊㄨㄛ",
	"wa": "ㄨㄚ",
	"wai": "ㄨㄞ",
	"wan": "ㄨㄢ",
	"wang": "ㄨㄤ",
	"wei": "ㄨㄟ",
	"wen": "ㄨㄣ",
	"weng": "ㄨㄥ",
	"wo": "ㄨㄛ",
	"wu": "ㄨ",
	"xi": "ㄒㄧ",
	"xia": "ㄒㄧㄚ",
	"xian": "ㄒㄧㄢ",
	"xiang": "ㄒㄧㄤ",
	"xiao": "ㄒㄧㄠ",
	"xie": "ㄒㄧㄝ",
	"xin": "ㄒㄧㄣ",
	"xing": "ㄒㄧㄥ",
	"xiong": "ㄒㄩㄥ",
	"xiu": "ㄒㄧㄡ",
	"xu": "ㄒㄩ",
	"xuan": "ㄒㄩㄢ",
	"xue": "ㄒㄩㄝ",
	"xun": "ㄒㄩㄣ",
	"ya": "ㄧㄚ",
	"yan": "ㄧㄢ",
	"yang": "ㄧㄤ",
	"yao": "ㄧㄠ",
	"ye": "ㄧㄝ",
	"yi": "ㄧ",
	"yin": "ㄧㄣ",
	"ying": "ㄧㄥ",
	"yo": "ㄧㄛ",
	"yong": "ㄩㄥ",
	"you": "ㄧㄡ",
	"yu": "ㄩ",
	"yuan": "ㄩㄢ",
	"yue": "ㄩㄝ",
	"yun": "ㄩㄣ",
	"za": "ㄗㄚ",
	"zai": "ㄗㄞ",
	"zan": "ㄗㄢ",
	"zang": "ㄗㄤ",
	"zao": "ㄗㄠ",
	"ze": "ㄗㄜ",
	"zei": "ㄗㄟ",
	"zen": "ㄗㄣ",
	"zeng": "ㄗㄥ",
	"zha": "ㄓㄚ",
	"zhai": "ㄓㄞ",
	"zhan": "ㄓㄢ",
	"zhang": "ㄓㄤ",
	"zhao": "ㄓㄠ",
	"zhe": "ㄓㄜ",
	"zhei": "ㄓㄟ",
	"zhen": "ㄓㄣ",
	"zheng": "ㄓㄥ",
	"zhi": "ㄓ",
	"zhong": "ㄓㄨㄥ",
	"zhou": "ㄓㄡ",
	"zhu": "ㄓㄨ",
	"zhua": "ㄓㄨㄚ",
	"zhuai": "ㄓㄨㄞ",
	"zhuan": "ㄓㄨㄢ",
	"zhuang": "ㄓㄨㄤ",
	"zhui": "ㄓㄨㄟ",
	"zhun": "ㄓㄨㄣ",
	"zhuo": "ㄓㄨㄛ",
	"zi": "ㄗ",
	"zong": "ㄗㄨㄥ",
	"zou": "ㄗㄡ",
	"zu": "ㄗㄨ",
	"zuan": "ㄗㄨㄢ",
	"zui": "ㄗㄨㄟ",
	"zun": "ㄗㄨㄣ",
	"zuo": "ㄗㄨㄛ"
}
},{}]},{},[1]);
