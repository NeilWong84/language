import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// ==================== 主题 ====================
const isDark = ref(true)
const toggleTheme = () => {
  isDark.value = !isDark.value
}

// ==================== 基础状态 ====================
const videoPlayer = ref(null)
const scrollContainerRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(130)
const duration = ref(283)
const playbackRate = ref(1)
const currentSentenceIndex = ref(0)
const practiceMode = ref('read')
const displayMode = ref('read')
const dictationText = ref('')
const translateText = ref('')
const showOriginal = ref(false)  // 是否显示原文
const subtitlePreviewSet = ref(new Set<number>())  // 隐藏按钮：已展开预览的行索引集合
const readExpandSet = ref(new Set<number>())  // 阅读模式：已展开中文的行索引集合
const translateExpandSet = ref(new Set<number>())  // 中译英模式：已展开英文的行索引集合

// 挖空模式：已显示的空白记录（用对象实现响应式，key="${idx}-${word}"）
const blankRevealed = ref<Record<string, boolean>>({})
const isFavorite = ref(false)
const videoVisible = ref(true)
const showPhonetic = ref(true)

const episode = ref(48)
const videoTitle = ref('English Learning at TEcoLab')

// 弹窗
const showSettings = ref(false)
const showSentenceManage = ref(false)
const activeStTab = ref('fullscreen')

// 设置项
const fontSize = ref(18)
const optVideoCentered = ref(true)
const optHidePauseIcon = ref(false)
const optShowPhonetic = ref(true)
const optShowNotes = ref(false)
const optSubPosition = ref('both')
const optDynamicSub = ref('karaoke')
const optThemeColor = ref('dark')
const optFollowHighlight = ref(false)

// 词卡
const wordcardSortBy = ref('default')
const totalStudyTime = computed(() => wordcardData.value.length)
const activeWcIndex = ref(3) // 默认选中第4个
const selectedWordDetail = ref(null)

// 社交分享列表
const socialShareList = ['wechat', 'qq', 'weibo', 'twitter', 'github', 'link']

// 自定义 Tab 选项列表
const modeTabs = [
  { value: 'bilingual', label: '双语' },
  { value: 'english', label: '英语' },
  { value: 'chinese', label: '中文' },
  { value: 'dictation', label: '听写' },
  { value: 'blank', label: '词组' },
  { value: 'read', label: '阅读' },
  { value: 'translation', label: '中译英' },
  { value: 'wordcard', label: '词卡' },
]

// 设置选项卡
const settingTabs = [
  { key: 'fullscreen', label: '全屏', icon: 'fullscreen-1' },
  { key: 'bookmark', label: '保藏', icon: 'bookmark-1' },
  { key: 'ogf', label: '字幕OGF', icon: 'file-paste' },
  { key: 'live', label: '直播', icon: 'desktop' },
  { key: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
]

// ==================== 完整字节数据（对齐UI图） ====================
const subtitles = ref([
  {
    startTime: '0:00', endTime: '0:05',
    english: 'This is <span class="kw kw-orange" data-w="Erewhon">Erewhon</span> the most expensive <span class="kw kw-green" data-w="grocery store">grocery store</span> in the world, but it is so much more than that.',
    chinese: '这里是 Erehwon，全世界最贵的杂货店，但它远不止于此。',
    fav: false,
  },
  {
    startTime: '0:05', endTime: '0:10',
    english: "It's a <span class='kw kw-purple' data-w='status symbol'>status symbol</span>, a <span class='kw kw-blue' data-w='cultural phenomenon'>cultural phenomenon</span>.",
    chinese: '它是一种地位象征，是一种文化现象。',
    fav: false,
  },
  {
    startTime: '0:10', endTime: '0:16',
    english: "and a place where <span class='kw kw-green' data-w='celebrities'>celebrities</span> go and spend more on a <span class='kw kw-yellow' data-w='smoothie'>smoothie</span> than most people spend on dinner.",
    chinese: '也是那些名流们光顾的地方，他们在一杯奶昔上花费的金额比大多数人一顿饭还多。',
    fav: false,
  },
  {
    startTime: '0:16', endTime: '0:22',
    english: "Other other <span class='kw kw-green' data-w='luxury'>luxury</span> grocers like Whole Foods <span class='kw kw-orange' data-w='might'>might</span> <span class='kw kw-yellow' data-w='charge'>charge</span> you a <span class='kw kw-green' data-w='premium'>premium</span>.",
    chinese: '虽然其他像Whole Foods这类的高端杂货店也可能收取额外费用。',
    fav: false,
  },
  {
    startTime: '0:22', endTime: '0:28',
    english: "<span class='kw kw-orange' data-w='Erewhon'>Erewhon</span>, <span class='kw kw-orange' data-w='somehow'>somehow</span>, convinced an enclave of Los Angeles that purchases like a single $20 Japanese strawberry or $40 COMOS shell, whatever the fuck that is, are reasonable purchases.",
    chinese: '但 Erewhon 不知怎地让洛杉矶的一个小圈层相信，像一颗20美元的日本草莓或40美元的海鲜这种商品（谁知道那是啥），是合理的消费。',
    fav: false,
  },
  {
    startTime: '0:28', endTime: '0:33',
    english: "And people aren't just <span class='kw kw-orange' data-w='willing'>willing</span> to pay, they are <span class='kw kw-green' data-w='lining up'>lining up</span> to pay.",
    chinese: '人们不仅愿意花钱，还在排队付钱。',
    fav: false,
  },
  {
    startTime: '0:33', endTime: '0:38',
    english: "The question is why?",
    chinese: '问题就是，为什么？',
    fav: false,
  },
  {
    startTime: '0:38', endTime: '0:44',
    english: "What's the <span class='kw kw-green' data-w='business strategy'>business strategy</span> that turned a tiny health store into LA's most exclusive food spot?",
    chinese: '究竟是什么商业策略，将一家小型的健康食品店变成了LA最独特的美食场所？',
    fav: false,
  },
  {
    startTime: '0:44', endTime: '0:49',
    english: 'Because as fun as it is to poke fun at some of this stuff.',
    chinese: '因为这事儿本身就挺有意思的。',
    fav: false,
  },
  {
    startTime: '0:49', endTime: '0:55',
    english: "<span class='kw kw-green' data-w='I figure'>I figure</span> there's got to be more to it than <span class='kw kw-yellow' data-w='overpriced'>overpriced</span> <span class='kw kw-green' data-w='produce'>produce</span> and <span class='kw kw-blue' data-w='celebrity spotting'>celebrity spotting</span>.",
    chinese: '我觉得这背后肯定有比昂贵的农产品和名人出没更深层的东西。',
    fav: false,
  },
  {
    startTime: '0:55', endTime: '1:00',
    english: '<span class="kw kw-orange" data-w="guess what">guess what</span>, <span class="kw kw-green" data-w="dug into">dug into</span> it.',
    chinese: '所以我们就来深挖一下。',
    fav: false,
  },
  {
    startTime: '1:00', endTime: '1:06',
    english: "And today we're <span class='kw kw-orange' data-w='investigating'>investigating</span> how <span class='kw kw-orange' data-w='Erewhon'>Erewhon</span> created a <span class='kw kw-green' data-w='business model'>business model</span> that's part <span class='kw kw-yellow' data-w='grocery store'>grocery store</span>, part venture capital firm for wellness brands, and part social club for the wellness elite.",
    chinese: '今天我们来深入探讨 Erewhon 是如何打造出一种商业模式的——它既是杂货店，部分是面向健康品牌的创业投资公司，部分又是精英阶层的社交俱乐部。',
    fav: false,
  },
  {
    startTime: '1:06', endTime: '1:11',
    english: "Let's discuss.",
    chinese: '来聊聊吧。',
    fav: false,
  },
  {
    startTime: '1:11', endTime: '1:17',
    english: "It's actually really good.",
    chinese: '它确实非常出色。',
    fav: false,
  },
  {
    startTime: '1:17', endTime: '1:23',
    english: "Now, before we <span class='kw kw-orange' data-w='get into'>get into</span> the <span class='kw kw-green' data-w='business strategy'>business strategy</span>, which is <span class='kw kw-purple' data-w='super'>super</span> interesting and a little surprising.",
    chinese: '在进入商业策略之前——这个策略超级有趣且有些令人意外——',
    fav: false,
  },
  {
    startTime: '1:23', endTime: '1:29',
    english: "I'm not here to <span class='kw kw-orange' data-w='yank your chain'>yank your chain</span>.",
    chinese: '我不是来忽悠你的。',
    fav: false,
  },
  {
    startTime: '1:29', endTime: '1:35',
    english: "So we're going to start with the <span class='kw kw-orange' data-w='Erewhon'>Erewhon</span> experience.",
    chinese: '所以我们先从 Erewhon 的体验说起。',
    fav: false,
  },
  {
    startTime: '1:35', endTime: '1:41',
    english: "You <span class='kw kw-orange' data-w='walk n'>walk n</span> and are greeted <span class='kw kw-green' data-w='off to the side'>off to the side</span> here with a <span class='kw kw-green' data-w='smoothie bar'>smoothie bar</span>.",
    chinese: '你走进去，旁边就有一家奶昔店迎接你。',
    fav: false,
  },
  {
    startTime: '1:41', endTime: '1:47',
    english: "lots of renowned food and a delicious hot food bar.",
    chinese: '大量知名美食和一个美味的热食自助台。',
    fav: false,
  },
  // ---- 以下是对齐UI图36-44的内容 ----
  {
    startTime: '2:10', endTime: '2:13',
    english: '<span class="kw kw-orange" data-w="Profit">Profit</span> <span class="kw kw-orange" data-w="margins">margins</span> on these <span class="kw kw-yellow" data-w="puppies">puppies</span> are nice and high, but more on that <span class="kw kw-orange" data-w="later">later</span>.',
    chinese: '这些热食的利润率非常高，不过这我们后面再说。',
    fav: false,
  },
  {
    startTime: '2:13', endTime: '2:16',
    english: 'Some of the most popular items include the <span class="kw kw-green" data-w="mac and cheese">mac and cheese</span> and the <span class="kw kw-yellow" data-w="sushi">sushi</span> sandwich.',
    chinese: '最受欢迎的包括芝士通心粉和寿司三明治。',
    fav: false,
  },
  {
    startTime: '2:16', endTime: '2:27',
    english: 'First <span class="kw kw-orange" data-w="reaction">reaction</span>, first <span class="kw kw-orange" data-w="sip">sip</span>, $20 <span class="kw kw-yellow" data-w="smoothie">smoothie</span>, which I would never buy, <span class="kw kw-orange" data-w="except">except</span> for a video. Cheers to you guys.',
    chinese: '第一次尝，第一口，这是我平时绝不会买的20美元奶昔，纯粹为了视频。敬你们一杯！',
    fav: false,
  },
  {
    startTime: '2:33', endTime: '2:35',
    english: "Holy shit, it's really good.",
    chinese: '我靠，还挺好喝。',
    fav: false,
  },
  {
    startTime: '2:35', endTime: '2:37',
    english: "That's not even a <span class=\"kw kw-orange\" data-w=\"fake\">fake</span> <span class=\"kw kw-orange\" data-w=\"reaction\">reaction</span>. Try it.",
    chinese: '这可不是装出来的反应，试试。',
    fav: false,
  },
  {
    startTime: '2:37', endTime: '2:39',
    english: "That's one of the best things I've had.",
    chinese: '这是我喝过最棒的之一。',
    fav: false,
  },
  {
    startTime: '2:39', endTime: '2:40',
    english: "It's like <span class=\"kw kw-orange\" data-w=\"coconutty\">coconutty</span> and <span class=\"kw kw-yellow\" data-w=\"delicious\">delicious</span>.",
    chinese: '椰子味十足，非常美味。',
    fav: false,
  },
  {
    startTime: '2:40', endTime: '2:42',
    english: 'This is my <span class="kw kw-orange" data-w="filmer">filmer</span> for the day, by the <span class="kw kw-orange" data-w="way">way</span>.',
    chinese: '顺便说一句，她是我今天的摄影师。',
    fav: false,
  },
  {
    startTime: '2:42', endTime: '2:44',
    english: 'She also <span class="kw kw-orange" data-w="birthed">birthed</span> me.',
    chinese: '她也是我妈妈。',
    fav: false,
  },
  {
    startTime: '2:44', endTime: '2:46',
    english: "It's good, huh?",
    chinese: '好喝吧？',
    fav: false,
  },
])

// ==================== 词卡数据（对齐UI图 f386e927）====================
const wordcardData = ref([
  { word: 'somehow', difficulty: '考八' },
  { word: 'obviously', difficulty: '考八' },
  { word: 'spot', difficulty: '考四' },
  { word: 'convince', difficulty: '考四' },   // UI图中高亮项#4
  { word: 'tiny', difficulty: '' },
  { word: 'fancy', difficulty: '考研' },
  { word: 'yogurt', difficulty: '考研' },
  { word: 'berry', difficulty: '考研' },
  { word: 'butter', difficulty: '考研' },
  { word: 'luxurious', difficulty: '雅思' },
  { word: 'premium', difficulty: '雅思' },
  { word: 'protein', difficulty: '考研' },
  { word: 'single', difficulty: '六级' },
  { word: 'minimal', difficulty: '六级' },
  { word: 'fight', difficulty: '考研' },
])

// ==================== 单词详情映射 ====================
const wordDetailMap = {
  'somehow': {
    word: 'somehow', phoneticUs: 'ˈsʌmhaʊ', phoneticUk: 'sʌmhaʊ',
    difficulty: '考八',
    meaning: '不怎么怎么样；莫名<em>某妙地</em>',
    exampleEn: 'In a way that is not known or certain',
    exampleCn: '',
    example2En: 'somehow, somehow feels, somehow look',
    example2Cn: '',
  },
  'profit': {
    word: 'profit', phoneticUs: 'ˈprɒfɪt', phoneticUk: 'prɒfɪt',
    difficulty: '考四',
    meaning: '<em>利润</em>；收益',
    exampleEn: 'Profit margins on these puppies are nice and high.',
    exampleCn: '这些商品的利润率相当可观。',
    example2En: 'The company made a huge profit last year.',
    example2Cn: '公司去年获得了巨额利润。',
  },
}

// ==================== 计算属性 ====================
const currentSubtitle = computed(() => subtitles.value[currentSentenceIndex.value])
const renderedEnglish = computed(() => {
  if (!currentSubtitle.value) return ''
  return kwHighlight(currentSubtitle.value.english)
})
const shouldShowCnTranslation = computed(() =>
  displayMode.value === 'bilingual' || displayMode.value === 'blank' || displayMode.value === 'read'
)

// ==================== 方法 ====================
const formatTime = (sec) => {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
const togglePlay = () => {
  if (!videoPlayer.value) return
  isPlaying.value ? videoPlayer.value.pause() : videoPlayer.value.play()
}
const onTimeUpdate = (e) => { currentTime.value = e.target.currentTime }
const onSeek = (v) => { if (videoPlayer.value) videoPlayer.value.currentTime = v }
const togglePlaybackRate = () => {
  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
  const i = rates.indexOf(playbackRate.value)
  playbackRate.value = rates[(i + 1) % rates.length]
  if (videoPlayer.value) videoPlayer.value.playbackRate = playbackRate.value
}
const previousSentence = () => { if (currentSentenceIndex.value > 0) currentSentenceIndex.value-- }
const nextSentence = () => { if (currentSentenceIndex.value < subtitles.value.length - 1) currentSentenceIndex.value++ }
const jumpTo = (idx) => { currentSentenceIndex.value = idx }
const togglePracticeMode = () => { displayMode.value = displayMode.value === 'dictation' ? 'read' : 'dictation' }
const toggleShowOriginal = () => { showOriginal.value = !showOriginal.value }  // 切换原文显示/隐藏
const toggleSubtitlePreview = (idx: number) => {  // 切换某行的字幕预览显隐
  const s = subtitlePreviewSet.value
  if (s.has(idx)) s.delete(idx)
  else s.add(idx)
}
const toggleReadExpand = (idx: number) => {  // 切换阅读模式某行中文展开/收起
  const s = readExpandSet.value
  if (s.has(idx)) s.delete(idx)
  else s.add(idx)
}
const toggleTranslateExpand = (idx: number) => {  // 切换中译英模式某行英文展开/收起
  const s = translateExpandSet.value
  if (s.has(idx)) s.delete(idx)
  else s.add(idx)
}
const showOriginalText = () => { dictationText.value = stripHtml(currentSubtitle.value?.english || '') }
const toggleFavorite = () => { isFavorite.value = !isFavorite.value }
const toggleVideoVisible = () => { videoVisible.value = !videoVisible.value }

// 切换模式时自动恢复字幕可见
watch(displayMode, () => { videoVisible.value = true })

const togglePhonetic = () => { showPhonetic.value = !showPhonetic.value }
const toggleFullscreen = () => {
  if (!videoPlayer.value) return
  document.fullscreenElement ? document.exitFullscreen() : videoPlayer.value.parentElement.requestFullscreen()
}
const setPointA = () => console.log('A点:', currentTime.value)
const toggleLoop = () => console.log('单句循环')
const copySub = (sub) => navigator.clipboard?.writeText(stripHtml(sub.english))
const toggleFav = (idx) => { subtitles.value[idx].fav = !subtitles.value[idx].fav }
const playAt = (idx) => { jumpTo(idx); if (!isPlaying.value) togglePlay() }
const recordAt = (idx) => console.log('录音句子:', idx)
const closeWordDetail = () => { selectedWordDetail.value = null }
const openWordFromCard = (w) => {
  selectedWordDetail.value = { ...w, ...(wordDetailMap[w.word] || {}) }
}
const diffTheme = (d) => ({ '考八': 'danger', '考四': 'warning', '考研': 'primary', '雅思': 'success', '六级': 'default' }[d] || 'default')
const stripHtml = (h) => h.replace(/<[^>]+>/g, '')

// 关键词高亮处理（直接透传HTML）
const kwHighlight = (html) => html

// 挖空生成：<span class="kw ..."> 中的关键词隐藏为纯色块，点击后恢复显示
const genBlank = (sub, idx) => {
  const map = blankRevealed.value
  // 兼容单/双引号：匹配带 data-w 的 kw span
  return sub.english.replace(/<span([^>]*)class=["']((?:[^"']*\s)?kw[^"']*)["'][^>]*data-w=["']([^"']*)["'][^>]*>([^<]+)<\/span>/g,
    (_, preAttrs, cls, w, txt) => {
      const key = `${idx}-${w}`
      if (map[key]) {
        return `<span${preAttrs}class="${cls} blank-revealed" data-w="${w}">${txt}</span>`
      }
      return `<span class="blank-hidden ${cls}" data-blank-key="${key}">&nbsp;</span>`
    })
}

// 左侧挖空模式渲染（与右侧同步）
const renderLeftBlank = () => {
  if (!currentSubtitle.value) return ''
  return genBlank(currentSubtitle.value, currentSentenceIndex.value)
}

const toggleBlankReveal = (key: string) => {  // 切换单个挖空的显示/隐藏（响应式）
  const next = { ...blankRevealed.value }
  next[key] = !next[key]
  blankRevealed.value = next
}

// 挖空区域点击事件（委托）
const onBlankClick = (e: Event) => {
  const el = (e.target as Element)?.closest('.blank-hidden, .blank-revealed')
  if (!el) return
  const key = (el as HTMLElement).dataset.blankKey
  if (!key) return
  toggleBlankReveal(key)
}

// 点击关键词事件
const handleKwClick = (e) => {
  const el = e.target.closest('.kw')
  if (!el) return
  const w = el.dataset.w
  if (!w) return
  selectedWordDetail.value = wordDetailMap[w] || {
    word: w, phoneticUs: '', phoneticUk: '', difficulty: '',
    meaning: '', exampleEn: '', exampleCn: '', example2En: '', example2Cn: ''
  }
}

// 主题颜色变更处理
const onOptThemeChange = (v) => {
  // 此方法保留供模板调用，实际逻辑在 watch 中处理
}

// 监听
watch(displayMode, (v) => { if (v === 'wordcard') selectedWordDetail.value = null })
watch(optThemeColor, (v) => {
  if (v === 'dark') isDark.value = true
  else if (v === 'light') isDark.value = false
})

onMounted(() => document.addEventListener('click', handleKwClick))
onUnmounted(() => document.removeEventListener('click', handleKwClick))

// 导出所有状态和方法供组件使用
export function useLearn() {
  return {
    // 响应式状态
    isDark,
    videoPlayer,
    scrollContainerRef,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    currentSentenceIndex,
    practiceMode,
    displayMode,
    dictationText,
    translateText,
    showOriginal,  // 是否显示原文
  subtitlePreviewSet,  // 隐藏按钮：已展开预览的行索引集合
  readExpandSet,  // 阅读模式：已展开中文的行索引集合
  blankRevealed,  // 挖空模式：已显示的空白记录（响应式对象）
    isFavorite,
    videoVisible,
    showPhonetic,
    episode,
    videoTitle,
    showSettings,
    showSentenceManage,
    activeStTab,
    fontSize,
    optVideoCentered,
    optHidePauseIcon,
    optShowPhonetic,
    optShowNotes,
    optSubPosition,
    optDynamicSub,
    optThemeColor,
    optFollowHighlight,
    wordcardSortBy,
    totalStudyTime,
    activeWcIndex,
    selectedWordDetail,
    socialShareList,
    settingTabs,
    modeTabs,
    subtitles,
    wordcardData,
    // 计算属性
    currentSubtitle,
    renderedEnglish,
    shouldShowCnTranslation,
    // 方法
    toggleTheme,
    formatTime,
    togglePlay,
    onTimeUpdate,
    onSeek,
    togglePlaybackRate,
    previousSentence,
    nextSentence,
    jumpTo,
    togglePracticeMode,
    showOriginalText,
    toggleShowOriginal,  // 切换原文显示/隐藏
  toggleSubtitlePreview,  // 切换字幕预览显隐（传入行索引）
  toggleReadExpand,  // 切换阅读模式中文展开/收起
  translateExpandSet,  // 中译英模式：已展开英文的行索引集合
  toggleTranslateExpand,  // 切换中译英模式英文展开/收起
  blankRevealed,
    toggleBlankReveal,  // 切换挖空显示/隐藏（响应式）
    renderLeftBlank,  // 左侧挖空渲染
    genBlank,  // 挖空HTML生成
    onBlankClick,  // 挖空区域点击事件委托
    toggleFavorite,
    toggleVideoVisible,
    togglePhonetic,
    toggleFullscreen,
    setPointA,
    toggleLoop,
    copySub,
    toggleFav,
    playAt,
    recordAt,
    closeWordDetail,
    openWordFromCard,
    diffTheme,
    stripHtml,
    kwHighlight,
    genBlank,
    handleKwClick,
    onOptThemeChange,
  }
}
