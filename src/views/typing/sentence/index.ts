import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

// ==================== 状态定义 ====================
export const isDark = ref(true)
export const showSettings = ref(false)
export const showCompleteDialog = ref(false)
export const showKeyboard = ref(true)
export const ignoreCase = ref(true)
export const ignorePunctuation = ref(false)
export const autoNext = ref(false)
export const soundOn = ref(true)
export const autoPronounce = ref(false)
export const showTranslation = ref(true)
export const hideRightPanel = ref(false)
export const showAllMistakes = ref(false)
export const selectedArticle = ref('econ')
export const isPaused = ref(false)

// 输入相关
export const inputRef = ref<HTMLInputElement | null>(null)
export const userInput = ref('')
export const lastKeyPressed = ref('')

// 当前索引
export const currentIndex = ref(0)

// 计时
export const elapsedTime = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null
const startTime = ref<number | null>(null)
const totalStartTime = ref<number | null>(null)

// 统计
export const completedCount = ref(0)
export const correctCount = ref(0)
export const errorCount = ref(0)

export interface StatRecord {
  wpm: number
  accuracy: number
  correct: number
  errors: number
  time: number
}
export const allStats = ref<StatRecord[]>([])

export const isTyping = computed(() => userInput.value.length > 0)

// ==================== 句子数据（从课程中提取）====================
export interface SentenceData {
  english: string
  chinese: string
}

export const sentenceList = ref<SentenceData[]>([
  {
    english: 'Artificial intelligence has become an integral part of our daily lives.',
    chinese: '人工智能已成为我们日常生活中不可或缺的一部分。',
  },
  {
    english: 'From smart assistants to recommendation algorithms, AI shapes how we interact with technology.',
    chinese: '从智能助手到推荐算法，AI塑造了我们与技术的互动方式。',
  },
  {
    english: 'Machine learning enables computers to learn from experience without explicit programming.',
    chinese: '机器学习使计算机能够通过经验学习而无需显式编程。',
  },
  {
    english: 'Natural language processing allows machines to understand and generate human language.',
    chinese: '自然语言处理使机器能够理解和生成人类语言。',
  },
  {
    english: 'Deep learning models have revolutionized image recognition and speech synthesis capabilities.',
    chinese: '深度学习模型彻底改变了图像识别和语音合成能力。',
  },
  {
    english: 'The future of AI promises even greater advancements in healthcare, transportation, and education.',
    chinese: 'AI 的未来在医疗、交通和教育领域承诺带来更大的进步。',
  },
  {
    english: 'Ethical considerations around AI development have become increasingly important in recent years.',
    chinese: '近年来，围绕 AI 开发的伦理考量变得日益重要。',
  },
  {
    english: 'Researchers continue to explore the boundaries of artificial general intelligence.',
    chinese: '研究人员继续探索人工通用智能的边界。',
  },
  {
    english: 'Collaboration between humans and AI systems will define the next era of productivity.',
    chinese: '人类与 AI 系统之间的合作将定义下一个生产力时代。',
  },
  {
    english: 'Understanding AI fundamentals has become essential for professionals across all industries.',
    chinese: '了解 AI 基础知识对于各行业的专业人士来说已变得至关重要。',
  },
  {
    english: 'The integration of AI into business operations drives efficiency and innovation at scale.',
    chinese: '将 AI 集成到业务运营中以规模化方式推动效率和创新。',
  },
  {
    english: 'As technology evolves, staying informed about AI developments remains crucial for success.',
    chinese: '随着技术的发展，随时了解 AI 进展对成功至关重要。',
  },
  {
    english: 'Responsible AI deployment ensures that these powerful tools benefit society as a whole.',
    chinese: '负责任的 AI 部署确保这些强大的工具惠及整个社会。',
  },
  {
    english: 'Continuous learning and adaptation are key principles underlying all modern AI systems.',
    chinese: '持续学习和适应是所有现代 AI 系统的基本原则。',
  },
  {
    english: 'The journey of artificial intelligence is just beginning to unfold its full potential.',
    chinese: '人工智能的旅程才刚刚开始展现其全部潜力。',
  },
])

// ==================== 文章信息 ====================
export const articleTitle = computed(() => {
  const titleMap: Record<string, string> = {
    econ: '经典美文 · The Future of AI',
    tech: '科技文章 · Artificial Intelligence Revolution',
    culture: '童话故事 · Fairy Tales Collection',
    news: '电影台词 · Movie Dialogues'
  }
  return titleMap[selectedArticle.value] || '经典美文'
})

export const difficultyLevel = computed(() => 'medium') // easy / medium / hard

export const difficultyLabel = computed(() => {
  const map: Record<string, string> = { easy: '简单', medium: '中等', hard: '困难' }
  return map[difficultyLevel.value] || '中等'
})

export const totalWordCount = computed(() => {
  return sentenceList.value.reduce((total, s) => total + s.english.split(/\s+/).length, 0)
})

export const estimatedTime = computed(() => Math.ceil(totalWordCount.value / 150)) // 假设平均阅读速度 150词/分钟

// ==================== 键盘布局 ====================
export const numRowKeys = ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace']
export const row1Keys = ['Q','W','E','R','T','Y','U','I','O','P','[',']','\\']
export const row2Keys = ['A','S','D','F','G','H','J','K','L',';',"'"]
export const row3Keys = ['Z','X','C','V','B','N','M',',','.','/']

// ==================== 计算属性 ====================
export const currentSentenceData = computed(() => sentenceList.value[currentIndex.value] || {} as SentenceData)

export const displayText = computed(() => stripHtml(currentSentenceData.value.english || ''))

export const cleanChineseText = computed(() => currentSentenceData.value.chinese || '')

// 目标文本（用于比较）
const targetText = computed(() => {
  let text = displayText.value
  if (ignoreCase.value) text = text.toLowerCase()
  if (ignorePunctuation.value) text = text.replace(/[.,!?;:'"()\-—\[\]{}""''·…]/g, '')
  return text
})

const processedInput = computed(() => {
  let input = userInput.value
  if (ignoreCase.value) input = input.toLowerCase()
  if (ignorePunctuation.value) input = input.replace(/[.,!?;:'"()\-—\[\]{}""''·…]/g, '')
  return input
})

export const isCurrentComplete = computed(() => {
  const target = targetText.value
  const input = processedInput.value
  return target.length > 0 && input.length >= target.length
})

export const canNext = computed(() => isCurrentComplete.value)

export const overallProgress = computed(() =>
  Math.round(((currentIndex.value + (isCurrentComplete.value ? 1 : 0)) / sentenceList.value.length) * 100)
)

export const currentSentenceProgress = computed(() => {
  const target = targetText.value
  const input = processedInput.value
  if (target.length === 0) return 0
  return Math.min(Math.round((input.length / target.length) * 100), 100)
})

// WPM 计算
export const wpm = computed(() => {
  if (!startTime.value || elapsedTime.value === 0) return 0
  const minutes = elapsedTime.value / 60
  // 标准计算：字符数/5 / 分钟
  const chars = correctCount.value
  return Math.round((chars / 5) / minutes) || 0
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
  return Math.round(allStats.value.reduce((acc, s) => acc + s.wpm, 0) / allStats.value.length)
})

export const totalAccuracy = computed(() => {
  if (allStats.value.length === 0) return 0
  return Math.round(allStats.value.reduce((acc, s) => acc + s.accuracy, 0) / allStats.value.length)
})

// ==================== 错题本 ====================
export interface MistakeItem {
  sentencePreview: string
  index: number
  count: number
  words: Array<{ word: string; count: number }>
}
export const mistakeList = ref<MistakeItem[]>([])

export const currentMistakeWords = computed(() => {
  const currentMistake = mistakeList.value.find(item => item.index === currentIndex.value)
  return currentMistake?.words || []
})

// ==================== 方法实现 ====================
export const getRefCharClass = (idx: number) => {
  const char = displayText.value[idx]
  const inputChar = userInput.value[idx]

  if (char === undefined) return {}

  // 空格处理
  if (char === ' ') return { space: true }

  if (inputChar === undefined) return { pending: true }

  const targetLower = ignoreCase.value ? char.toLowerCase() : char
  const inputLower = ignoreCase.value ? inputChar.toLowerCase() : inputChar

  // 标点忽略
  if (ignorePunctuation.value && /[.,!?;:'"()\-—\[\]{}""''·…]/.test(char)) {
    return { punctuation: true }
  }

  if (targetLower === inputLower) return { correct: true }
  return { error: true }
}

export const getKeyClass = (key: string) => {
  const lowerKey = key.toLowerCase()
  const target = targetText.value
  const input = processedInput.value
  
  if (input.length >= target.length) return {}
  
  const expectedChar = target[input.length]?.toLowerCase()
  if (!expectedChar) return {}

  if (lowerKey === ' ' && expectedChar === ' ') {
    return { expected: true, active: lastKeyPressed.value === ' ' }
  }

  if (lowerKey === expectedChar) {
    return { expected: true, active: lastKeyPressed.value.toLowerCase() === lowerKey }
  }

  const pressedKeys = input.slice(0, input.length).toLowerCase()
  if (pressedKeys.includes(lowerKey)) return { pressed: true }

  return {}
}

export const onInput = () => handleInputChange()

export const onKeyDown = (e: KeyboardEvent) => {
  // 退格键
  if (e.key === 'Backspace') {
    e.preventDefault()
    const pos = inputRef.value?.selectionStart || userInput.value.length
    userInput.value = userInput.value.slice(0, pos - 1) + userInput.value.slice(pos)
    nextTick(() => {
      if (inputRef.value) inputRef.value.setSelectionRange(pos - 1, pos - 1)
    })
    handleInputChange()
    return
  }

  // Enter 完成当前句
  if (e.key === 'Enter' && isCurrentComplete.value) {
    e.preventDefault()
    nextSentence()
    return
  }

  // 普通按键记录
  if (e.key.length === 1) {
    lastKeyPressed.value = e.key
    
    if (!startTime.value) {
      startTime.value = Date.now()
      if (!totalStartTime.value) totalStartTime.value = Date.now()
      startTimer()
    }
  }
}

const handleInputChange = () => {
  if (showCompleteDialog.value || isPaused.value) return
  
  calculateStats()

  if (isCurrentComplete.value) {
    recordStats()
    
    setTimeout(() => {
      if (autoNext.value && currentIndex.value < sentenceList.value.length - 1) {
        nextSentence()
      } else if (currentIndex.value >= sentenceList.value.length - 1) {
        showCompletion()
      }
    }, 600)
  }
}

const calculateStats = () => {
  let correct = 0
  let errors = 0
  let wrongWords: string[] = []

  const target = targetText.value
  const input = processedInput.value

  for (let i = 0; i < input.length; i++) {
    if (i < target.length) {
      if (input[i] === target[i]) {
        correct++
      } else {
        errors++ 
        // 记录错误单词位置
        recordWrongChar(i)
      }
    } else {
      errors++
    }
  }

  correctCount.value = correct
  errorCount.value = errors
}

// 记录错误字符所属的单词
const recordWrongChar = (charIdx: number) => {
  const text = displayText.value
  // 找到这个字符所在的单词
  let wordStart = charIdx
  while (wordStart > 0 && text[wordStart - 1] !== ' ') wordStart--
  let wordEnd = charIdx
  while (wordEnd < text.length - 1 && text[wordEnd + 1] !== ' ') wordEnd++
  
  const wrongWord = text.slice(wordStart, wordEnd + 1).replace(/[.,!?;:'"]/g, '')
  if (wrongWord) {
    updateMistakeWord(wrongWord)
  }
}

const updateMistakeWord = (word: string) => {
  let mistakeEntry = mistakeList.value.find(m => m.index === currentIndex.value)
  
  if (!mistakeEntry) {
    mistakeEntry = {
      sentencePreview: displayText.value.slice(0, 40) + (displayText.value.length > 40 ? '...' : ''),
      index: currentIndex.value,
      count: 1,
      words: [{ word, count: 1 }]
    }
    mistakeList.value.push(mistakeEntry)
  } else {
    mistakeEntry.count++
    const existingWord = mistakeEntry.words.find(w => w.word.toLowerCase() === word.toLowerCase())
    if (existingWord) {
      existingWord.count++
    } else {
      mistakeEntry.words.push({ word, count: 1 })
    }
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
    if (startTime.value && !isPaused.value) {
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

const resetCurrentSentence = () => {
  userInput.value = ''
  correctCount.value = 0
  errorCount.value = 0
  startTime.value = null
  elapsedTime.value = 0
  stopTimer()
  lastKeyPressed.value = ''
  
  nextTick(() => inputRef.value?.focus())
}

export const nextSentence = () => {
  if (currentIndex.value < sentenceList.value.length - 1) {
    currentIndex.value++
    resetCurrentSentence()
  } else {
    showCompletion()
  }
}

export const prevSentence = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetCurrentSentence()
  }
}

export const skipCurrent = () => {
  nextSentence()
}

export const togglePause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    stopTimer()
  } else if (startTime.value) {
    startTimer()
  }
}

export const playSentenceAudio = () => {
  console.log('播放句子发音:', displayText.value)
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(displayText.value)
    utterance.lang = 'en-US'
    utterance.rate = 0.85
    speechSynthesis.speak(utterance)
  }
}

export const toggleSound = () => {
  soundOn.value = !soundOn.value
}

export const addToMistakes = () => {
  const existing = mistakeList.value.find(m => m.index === currentIndex.value)
  if (!existing) {
    mistakeList.value.push({
      sentencePreview: displayText.value.slice(0, 50) + '...',
      index: currentIndex.value,
      count: 1,
      words: [{ word: '整句', count: 1 }]
    })
  }
}

export const goToSentence = (index: number) => {
  if (index >= 0 && index < sentenceList.length) {
    currentIndex.value = index
    resetCurrentSentence()
  }
}

const showCompletion = () => {
  stopTimer()
  if (!isCurrentComplete.value && userInput.value.length > 0) {
    recordStats()
  }
  showCompleteDialog.value = true
}

export const retryAll = () => {
  currentIndex.value = 0
  completedCount.value = 0
  allStats.value = []
  mistakeList.value = []
  totalStartTime.value = null
  isPaused.value = false
  resetCurrentSentence()
  showCompleteDialog.value = false
}

// 工具函数：去除 HTML 标签
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '')
}

const focusInput = () => {
  if (!showCompleteDialog.value && !showSettings.value) {
    inputRef.value?.focus()
  }
}

// ==================== 组合式函数导出 ====================
export function useSentenceTyping() {
  // 在 setup 上下文中调用 useRoute，从 URL 参数读取文章 ID
  const route = useRoute()
  const articleId = route.query.article as string
  if (articleId) {
    const articleMap: Record<string, string> = {
      'essay-classic': 'econ',
      'essay-econ': 'econ',
      'tech-article': 'tech',
      'fairytale': 'culture',
      'movie-subtitle': 'news'
    }
    selectedArticle.value = articleMap[articleId] || articleId
  }

  // 生命周期钩子（必须在 setup 上下文内调用）
  onMounted(() => {
    nextTick(() => inputRef.value?.focus())
    document.addEventListener('click', focusInput)
  })

  onUnmounted(() => {
    stopTimer()
    document.removeEventListener('click', focusInput)
  })

  return {
    isDark,
    showSettings,
    showCompleteDialog,
    showKeyboard,
    ignoreCase,
    ignorePunctuation,
    autoNext,
    soundOn,
    autoPronounce,
    showTranslation,
    hideRightPanel,
    showAllMistakes,
    selectedArticle,
    isPaused,
    inputRef,
    userInput,
    lastKeyPressed,
    currentIndex,
    elapsedTime,
    completedCount,
    correctCount,
    errorCount,
    allStats,
    isTyping,
    sentenceList,
    numRowKeys,
    row1Keys,
    row2Keys,
    row3Keys,
    currentSentenceData,
    displayText,
    cleanChineseText,
    wpm,
    accuracy,
    formattedTime,
    formattedTotalTime,
    averageWpm,
    totalAccuracy,
    articleTitle,
    difficultyLevel,
    difficultyLabel,
    totalWordCount,
    estimatedTime,
    overallProgress,
    currentSentenceProgress,
    canNext,
    isCurrentComplete,
    mistakeList,
    currentMistakeWords,
    getRefCharClass,
    getKeyClass,
    onInput,
    onKeyDown,
    playSentenceAudio,
    togglePause,
    toggleSound,
    nextSentence,
    prevSentence,
    skipCurrent,
    addToMistakes,
    goToSentence,
    retryAll
  }
}
