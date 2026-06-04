import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// ==================== 状态定义 ====================
export const isDark = ref(true)
export const showSettings = ref(false)
export const showCompleteDialog = ref(false)
export const showKeyboard = ref(true)
export const ignoreCase = ref(true)
export const autoNext = ref(false)
export const soundOn = ref(true)
export const autoPronounce = ref(false)
export const showHint = ref(false)
export const showUserMenu = ref(false)
export const selectedDict = ref('cet4')
export const courseName = computed(() => {
  const dictMap: Record<string, string> = {
    cet4: '四级词汇',
    cet6: '六级词汇',
    ielts: '雅思核心',
    toefl: '托福词汇',
    gre: 'GRE词汇',
    kaoyan: '考研英语',
    business: '商务英语',
    travel: '旅游英语',
    computer: '计算机英语',
    medical: '医学英语',
    law: '法律英语',
    daily: '日常口语'
  }
  return dictMap[selectedDict.value] || '四级词汇'
})

// 当前索引与输入
export const currentIndex = ref(0)
export const userInput = ref('')
export const lastKeyPressed = ref('')

// 计时
export const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
const startTime = ref<number | null>(null)
const totalStartTime = ref<number | null>(null)

// 统计
export const completedCount = ref(0)
export const correctCount = ref(0)
export const errorCount = ref(0)
export const streakCount = ref(0)
let maxStreak = 0

// 所有统计记录
export const allStats = ref<Array<{
  wpm: number
  accuracy: number
  correct: number
  errors: number
  time: number
}>>([])

// 错题本
export interface MistakeItem {
  word: string
  index: number
  count: number
  meaning: string
}
export const mistakeList = ref<MistakeItem[]>([])

// ==================== 单词数据 ====================
export interface WordData {
  word: string
  meaning: string
  pos: string
  phonetic: string
}

export const wordList = ref<WordData[]>([
  { word: 'accomplish', meaning: '完成，实现', pos: 'V.', phonetic: 'əˈkʌmplɪʃ' },
  { word: 'necessary', meaning: '必要的，必需的', pos: 'Adj.', phonetic: 'ˈnesəseri' },
  { word: 'environment', meaning: '环境，周围状况', pos: 'N.', phonetic: 'ɪnˈvaɪrənmənt' },
  { word: 'government', meaning: '政府；治理', pos: 'N.', phonetic: 'ˈɡʌvərnmənt' },
  { word: 'opportunity', meaning: '机会，时机', pos: 'N.', phonetic: 'ˌɑːpərˈtuːnəti' },
  { word: 'experience', meaning: '经历，体验；经验', pos: 'N./V.', phon: 'ɪkˈspɪriəns' },
  { word: 'development', meaning: '发展；开发；生长', pos: 'N.', phonetic: 'dɪˈveləpmənt' },
  { word: 'information', mean: '信息，消息；通知', pos: 'N.', phonetic: 'ˌɪnfərˈmeɪʃn' },
  { word: 'university', meaning: '大学，综合性高等学府', pos: 'N.', phonetic: 'ˌjuːnɪˈvɜːrsəti' },
  { word: 'significant', meaning: '重要的；有意义的', pos: 'Adj.', phonetic: 'sɪɡˈnɪfɪkənt' },
  { word: 'technology', meaning: '技术；工艺学；术语', pos: 'N.', phonetic: 'tekˈnɑːlədʒi' },
  { word: 'communication', meaning: '交流，通讯；传达', pos: 'N.', phonetic: 'kəˌmjuːnɪˈkeɪʃn' },
  { word: 'responsibility', meaning: '责任；职责', pos: 'N.', phonetic: 'rɪˌspɑːnsəˈbɪləti' },
  { word: 'international', meaning: '国际的，世界的', pos: 'Adj.', phonetic: 'ˌɪntərˈnæʃnl' },
  { word: 'particularly', meaning: '特别地，尤其', pos: 'Adv.', phonetic: 'pərˈtɪkjələrli' },
  { word: 'establishment', meaning: '建立，设立；机构', pos: 'N.', phonetic: 'ɪˈstæblɪʃmənt' },
  { word: 'achievement', meaning: '成就，成绩；完成', pos: 'N.', phonetic: 'əˈtʃiːvmənt' },
  { word: 'intelligence', meaning: '智力；情报；理解力', pos: 'N.', phonetic: 'ɪnˈtelɪdʒəns' },
  { word: 'professional', meaning: '专业的，职业的；专业人员', pos: 'Adj./N.', phonetic: 'prəˈfeʃənl' },
  { word: 'concentration', meaning: '专注，集中；浓度', pos: 'N.', phonetic: 'ˌkɑːnsnˈtreɪʃn' },
])

// ==================== 键盘布局 ====================
export const numRowKeys = ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace']
export const row1Keys = ['Q','W','E','R','T','Y','U','I','O','P','[',']','\\']
export const row2Keys = ['A','S','D','F','G','H','J','K','L',';',"'"]
export const row3Keys = ['Z','X','C','V','B','N','M',',','.','/']

// ==================== 计算属性 ====================
export const currentWord = computed(() => wordList.value[currentIndex.value]?.word || '')
export const currentWordData = computed(() => wordList.value[currentIndex.value] || {} as WordData)

export const isCurrentComplete = computed(() => {
  const target = ignoreCase.value ? currentWord.value.toLowerCase() : currentWord.value
  const input = ignoreCase.value ? userInput.value.toLowerCase() : userInput.value
  return target === input && target.length > 0
})

export const wpm = computed(() => {
  if (!startTime.value || elapsedTime.value === 0) return 0
  const minutes = elapsedTime.value / 60
  // 标准WPM计算：每5个字符为一个"词"
  const wordsTyped = correctCount.value / 5
  return Math.round(wordsTyped / minutes) || 0
})

export const accuracy = computed(() => {
  const total = correctCount.value + errorCount.value
  if (total === 0) return 100
  return Math.round((correctCount.value / total) * 100)
})

export const formattedTime = computed(() => {
  const m = Math.floor(elapsedTime.value / 60)
  const s = Math.floor(elapsedTime.value % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

export const formattedTotalTime = computed(() => {
  if (!totalStartTime.value) return '00:00'
  const total = (Date.now() - totalStartTime.value) / 1000
  const m = Math.floor(total / 60)
  const s = Math.floor(total % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

export const averageWpm = computed(() => {
  if (allStats.value.length === 0) return 0
  const sum = allStats.value.reduce((acc, s) => acc + s.wpm, 0)
  return Math.round(sum / allStats.value.length)
})

export const totalAccuracy = computed(() => {
  if (allStats.value.length === 0) return 0
  const sum = allStats.value.reduce((acc, s) => acc + s.accuracy, 0)
  return Math.round(sum / allStats.value.length)
})

// ==================== 方法实现 ====================
export const getCharClass = (idx: number) => {
  const char = currentWord.value[idx]
  const inputChar = userInput.value[idx]

  if (inputChar === undefined) {
    return { pending: true }
  }

  const targetLower = ignoreCase.value ? char.toLowerCase() : char
  const inputLower = ignoreCase.value ? inputChar.toLowerCase() : inputChar

  if (targetLower === inputLower) {
    return { correct: true }
  }
  return { error: true }
}

export const getKeyClass = (key: string) => {
  const lowerKey = key.toLowerCase()
  const expectedChar = currentWord.value[userInput.value.length]?.toLowerCase()
  if (!expectedChar && lowerKey !== ' ') return {}

  // Backspace特殊处理
  if (key === 'Backspace') {
    return { 'kb-special': true }
  }

  // 空格键处理
  if (lowerKey === ' ' && expectedChar === ' ') {
    return { expected: true, active: lastKeyPressed.value === ' ' }
  }

  // 当前需要按下的键
  if (lowerKey === expectedChar) {
    return { expected: true, active: lastKeyPressed.value.toLowerCase() === lowerKey }
  }

  // 已正确输入的键
  if (userInput.value.length > 0) {
    const pressedKeys = userInput.value.toLowerCase().split('')
    if (pressedKeys.includes(lowerKey)) {
      return { pressed: true }
    }
  }

  return {}
}

export const onKeyClick = (key: string) => {
  handleKeyPress(key)
}

const handleKeyPress = (key: string) => {
  if (showCompleteDialog.value) return

  // 开始计时
  if (!startTime.value) {
    startTime.value = Date.now()
    if (!totalStartTime.value) totalStartTime.value = Date.now()
    startTimer()
  }

  lastKeyPressed.value = key

  // 处理退格
  if (key === 'Backspace') {
    userInput.value = userInput.value.slice(0, -1)
    streakCount.value = 0
    return
  }

  // 空格处理
  if (key === ' ') key = ' '

  // 只接受可打印字符
  if (key.length === 1) {
    const targetChar = currentWord.value[userInput.value.length]
    if (targetChar !== undefined) {
      const targetLower = ignoreCase.value ? targetChar.toLowerCase() : targetChar
      const keyLower = ignoreCase.value ? key.toLowerCase() : key

      if (targetLower === keyLower) {
        correctCount.value++
        streakCount.value++
        if (streakCount.value > maxStreak) maxStreak = streakCount.value
        // 自动发音
        if (autoPronounce.value) {
          // 可以在这里调用 TTS API
        }
      } else {
        errorCount.value++
        streakCount.value = 0
        // 记录错题
        recordMistake()
      }
    } else {
      // 超出长度算错误
      errorCount.value++
      streakCount.value = 0
    }

    userInput.value += key

    // 检查是否完成当前单词
    if (isCurrentComplete.value) {
      recordStats()

      setTimeout(() => {
        if (autoNext.value && currentIndex.value < wordList.value.length - 1) {
          nextWord()
        } else if (currentIndex.value >= wordList.value.length - 1) {
          showCompletion()
        }
      }, 500)
    }
  }
}

const recordMistake = () => {
  const existing = mistakeList.value.find(
    item => item.word.toLowerCase() === currentWord.value.toLowerCase()
  )
  if (existing) {
    existing.count++
  } else {
    mistakeList.value.push({
      word: currentWord.value,
      index: currentIndex.value,
      count: 1,
      meaning: currentWordData.value.meaning || ''
    })
  }
}

const recordStats = () => {
  allStats.value.push({
    wpm: wpm.value,
    accuracy: accuracy.value,
    correct: correctCount.value,
    errors: errorCount.value,
    time: elapsedTime.value
  })
  completedCount.value++
}

const startTimer = () => {
  if (timerInterval) return
  timerInterval = setInterval(() => {
    if (startTime.value) {
      elapsedTime.value = (Date.now() - startTime.value) / 1000
    }
  }, 100)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetWord = () => {
  userInput.value = ''
  correctCount.value = 0
  errorCount.value = 0
  streakCount.value = 0
  startTime.value = null
  elapsedTime.value = 0
  stopTimer()
}

export const nextWord = () => {
  if (currentIndex.value < wordList.value.length - 1) {
    currentIndex.value++
    resetWord()
  } else {
    showCompletion()
  }
}

export const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetWord()
  }
}

export const playPronunciation = (type?: string) => {
  console.log(`播放${type || ''}发音: ${currentWord.value}`)
  // TODO: 集成 Web Speech API 或第三方 TTS 服务
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(currentWord.value)
    utterance.lang = type === 'uk' ? 'en-GB' : 'en-US'
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
  }
}

export const addToMistakes = () => {
  const existing = mistakeList.value.find(
    item => item.word === currentWord.value
  )
  if (!existing) {
    mistakeList.value.push({
      word: currentWord.value,
      index: currentIndex.value,
      count: 1,
      meaning: currentWordData.value.meaning || ''
    })
  }
  // 可以添加一个 toast 提示
}

export const getHintText = () => {
  const word = currentWord.value
  const typedLen = userInput.value.length
  if (typedLen >= word.length - 1) return `已完成大部分!`
  
  const nextChars = word.slice(typedLen, typedLen + 3)
  return `接下来是: ${nextChars}...`
}

export const goToWord = (index: number) => {
  if (index >= 0 && index < wordList.length) {
    currentIndex.value = index
    resetWord()
  }
}

export const startMistakePractice = () => {
  if (mistakeList.value.length > 0) {
    goToWord(mistakeList.value[0].index)
  }
}

export const toggleSound = () => {
  soundOn.value = !soundOn.value
}

export const retryAll = () => {
  currentIndex.value = 0
  completedCount.value = 0
  allStats.value = []
  totalStartTime.value = null
  mistakeList.value = []
  resetWord()
  showCompleteDialog.value = false
}

const showCompletion = () => {
  stopTimer()
  if (!isCurrentComplete.value && userInput.value.length > 0) {
    recordStats()
  }
  showCompleteDialog.value = true
}

// ==================== 组合式函数导出 ====================
export function useWordTyping() {
  // 在 setup 上下文中调用 useRoute，从 URL 参数读取课程 ID
  const route = useRoute()
  const courseId = route.query.course as string
  if (courseId) {
    selectedDict.value = courseId
  }

  // 键盘事件监听（必须在 setup 上下文内注册）
  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    stopTimer()
  })

  return {
    isDark,
    showSettings,
    showCompleteDialog,
    showKeyboard,
    ignoreCase,
    autoNext,
    soundOn,
    autoPronounce,
    showHint,
    showUserMenu,
    selectedDict,
    courseName,
    currentIndex,
    userInput,
    lastKeyPressed,
    elapsedTime,
    completedCount,
    correctCount,
    errorCount,
    streakCount,
    allStats,
    mistakeList,
    wordList,
    numRowKeys,
    row1Keys,
    row2Keys,
    row3Keys,
    currentWord,
    currentWordData,
    wpm,
    accuracy,
    formattedTime,
    formattedTotalTime,
    averageWpm,
    totalAccuracy,
    isCurrentComplete,
    getCharClass,
    getKeyClass,
    onKeyClick,
    playPronunciation,
    addToMistakes,
    getHintText,
    goToWord,
    startMistakePractice,
    toggleSound,
    retryAll
  }
}
