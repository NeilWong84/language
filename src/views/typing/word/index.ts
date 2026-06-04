import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

export const isDark = ref(true)
export const showSettings = ref(false)
export const showCompleteDialog = ref(false)
export const showKeyboard = ref(true)
export const ignoreCase = ref(true)
export const autoNext = ref(true)
export const soundOn = ref(true)
export const autoPronounce = ref(false)
export const showHint = ref(false)
export const showUserMenu = ref(false)
export const selectedDict = ref('cet4')
export const zenMode = ref(false)

export const currentIndex = ref(0)
export const userInput = ref('')
export const lastKeyPressed = ref('')

export const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
const startTime = ref<number | null>(null)
const totalStartTime = ref<number | null>(null)
let typingAudioContext: AudioContext | null = null

export const completedCount = ref(0)
export const correctCount = ref(0)
export const errorCount = ref(0)
export const streakCount = ref(0)
let maxStreak = 0
const completedIndexes = new Set<number>()

export const allStats = ref<Array<{
  wpm: number
  accuracy: number
  correct: number
  errors: number
  time: number
}>>([])

export interface MistakeItem {
  word: string
  index: number
  count: number
  meaning: string
}

export const mistakeList = ref<MistakeItem[]>([])

export interface WordData {
  word: string
  meaning: string
  pos: string
  phonetic: string
}

const dictNames: Record<string, string> = {
  cet4: '四级词汇',
  cet6: '六级词汇',
  ielts: '雅思核心词',
  toefl: '托福词汇',
  gre: 'GRE 词汇',
  kaoyan: '考研英语',
  business: '商务英语',
  travel: '旅行英语',
  computer: '计算机英语',
  medical: '医学英语',
  law: '法律英语',
  daily: '日常口语'
}

export const courseName = computed(() => dictNames[selectedDict.value] || '四级词汇')

export const wordList = ref<WordData[]>([
  { word: 'accomplish', meaning: '完成，实现', pos: 'v.', phonetic: 'əˈkʌmplɪʃ' },
  { word: 'necessary', meaning: '必要的，必需的', pos: 'adj.', phonetic: 'ˈnesəseri' },
  { word: 'environment', meaning: '环境，周围状况', pos: 'n.', phonetic: 'ɪnˈvaɪrənmənt' },
  { word: 'government', meaning: '政府；治理', pos: 'n.', phonetic: 'ˈɡʌvərnmənt' },
  { word: 'opportunity', meaning: '机会，时机', pos: 'n.', phonetic: 'ˌɑːpərˈtuːnəti' },
  { word: 'experience', meaning: '经历，体验；经验', pos: 'n./v.', phonetic: 'ɪkˈspɪriəns' },
  { word: 'development', meaning: '发展；开发；生长', pos: 'n.', phonetic: 'dɪˈveləpmənt' },
  { word: 'information', meaning: '信息，消息；通知', pos: 'n.', phonetic: 'ˌɪnfərˈmeɪʃn' },
  { word: 'university', meaning: '大学，综合性高等学府', pos: 'n.', phonetic: 'ˌjuːnɪˈvɜːrsəti' },
  { word: 'significant', meaning: '重要的；有意义的', pos: 'adj.', phonetic: 'sɪɡˈnɪfɪkənt' },
  { word: 'technology', meaning: '技术；工艺学；术语', pos: 'n.', phonetic: 'tekˈnɑːlədʒi' },
  { word: 'communication', meaning: '交流，通讯；传达', pos: 'n.', phonetic: 'kəˌmjuːnɪˈkeɪʃn' },
  { word: 'responsibility', meaning: '责任；职责', pos: 'n.', phonetic: 'rɪˌspɑːnsəˈbɪləti' },
  { word: 'international', meaning: '国际的，世界的', pos: 'adj.', phonetic: 'ˌɪntərˈnæʃnl' },
  { word: 'particularly', meaning: '特别地，尤其', pos: 'adv.', phonetic: 'pərˈtɪkjələrli' },
  { word: 'establishment', meaning: '建立，设立；机构', pos: 'n.', phonetic: 'ɪˈstæblɪʃmənt' },
  { word: 'achievement', meaning: '成就，成绩；完成', pos: 'n.', phonetic: 'əˈtʃiːvmənt' },
  { word: 'intelligence', meaning: '智力；情报；理解力', pos: 'n.', phonetic: 'ɪnˈtelɪdʒəns' },
  { word: 'professional', meaning: '专业的，职业的；专业人员', pos: 'adj./n.', phonetic: 'prəˈfeʃənl' },
  { word: 'concentration', meaning: '专注，集中；浓度', pos: 'n.', phonetic: 'ˌkɑːnsnˈtreɪʃn' }
])

export const numRowKeys = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace']
export const row1Keys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\']
export const row2Keys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"]
export const row3Keys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']

export const currentWord = computed(() => wordList.value[currentIndex.value]?.word || '')
export const currentWordData = computed(() => wordList.value[currentIndex.value] || ({} as WordData))

export const isCurrentComplete = computed(() => {
  const target = ignoreCase.value ? currentWord.value.toLowerCase() : currentWord.value
  const input = ignoreCase.value ? userInput.value.toLowerCase() : userInput.value
  return target.length > 0 && target === input
})

export const wpm = computed(() => {
  if (!startTime.value || elapsedTime.value === 0) return 0
  return Math.round(correctCount.value / 5 / (elapsedTime.value / 60)) || 0
})

export const accuracy = computed(() => {
  const total = correctCount.value + errorCount.value
  if (total === 0) return 100
  return Math.round((correctCount.value / total) * 100)
})

export const formattedTime = computed(() => formatSeconds(elapsedTime.value))

export const formattedTotalTime = computed(() => {
  if (!totalStartTime.value) return '00:00'
  return formatSeconds((Date.now() - totalStartTime.value) / 1000)
})

export const averageWpm = computed(() => {
  if (allStats.value.length === 0) return 0
  return Math.round(allStats.value.reduce((sum, item) => sum + item.wpm, 0) / allStats.value.length)
})

export const totalAccuracy = computed(() => {
  if (allStats.value.length === 0) return 100
  return Math.round(allStats.value.reduce((sum, item) => sum + item.accuracy, 0) / allStats.value.length)
})

export const getCharClass = (idx: number) => {
  const char = currentWord.value[idx]
  const inputChar = userInput.value[idx]

  if (inputChar === undefined) {
    return {
      pending: true,
      current: idx === userInput.value.length && !isCurrentComplete.value
    }
  }

  const target = ignoreCase.value ? char.toLowerCase() : char
  const input = ignoreCase.value ? inputChar.toLowerCase() : inputChar

  return target === input ? { correct: true } : { error: true }
}

export const getKeyClass = (key: string) => {
  if (key === 'Backspace') return { 'kb-special': true }

  const expectedChar = currentWord.value[userInput.value.length]
  if (!expectedChar || isCurrentComplete.value) return {}

  const lowerKey = key.toLowerCase()
  const lowerExpected = expectedChar.toLowerCase()

  if (lowerKey === lowerExpected) {
    return { expected: true, active: lastKeyPressed.value.toLowerCase() === lowerKey }
  }

  if (userInput.value.toLowerCase().includes(lowerKey)) return { pressed: true }

  return {}
}

export const onKeyClick = (key: string) => {
  handleKeyPress(key)
}

export const onKeyDown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return

  if (event.key === 'Backspace') {
    event.preventDefault()
    handleKeyPress('Backspace')
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (isCurrentComplete.value) nextWord()
    return
  }

  if (event.key.length === 1) {
    event.preventDefault()
    handleKeyPress(event.key)
  }
}

export const playPronunciation = (type?: string) => {
  if (!soundOn.value || !currentWord.value || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(currentWord.value)
  utterance.lang = type === 'uk' ? 'en-GB' : 'en-US'
  utterance.rate = 0.82
  window.speechSynthesis.speak(utterance)
}

export const addToMistakes = () => {
  recordMistake()
}

export const getHintText = () => {
  const typedLen = userInput.value.length
  if (typedLen >= currentWord.value.length - 1) return '已经接近完成，检查最后一个字符。'

  const nextChars = currentWord.value.slice(typedLen, typedLen + 3)
  return `接下来输入: ${nextChars}`
}

export const goToWord = (index: number) => {
  if (index >= 0 && index < wordList.value.length) {
    currentIndex.value = index
    resetWord()
  }
}

export const startMistakePractice = () => {
  const first = mistakeList.value[0]
  if (first) goToWord(first.index)
}

export const toggleSound = () => {
  soundOn.value = !soundOn.value
}

export const toggleZenMode = () => {
  zenMode.value = !zenMode.value
}

export const retryAll = () => {
  currentIndex.value = 0
  completedCount.value = 0
  correctCount.value = 0
  errorCount.value = 0
  streakCount.value = 0
  maxStreak = 0
  allStats.value = []
  mistakeList.value = []
  totalStartTime.value = null
  completedIndexes.clear()
  showCompleteDialog.value = false
  resetWord()
}

const handleKeyPress = (key: string) => {
  if (showCompleteDialog.value) return

  if (key === 'Backspace') {
    userInput.value = userInput.value.slice(0, -1)
    streakCount.value = 0
    lastKeyPressed.value = key
    return
  }

  if (isCurrentComplete.value) return
  if (key.length !== 1) return

  startPracticeTimer()

  const targetChar = currentWord.value[userInput.value.length]
  if (targetChar === undefined) return

  const typedChar = normalizeTypedChar(key, targetChar)
  lastKeyPressed.value = typedChar

  if (isSameChar(targetChar, typedChar)) {
    correctCount.value++
    streakCount.value++
    maxStreak = Math.max(maxStreak, streakCount.value)
    playTypingSound('correct')
  } else {
    errorCount.value++
    streakCount.value = 0
    recordMistake()
    playTypingSound('error')
  }

  userInput.value += typedChar

  if (isCurrentComplete.value) {
    recordStats()
    if (autoPronounce.value) playPronunciation()

    window.setTimeout(() => {
      if (autoNext.value) {
        nextWord()
      } else if (currentIndex.value >= wordList.value.length - 1) {
        showCompletion()
      }
    }, 500)
  }
}

const normalizeTypedChar = (key: string, targetChar: string) => {
  if (ignoreCase.value && key.toLowerCase() === targetChar.toLowerCase()) return targetChar
  return key
}

const isSameChar = (targetChar: string, typedChar: string) => {
  const target = ignoreCase.value ? targetChar.toLowerCase() : targetChar
  const typed = ignoreCase.value ? typedChar.toLowerCase() : typedChar
  return target === typed
}

const playTypingSound = (type: 'correct' | 'error') => {
  if (!soundOn.value || typeof window === 'undefined') return

  const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioContextCtor) return

  if (!typingAudioContext) {
    typingAudioContext = new AudioContextCtor()
  }

  if (typingAudioContext.state === 'suspended') {
    void typingAudioContext.resume()
  }

  const now = typingAudioContext.currentTime
  const oscillator = typingAudioContext.createOscillator()
  const gain = typingAudioContext.createGain()
  const isCorrect = type === 'correct'
  const duration = isCorrect ? 0.075 : 0.13

  oscillator.type = isCorrect ? 'sine' : 'triangle'
  oscillator.frequency.setValueAtTime(isCorrect ? 880 : 220, now)
  oscillator.frequency.exponentialRampToValueAtTime(isCorrect ? 1320 : 120, now + duration)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(isCorrect ? 0.08 : 0.11, now + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(gain)
  gain.connect(typingAudioContext.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
}

const recordMistake = () => {
  const existing = mistakeList.value.find(
    item => item.word.toLowerCase() === currentWord.value.toLowerCase()
  )

  if (existing) {
    existing.count++
    return
  }

  mistakeList.value.push({
    word: currentWord.value,
    index: currentIndex.value,
    count: 1,
    meaning: currentWordData.value.meaning || ''
  })
}

const recordStats = () => {
  if (completedIndexes.has(currentIndex.value)) return

  completedIndexes.add(currentIndex.value)
  completedCount.value = completedIndexes.size
  allStats.value.push({
    wpm: wpm.value,
    accuracy: accuracy.value,
    correct: correctCount.value,
    errors: errorCount.value,
    time: elapsedTime.value
  })
}

const startPracticeTimer = () => {
  if (!startTime.value) {
    startTime.value = Date.now()
    if (!totalStartTime.value) totalStartTime.value = Date.now()
  }

  if (timerInterval) return
  timerInterval = window.setInterval(() => {
    if (startTime.value) {
      elapsedTime.value = (Date.now() - startTime.value) / 1000
    }
  }, 100)
}

const stopTimer = () => {
  if (timerInterval) {
    window.clearInterval(timerInterval)
    timerInterval = null
  }
}

const resetWord = () => {
  userInput.value = ''
  correctCount.value = 0
  errorCount.value = 0
  streakCount.value = 0
  lastKeyPressed.value = ''
  startTime.value = null
  elapsedTime.value = 0
  showHint.value = false
  stopTimer()

  if (autoPronounce.value) {
    window.setTimeout(() => playPronunciation(), 150)
  }
}

export const nextWord = () => {
  if (currentIndex.value < wordList.value.length - 1) {
    currentIndex.value++
    resetWord()
    return
  }

  showCompletion()
}

export const prevWord = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetWord()
  }
}

const showCompletion = () => {
  stopTimer()
  showCompleteDialog.value = true
}

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useWordTyping() {
  const route = useRoute()
  const courseId = route.query.course as string
  if (courseId) selectedDict.value = courseId

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
    toggleZenMode,
    zenMode,
    retryAll
  }
}
