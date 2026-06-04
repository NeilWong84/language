<template>
  <div class="landing theme-dark">
    <!-- ========== 导航栏 ========== -->
    <header class="nav" :class="{ scrolled: navScrolled }">
      <div class="nav-inner">
        <div class="nav-brand" @click="$router.push('/')">
          <span class="brand-icon">🎬</span>
          <span class="brand-text">VideoLearn</span>
        </div>
        <nav class="nav-links" :class="{ open: menuOpen }">
          <a href="#features" @click.prevent="scrollTo('features')">功能介绍</a>
          <a href="#methods" @click.prevent="scrollTo('methods')">学习方法</a>
          <a href="#courses" @click.prevent="scrollTo('courses')">精品课件</a>
          <button class="nav-btn" @click="showLogin = true">登录</button>
          <button class="nav-btn nav-btn-primary" @click="showReg = true">免费注册</button>
        </nav>
        <div class="nav-toggle" @click="menuOpen = !menuOpen">
          <t-icon name="view-list" />
        </div>
      </div>
    </header>

    <!-- ========== Hero 区域 ========== -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-particles"></div>
      </div>
      <div class="hero-inner">
        <!-- 左侧：文案 -->
        <div class="hero-left">
          <div class="hero-badge">🚀 沉浸式视频语言学习平台</div>
          <h1 class="hero-title">
            用<span class="hl">真实视频</span>，<br class="m-show" />学会一门语言
          </h1>
          <p class="hero-desc">
            基于影子跟读、回音法、100LS 等科学方法，结合 AI 课件与智能字幕，
            让外语学习像看剧一样自然高效。
          </p>
          <div class="hero-actions">
            <t-button theme="primary" size="large" class="btn-cta" @click="$router.push('/learn')">
              立即体验
              <template #icon><t-icon name="chevron-right" /></template>
            </t-button>
            <t-button theme="default" size="large" variant="outline" class="btn-demo" @click="scrollTo('features')">
              了解更多
            </t-button>
          </div>
          <div class="hero-stats">
            <div class="hs-item"><strong>8+</strong><span>核心功能</span></div>
            <div class="hs-divider"></div>
            <div class="hs-item"><strong>5</strong><span>科学方法</span></div>
            <div class="hs-divider"></div>
            <div class="hs-item"><strong>AI</strong><span>课件驱动</span></div>
          </div>
        </div>

        <!-- 右侧：产品演示动画 -->
        <div class="hero-right">
          <div class="demo-player" :class="{ playing: isPlaying }">
            <!-- 播放器顶部 -->
            <div class="dp-header">
              <div class="dp-dots"><i /><i /><i /></div>
              <div class="dp-title">Unit 3 — My Weekend Plans</div>
            </div>

            <!-- 视频/场景区域 -->
            <div class="dp-screen">
              <!-- 场景背景图 -->
              <div class="scene-bg" :class="{ active: sceneActive }">
                <div class="scene-img">
                  <div class="scene-avatar">🧑‍🏫</div>
                  <div class="scene-bubble">
                    <span v-for="(w, wi) in activeSentence.en.split(' ')" :key="wi"
                          class="bubble-word" :class="{ highlight: highlightedWord === wi }"
                          :style="{ animationDelay: wi * 0.15 + 's' }">{{ w }}</span>
                  </div>
                </div>
              </div>

              <!-- 字幕区域 -->
              <div class="subtitle-area">
                <div class="sub-line sub-en" :key="subKey">
                  <span v-for="(w, wi) in activeSentence.en.split(' ')" :key="'en'+wi"
                        class="sub-word" :class="{ hl: highlightedWord === wi }">{{ w }}</span>
                </div>
                <div class="sub-line sub-zh" :key="subKey+'zh'">{{ activeSentence.zh }}</div>
              </div>

              <!-- 词卡弹出 -->
              <transition name="card-pop">
                <div v-if="showCard" class="word-card" :style="{ top: cardPos.top, left: cardPos.left }">
                  <div class="wc-head">
                    <strong>{{ wordCard.word }}</strong>
                    <button class="wc-star" :class="{ active: wordCard.starred }" @click="wordCard.starred = !wordCard.starred">⭐</button>
                  </div>
                  <div class="wc-phonetic">/{{ wordCard.phonetic }}/</div>
                  <div class="wc-mean">{{ wordCard.meaning }}</div>
                  <div class="wc-ex">{{ wordCard.example }}</div>
                </div>
              </transition>

              <!-- 功能标签浮动 -->
              <div class="float-tags">
                <span v-if="showTag === 'loop'" class="ftag ftag-loop"><t-icon name="refresh" /> 单句循环</span>
                <span v-if="showTag === 'shadow'" class="ftag ftag-shadow"><t-icon name="sound" /> 影子跟读</span>
                <span v-if="showTag === 'dictate'" class="ftag ftag-dictate"><t-icon name="edit-1" /> 听写模式</span>
                <span v-if="showTag === 'collect'" class="ftag ftag-collect"><t-icon name="star" /> 已收藏</span>
              </div>

              <!-- 播放按钮覆盖层 -->
              <div class="play-overlay" v-if="!isPlaying" @click="togglePlay">
                <div class="play-btn-big">
                  <t-icon name="caret-right-filled" />
                </div>
                <p class="play-tip">点击预览产品功能</p>
              </div>
            </div>

            <!-- 控制条 -->
            <div class="dp-controls">
              <div class="dpc-left">
                <button class="dpc-btn" @click="togglePlay">
                  <t-icon :name="isPlaying ? 'pause-circle' : 'caret-right-filled'" />
                </button>
                <span class="dpc-time">{{ currentTime }} / {{ duration }}</span>
              </div>
              <div class="dpc-bar">
                <div class="dpc-progress" :style="{ width: progress + '%' }"></div>
              </div>
              <div class="dpc-right">
                <button class="dpc-btn"><t-icon name="sound" /></button>
                <button class="dpc-btn"><t-icon name="setting" /></button>
                <button class="dpc-btn"><t-icon name="fullscreen" /></button>
              </div>
            </div>
          </div>

          <!-- 底部装饰 -->
          <div class="demo-glow"></div>
        </div>
      </div>
    </section>

    <!-- ========== 功能介绍 ========== -->
    <section id="features" class="section feat-section">
      <div class="sec-inner">
        <div class="sec-header">
          <span class="sec-tag">FEATURES</span>
          <h2 class="sec-title">强大的学习工具箱</h2>
          <p class="sec-sub">围绕视频学习场景精心打磨的每一项功能</p>
        </div>
        <div class="feat-grid">
          <div v-for="(f, i) in features" :key="f.title" class="feat-card" :style="{ '--delay': i * 0.08 + 's' }">
            <div class="feat-icon" :style="{ background: f.gradient }">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== 学习方法 ========== -->
    <section id="methods" class="section method-section">
      <div class="sec-inner">
        <div class="sec-header">
          <span class="sec-tag">METHODS</span>
          <h2 class="sec-title">经过验证的学习方法</h2>
          <p class="sec-sub">融合全球语言学习者公认的高效方法论</p>
        </div>

        <div class="method-split">
          <!-- 左侧：选择列表 -->
          <div class="method-tabs">
            <button
              v-for="(m, i) in methods"
              :key="m.name"
              class="mtab-item"
              :class="{ active: selectedMethod === i }"
              @click="selectedMethod = i"
            >
              <span class="mtab-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="mtab-name">{{ m.shortName }}</span>
              <t-icon name="chevron-right" class="mtab-arrow" />
            </button>
          </div>

          <!-- 右侧：详情展示 -->
          <transition name="detail-fade" mode="out-in">
            <div :key="selectedMethod" class="method-detail">
              <div class="md-header">
                <h3>{{ currentMethod.name }}</h3>
                <p class="md-desc">{{ currentMethod.desc }}</p>
                <div class="md-tags">
                  <span v-for="tag in currentMethod.tags" :key="tag" class="mtag">#{{ tag }}</span>
                </div>
              </div>

              <div class="md-body">
                <div class="md-block">
                  <h4><t-icon name="check-circle" /> 核心步骤</h4>
                  <ol>
                    <li v-for="(step, si) in currentMethod.steps" :key="si">{{ step }}</li>
                  </ol>
                </div>
                <div class="md-block">
                  <h4><t-icon name="lightbulb" /> 为什么有效</h4>
                  <ul>
                    <li v-for="(ben, bi) in currentMethod.benefits" :key="bi">{{ ben }}</li>
                  </ul>
                </div>
                <div v-if="currentMethod.tips" class="md-block md-tip">
                  <h4><t-icon name="chat" /> 实用建议</h4>
                  <p>{{ currentMethod.tips }}</p>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </section>

    <!-- ========== 精品课件 ========== -->
    <section id="courses" class="section course-section">
      <div class="sec-inner">
        <div class="sec-header">
          <span class="sec-tag">COURSES</span>
          <h2 class="sec-title">AI 驱动的精品课件</h2>
          <p class="sec-sub">基于权威教材制作的动画课程，让学习更有趣</p>
        </div>
        <div class="course-grid">
          <div v-for="c in courses" :key="c.name" class="course-card">
            <div class="course-cover" :style="{ background: c.bg }">
              <div class="course-emoji">{{ c.icon }}</div>
              <div class="course-type">{{ c.type }}</div>
            </div>
            <div class="course-info">
              <h3>{{ c.name }}</h3>
              <p>{{ c.desc }}</p>
              <div class="course-meta">
                <span><t-icon name="file" /> {{ c.units }} 课时</span>
                <span><t-icon name="time" /> {{ c.level }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========== CTA 区域 ========== -->
    <section class="cta-section">
      <div class="cta-inner">
        <h2>准备好开启你的学习之旅了吗？</h2>
        <p>免费注册，立即开始用视频学外语</p>
        <div class="cta-actions">
          <button class="cta-btn" @click="showReg = true">免费注册</button>
          <button class="cta-btn" @click="$router.push('/learn')">先逛一逛</button>
        </div>
      </div>
    </section>

    <!-- ========== 页脚 ========== -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="fb-brand">
          <span class="brand-icon">🎬</span>
          <span class="brand-text">VideoLearn</span>
          <p>视频驱动型沉浸式语言学习平台</p>
        </div>
        <div class="fb-links">
          <div class="fb-col">
            <h4>产品</h4>
            <a href="#features">功能介绍</a>
            <a href="#methods">学习方法</a>
            <a href="#courses">精品课件</a>
          </div>
          <div class="fb-col">
            <h4>支持</h4>
            <a href="#">使用指南</a>
            <a href="#">常见问题</a>
            <a href="#">联系我们</a>
          </div>
          <div class="fb-col">
            <h4>关于</h4>
            <a href="#">关于我们</a>
            <a href="#">隐私政策</a>
            <a href="#">服务条款</a>
          </div>
        </div>
      </div>
      <div class="fb-bottom">
        <p>&copy; 2026 VideoLearn. All rights reserved.</p>
      </div>
    </footer>

    <!-- 登录弹窗 -->
    <t-dialog
      v-model:visible="showLogin"
      header="欢迎回来"
      :footer="false"
      :close-btn="true"
      width="420px"
    >
      <div class="auth-body">
        <t-input placeholder="邮箱 / 手机号" size="large" clearable />
        <t-input type="password" placeholder="密码" size="large" clearable style="margin-top:16px"/>
        <t-button theme="primary" block size="large" style="margin-top:24px">登 录</t-button>
        <div class="auth-switch">还没有账号？<a href="#" @click.prevent="showLogin=false;showReg=true">立即注册</a></div>
      </div>
    </t-dialog>

    <!-- 注册弹窗 -->
    <t-dialog
      v-model:visible="showReg"
      header="创建账号"
      :footer="false"
      :close-btn="true"
      width="420px"
    >
      <div class="auth-body">
        <t-input placeholder="昵称" size="large" clearable />
        <t-input placeholder="邮箱 / 手机号" size="large" clearable style="margin-top:12px"/>
        <t-input type="password" placeholder="设置密码" size="large" clearable style="margin-top:12px"/>
        <t-input type="password" placeholder="确认密码" size="large" clearable style="margin-top:12px"/>
        <t-button theme="primary" block size="large" style="margin-top:20px">注 册</t-button>
        <div class="auth-switch">已有账号？<a href="#" @click.prevent="showReg=false;showLogin=true">立即登录</a></div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

const navScrolled = ref(false)
const menuOpen = ref(false)
const showLogin = ref(false)
const showReg = ref(false)

// ========== 演示播放器动画状态 ==========
const isPlaying = ref(false)
const sceneActive = ref(true)
const progress = ref(0)
const currentTime = ref('0:00')
const duration = ref('3:24')
const highlightedWord = ref(-1)
const subKey = ref(0)
const showCard = ref(false)
const wordCard = reactive({ word: 'adventure', phonetic: 'ədˈventʃə', meaning: 'n. 冒险；奇遇', example: 'It was a great adventure.', starred: false })
const cardPos = reactive({ top: '45%', left: '55%' })
const showTag = ref('')

// 演示句子
const sentences = [
  { en: "What are you going to do this weekend?", zh: "这个周末你打算做什么？" },
  { en: "I'm going to visit my grandparents.", zh: "我打算去看望我的祖父母。" },
  { en: "That sounds like a wonderful plan!", zh: "听起来是个很棒的计划！" },
  { en: "Would you like to join us for dinner?", zh: "你想和我们一起吃晚饭吗？" },
]
const activeSentence = ref(sentences[0])

let animTimer = null
let sentenceIdx = 0

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    startDemoAnimation()
  } else {
    stopDemoAnimation()
  }
}

const startDemoAnimation = () => {
  let step = 0
  const totalSteps = 200 // ~10s 一个完整循环
  const words = activeSentence.value.en.split(' ')

  animTimer = setInterval(() => {
    step++

    // 进度条
    progress.value = ((step % totalSteps) / totalSteps) * 100

    // 时间显示模拟
    const sec = Math.floor((step % totalSteps) / totalSteps * 204)
    const m = Math.floor(sec / 60)
    const s = sec % 60
    currentTime.value = `${m}:${String(s).padStart(2, '0')}`

    // 句子循环（每约5秒切换）
    if (step > 0 && step % (totalSteps / sentences.length) === 0) {
      sentenceIdx = (sentenceIdx + 1) % sentences.length
      activeSentence.value = sentences[sentenceIdx]
      subKey.value++
    }

    // 高亮单词动画
    const wordStep = Math.floor(step / 12) % (words.length + 2)
    if (wordStep < words.length) {
      highlightedWord.value = wordStep
      // 点击词卡效果
      if (wordStep === Math.floor(words.length / 2)) {
        showCard.value = true
        wordCard.word = words[wordStep]
        cardPos.left = (35 + wordStep * 8) + '%'
      }
    } else {
      highlightedWord.value = -1
      if (wordStep >= words.length + 1) showCard.value = false
    }

    // 浮动标签轮播
    const tagIdx = Math.floor(step / 40) % 4
    const tags = ['loop', 'shadow', 'dictate', 'collect']
    showTag.value = tags[tagIdx]

    // 循环重置
    if (step >= totalSteps) step = 0
  }, 50)
}

const stopDemoAnimation = () => {
  if (animTimer) { clearInterval(animTimer); animTimer = null }
  showCard.value = false
  showTag.value = ''
  highlightedWord.value = -1
}

const handleScroll = () => {
  navScrolled.value = window.scrollY > 40
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 自动开始演示动画
  setTimeout(() => { isPlaying.value = true; startDemoAnimation() }, 1200)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  stopDemoAnimation()
})

const scrollTo = (id) => {
  menuOpen.value = false
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

// 功能列表
const features = [
  { icon: '🔁', title: '单句循环', desc: '反复播放当前句子直到听懂，精准攻克每一个难点', gradient: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' },
  { icon: '✍️', title: '听写练习', desc: '边听边写，强化听力与拼写的深度联结', gradient: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
  { icon: '🗣️', title: '影子跟读', desc: '滞后半句模仿语音语调，训练肌肉记忆', gradient: 'linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)' },
  { icon: '📝', title: '多种字幕', desc: '中英双语、纯英文、无字幕自由切换', gradient: 'linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)' },
  { icon: '⭐', title: '笔记收藏', desc: '一键收藏生词难句，生成专属复习清单', gradient: 'linear-gradient(135deg,#fa709a 0%,#fee140 100%)' },
  { icon: '📖', title: '中英释义', desc: '点击即查单词含义与例句，无缝衔接词典', gradient: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' },
  { icon: '🃏', title: '词卡学习', desc: '基于遗忘曲线的间隔重复卡片系统', gradient: 'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)' },
  { icon: '⚡', title: '无级变速', desc: '0.5x~2.0x 连续调速，支持各种语速听写训练', gradient: 'linear-gradient(135deg,#a1c4fd 0%,#c2e9fb 100%)' },
  { icon: '📚', title: '同步课程', desc: '覆盖小学、初中、高中及新概念等权威教材体系', gradient: 'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)' },
  { icon: '🎯', title: '高频词组', desc: '中高考高频单词与短语，针对性突破考试重点', gradient: 'linear-gradient(135deg,#fddb92 0%,#d1fdff 100%)' },
  { icon: '💼', title: '成人学习', desc: '旅游、商务、职场、兴趣等多场景定制化学习内容', gradient: 'linear-gradient(135deg,#a8edea 0%,#fed6e3 100%)' },
  { icon: '🌏', title: '小语种', desc: '支持英文，后续将开放日文、德文、西班牙语等更多语种', gradient: 'linear-gradient(135deg,#d299c2 0%,#fef9d7 100%)' },
]

// 学习方法
const selectedMethod = ref(0)
const methods = [
  {
    shortName: '影子跟读法',
    name: '影子跟读法（Shadowing）',
    desc: '听到声音后滞后 0.5 秒跟读，同步模仿发音、语调和节奏。这是公认最高效的口语训练法。',
    tags: ['口语提升', '语调模仿'],
    steps: [
      '播放一段音频（建议 10~20 秒的短句或对话片段）',
      '音频开始后，滞后约 0.5 秒开始同步跟读，像"影子"一样紧随其后',
      '尽量模仿原声的语速、重音、停顿和情绪起伏',
      '反复练习同一片段 3~5 遍，直到能自然流畅地复述'
    ],
    benefits: [
      '训练口腔肌肉记忆，让发音更加地道自然',
      '提升语感节奏感，告别"中式英语"腔调',
      '同时锻炼听力专注力和即时反应能力'
    ],
    tips: '初学者建议从语速较慢的材料（如慢速新闻、教材音频）开始，熟练后再挑战正常语速的原生内容。'
  },
  {
    shortName: '回音法',
    name: '回音法（Echo Method）',
    desc: '听完一整句后暂停，凭记忆完整复述。训练短期记忆与输出能力。',
    tags: ['记忆力', '复述训练'],
    steps: [
      '播放一句完整的话，认真听并理解含义',
      '立即暂停播放器',
      '凭记忆将这句话完整地复述出来（尽量用原话，不是翻译）',
      '对比原声差异，修正发音和遗漏，再听一遍重试'
    ],
    benefits: [
      '强化短期语音记忆能力，为自由表达打基础',
      '发现听力盲区——哪些单词/结构你"听到了但没记住"',
      '从被动接收转向主动输出，加速语言内化过程'
    ],
    tips: '句子长度从 6~8 个词起步，逐步增加到 15 词以上的长难句。每次练习控制在 15 分钟以内，避免疲劳。'
  },
  {
    shortName: '单句听读法',
    name: '单句听读法',
    desc: '逐句精听、理解、朗读、模仿，不放过任何一个细节。',
    tags: ['精听', '细节掌握'],
    steps: [
      '选择一段材料，开启"单句循环"模式',
      '每句话：先完整听 2~3 遍，抓取大意和关键词',
      '对照字幕确认每个单词的含义和用法',
      '大声朗读 3 遍，模仿原声的语调和停顿'
    ],
    benefits: [
      '彻底消灭"模糊听力"——每个音节都清清楚楚',
      '积累地道的表达方式和固定搭配',
      '建立扎实的词汇-声音联结，看到单词就能正确朗读'
    ],
    tips: '配合平台的"单句循环"功能效果最佳，可以反复打磨每一句话直到完美掌握。'
  },
  {
    shortName: '100LS 法则',
    name: '100LS 法则',
    desc: '同一部影视作品观看 100 遍，从泛听到精听到模仿，彻底内化语言直觉。',
    tags: ['长期坚持', '语感培养'],
    steps: [
      '第 1~10 遍：只看画面+中文字幕，了解剧情和人物关系',
      '第 11~30 遍：切换英文字幕，注意表达方式和词汇用法',
      '第 31~60 遍：关闭所有字幕，裸听测试理解程度',
      '第 61~100 遍：尝试跟读角色台词，模仿语气情感'
    ],
    benefits: [
      '通过大量重复输入，让语言直觉成为本能反应',
      '在真实语境中学习，比死记硬背更有趣且更持久',
      '一部作品吃透 > 十部作品泛看'
    ],
    tips: '选择自己真正感兴趣的电影或剧集（美剧推荐《Friends》《Modern Family》），兴趣是最好的老师！'
  },
  {
    shortName: '中英字幕法',
    name: '中英文字幕法',
    desc: '先用中文字幕理解剧情，切换英文字幕学习表达，最终脱离字幕裸听。',
    tags: ['渐进式', '自然习得'],
    steps: [
      '第一遍：开中文字幕，专注于理解故事情节和人物互动',
      '第二遍：切换英文字幕，关注英语是如何表达同样意思的',
      '第三遍：尝试关掉字幕，测试自己能听懂多少',
      '循环以上步骤，逐步减少对字幕的依赖'
    ],
    benefits: [
      '降低学习门槛，不会因为听不懂而放弃',
      "建立'中文概念 → 英文表达'的直接映射",
      '循序渐进培养真实场景下的听力能力'
    ],
    tips: '平台支持一键切换中/英/无字幕模式，非常适合这个方法。建议先用动画类内容（语速适中、发音清晰），再过渡到真人影视剧。'
  },
]

// 当前选中方法的计算属性
const currentMethod = computed(() => methods[selectedMethod.value])

// 课件
const courses = [
  { icon: '📘', name: '人教版英语（七年级上）', desc: '九年义务教育配套动画课件，覆盖全部单元对话与语法', type: '小学/初中', units: 48, level: '入门', bg: 'linear-gradient(135deg,#e0e7ff 0%,#c7d2fe 50%,#a5b4fc 100%)' },
  { icon: '📗', name: '新概念英语 第一册', desc: '经典教材动画版，从基础句型到日常对话循序渐进', type: '经典教材', units: 144, level: '入门~初级', bg: 'linear-gradient(135deg,#d1fae5 0%,#a7f3d0 50%,#6ee7b7 100%)' },
  { icon: '📙', name: '新概念英语 第二册', desc: '构建语法体系与写作能力，培养英语思维', type: '经典教材', units: 96, level: '中级', bg: 'linear-gradient(135deg,#fef3c7 0%,#fde68a 50%,#fcd34d 100%)' },
  { icon: '📕', name: '高中英语必修（高一上）', desc: '高考考点全覆盖，主题式情景教学动画', type: '高中', units: 32, level: '中级', bg: 'linear-gradient(135deg,#fce7f3 0%,#fbcfe8 50%,#f9a8d4 100%)' },
]
</script>

<style lang="scss" src="./index.scss"></style>
