<template>
  <div class="learn-container" :class="{ 'theme-light': !isDark, 'theme-dark': isDark }">
    <!-- ==================== 顶部栏 ==================== -->
    <div class="header">
      <div class="header-left">
        <t-button variant="text" shape="square" class="header-icon-btn" @click="$router.back()">
          <template #icon><t-icon name="chevron-left" /></template>
        </t-button>
        <h1 class="title">TEco Lab 第 {{ episode }} 期</h1>
      </div>

      <div class="mode-switcher">
        <!-- 显示模式：双语 / 英语 / 中文 / 听写 / 挖空 -->
        <t-tabs v-model="displayMode" theme="card" size="medium" @change="(val) => { displayMode = val }">
          <t-tab-panel value="bilingual" label="双语" />
          <t-tab-panel value="english" label="英语" />
          <t-tab-panel value="chinese" label="中文" />
          <t-tab-panel value="dictation" label="听写" />
          <t-tab-panel value="blank" label="挖空" />
        </t-tabs>

        <!-- 练习模式：阅读 / 中译英 / 词卡（非词卡模式时显示）-->
        <template v-if="displayMode !== 'wordcard'">
          <t-divider layout="vertical" />
          <t-tabs v-model="practiceMode" theme="card" size="medium" @change="(val) => { practiceMode = val }">
            <t-tab-panel value="read" label="阅读" />
            <t-tab-panel value="translate" label="中译英" />
            <t-tab-panel value="wordcard" label="词卡" />
          </t-tabs>
        </template>

        <t-divider v-if="displayMode !== 'wordcard'" layout="vertical" :style="{ borderColor: isDark ? '#333' : '#e0e0e0' }" />

        <!-- 功能按钮组：隐藏视频 / 设置 / 词卡按钮(词卡模式时显示) / 主题切换 -->
        <t-button variant="text" shape="square" size="small" class="header-icon-btn" @click="toggleVideoVisible">
          <template #icon><t-icon name="browse-off" /></template>
        </t-button>
        <t-button variant="text" shape="square" size="small" class="header-icon-btn" @click="showSettings = true">
          <template #icon><t-icon name="setting" /></template>
        </t-button>

        <!-- 词卡模式下显示"词卡"按钮，否则显示主题切换 -->
        <template v-if="displayMode === 'wordcard'">
          <t-button variant="outline" size="small" class="wordcard-header-btn">词卡</t-button>
        </template>
        <template v-else>
          <t-divider layout="vertical" :style="{ borderColor: isDark ? '#333' : '#e0e0e0' }" />
          <t-button variant="text" shape="square" size="small" class="header-icon-btn theme-toggle" @click="toggleTheme">
            <template #icon><t-icon :name="isDark ? 'lightbulb' : 'moon'" /></template>
          </t-button>
        </template>
      </div>
    </div>

    <!-- ==================== 主内容区 ==================== -->
    <div class="main-content">

      <!-- ====== 左侧视频区域 ====== -->
      <div class="video-section" :class="{ 'hide-video': !videoVisible }">
        <!-- 视频播放器 -->
        <div class="video-player-wrapper">
          <video
            ref="videoPlayer"
            class="video-player"
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            @timeupdate="onTimeUpdate"
            @play="isPlaying = true"
            @pause="isPlaying = false"
          ></video>

          <!-- 未播放时的播放遮罩 -->
          <div v-if="!isPlaying" class="play-overlay" @click="togglePlay">
            <t-icon name="play-circle-filled" size="80px" class="play-overlay-icon" />
          </div>

          <!-- 视频信息覆盖层（左上角标题+期数）-->
          <div class="video-info-overlay">
            <span class="video-title">{{ videoTitle }}</span>
            <span class="episode-label">EP.{{ episode }}</span>
          </div>
        </div>

        <!-- 进度条 + 时间 -->
        <div class="video-progress">
          <t-slider v-model="currentTime" :max="duration" :step="0.1" theme="primary" @change="onSeek" />
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <!-- 控制面板：12个控制项 -->
        <div class="control-panel">
          <div class="ctrl-item" @click="togglePlaybackRate">
            <span class="ctrl-label">{{ playbackRate }}x</span>
            <span class="ctrl-name">倍速</span>
          </div>
          <div class="ctrl-item" @click="toggleVideoVisible">
            <t-icon name="browse-off" class="ctrl-ico" />
            <span class="ctrl-name">隐藏视频</span>
          </div>
          <div class="ctrl-item" @click="toggleFullscreen">
            <t-icon name="fullscreen-1" class="ctrl-ico" />
            <span class="ctrl-name">全屏</span>
          </div>
          <div class="ctrl-item" @click="togglePhonetic">
            <span class="ctrl-label phonetic-symbol" :class="{ active: showPhonetic }">ɔ</span>
            <span class="ctrl-name">音标</span>
          </div>
          <div class="ctrl-item" @click="previousSentence">
            <t-icon name="chevron-left" class="ctrl-ico ctrl-ico-nav" />
            <span class="ctrl-name">上一句</span>
          </div>
          <div class="ctrl-item ctrl-item-play" @click="togglePlay">
            <t-icon :name="isPlaying ? 'pause-circle-filled' : 'play-circle-filled'" size="24px" class="ctrl-ico-play" />
            <span class="ctrl-name">播放</span>
          </div>
          <div class="ctrl-item" @click="nextSentence">
            <t-icon name="chevron-right" class="ctrl-ico ctrl-ico-nav" />
            <span class="ctrl-name">下一句</span>
          </div>
          <div class="ctrl-item" @click="setPointA">
            <span class="ctrl-label point-a">A</span>
            <span class="ctrl-name">A点</span>
          </div>
          <div class="ctrl-item" @click="toggleLoop">
            <t-icon name="refresh" class="ctrl-ico" />
            <span class="ctrl-name">单句循环</span>
          </div>
          <div class="ctrl-item">
            <t-icon name="time" class="ctrl-ico" />
            <span class="ctrl-name">间隔</span>
          </div>
          <div class="ctrl-item">
            <t-icon name="pause-circle" class="ctrl-ico" />
            <span class="ctrl-name">单句暂停</span>
          </div>
          <div class="ctrl-item" @click="showSentenceManage = true">
            <t-icon name="view-list" class="ctrl-ico" />
            <span class="ctrl-name">单句管理</span>
          </div>
        </div>

        <!-- 底部字幕/听写/翻译显示区 -->
        <div class="subtitle-display">
          <!-- 顶部工具栏：序号 / 收藏 / 编辑 / 切换模式 / 录音 -->
          <div class="sub-toolbar">
            <span class="sentence-counter">{{ currentSentenceIndex + 1 }} / {{ subtitles.length }}</span>

            <t-button variant="text" shape="square" size="small" class="tool-btn" @click="toggleFavorite">
              <template #icon>
                <t-icon :name="isFavorite ? 'heart-filled' : 'heart'" :class="{ 'fav-active': isFavorite }" />
              </template>
            </t-button>

            <t-button variant="text" shape="square" size="small" class="tool-btn">
              <template #icon><t-icon name="edit-1" /></template>
            </t-button>

            <span class="mode-switch-link" @click="togglePracticeMode">
              切换到{{ practiceMode === 'dictation' ? '跟读' : '听写' }}
            </span>

            <span class="recording-label">
              录音：<t-icon name="mic" class="mic-dot" />
            </span>
          </div>

          <!-- 内容区域 -->
          <div class="sub-content-area">
            <!-- 听写模式：文本域 + 查看原文按钮 -->
            <div v-if="practiceMode === 'dictation'" class="dictation-box">
              <t-textarea
                v-model="dictationText"
                placeholder="开始听写吧..."
                :autosize="{ minRows: 2, maxRows: 4 }"
                class="dictation-textarea"
              />
              <t-button theme="default" variant="base" size="small" class="show-original-btn" @click="showOriginalText">
                查看原文
              </t-button>
            </div>

            <!-- 中译英模式：中文提示 + 英文输入 -->
            <div v-else-if="practiceMode === 'translate'" class="translate-box">
              <p class="cn-hint">{{ currentSubtitle?.chinese }}</p>
              <t-input v-model="translateText" placeholder="请输入英文翻译..." class="en-input" />
            </div>

            <!-- 正常字幕展示 -->
            <div v-else class="normal-subtitle">
              <p class="en-text" v-html="renderedEnglish"></p>
              <p v-if="shouldShowCnTranslation" class="cn-text">{{ currentSubtitle?.chinese }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 右侧面板区域 ====== -->
      <div class="right-panel">

        <!-- ---------- 单词详情面板（点击关键词后滑出）---------- -->
        <transition name="slide-right">
          <div v-if="selectedWordDetail" class="word-detail-panel">
            <!-- 面板头部：返回 + 单词名 + 难度标签 + 收藏按钮 + 星标 -->
            <div class="wd-header">
              <t-button variant="text" shape="square" size="small" class="wd-back-btn" @click="closeWordDetail">
                <template #icon><t-icon name="chevron-left" /></template>
              </t-button>
              <span class="wd-word">{{ selectedWordDetail.word }}</span>
              <div class="wd-actions">
                <t-tag v-if="selectedWordDetail.difficulty" :theme="diffTheme(selectedWordDetail.difficulty)" size="small" variant="light">
                  {{ selectedWordDetail.difficulty }}
                </t-tag>
                <t-button variant="outline" size="small" class="wd-star-btn">
                  <template #icon><t-icon name="star" /></template>收藏
                </t-button>
              </div>
            </div>

            <div class="wd-body">
              <!-- 音标行 -->
              <div class="wd-phonetic-row">
                <span class="phon-badge">US <em>/{{ selectedWordDetail.phoneticUs || '' }}/</em></span>
                <span class="phon-badge">UK <em>/{{ selectedWordDetail.phoneticUk || '' }}/</em></span>
              </div>

              <!-- 释义区：短语标签 + 含义 -->
              <div class="wd-meaning-row">
                <t-tag theme="warning" size="small" variant="light" class="meaning-tag">短语</t-tag>
                <span class="meaning-txt" v-html="selectedWordDetail.meaning"></span>
              </div>

              <!-- 亮话 -->
              <div class="wd-example-block">
                <div class="ex-label">亮话</div>
                <p class="ex-en">{{ selectedWordDetail.exampleEn }}</p>
                <p class="ex-cn">{{ selectedWordDetail.exampleCn }}</p>
              </div>

              <!-- 例句 -->
              <div class="wd-example-block">
                <div class="ex-label">例句</div>
                <p class="ex-en">{{ selectedWordDetail.example2En }}</p>
                <p class="ex-cn">{{ selectedWordDetail.example2Cn }}</p>
              </div>

              <!-- 复现 -->
              <div class="wd-recall-row">
                <t-icon name="share-1" class="recall-ico" />
                <span>复现</span>
              </div>

              <!-- 社交分享：彩色圆点图标 -->
              <div class="wd-social-row">
                <button v-for="(s, i) in socialShareList" :key="i" class="social-dot" :class="`sd-${s}`">
                  <t-icon :name="`logo-${s === 'link' ? 'link' : s}`" />
                </button>
              </div>
            </div>
          </div>
        </transition>

        <!-- ---------- 词卡列表视图 ---------- -->
        <div v-if="displayMode === 'wordcard' && !selectedWordDetail" class="wc-section">
          <div class="wc-toolbar">
            <t-radio-group v-model="wordcardSortBy" variant="default-filled" size="small">
              <t-radio-button value="default">默认</t-radio-button>
              <t-radio-button value="difficulty">判别</t-radio-button>
              <t-radio-button value="time">时间</t-radio-button>
              <t-radio-button value="custom">自定</t-radio-button>
            </t-radio-group>
            <span class="wc-total-time">{{ totalStudyTime }}</span>
          </div>
          <div class="wc-list">
            <div
              v-for="(w, idx) in wordcardData"
              :key="idx"
              class="wc-item"
              :class="{ active: idx === activeWcIndex }"
              @click="openWordFromCard(w)"
            >
              <div class="wc-left">
                <span class="wc-no">{{ idx + 1 }}</span>
                <span class="wc-word">{{ w.word }}</span>
              </div>
              <div class="wc-right">
                <t-tag v-if="w.difficulty" :theme="diffTheme(w.difficulty)" size="small">{{ w.difficulty }}</t-tag>
                <t-tag theme="success" size="small" variant="light">背诵</t-tag>
                <t-icon name="chevron-right" class="wc-arrow" />
              </div>
            </div>
          </div>
        </div>

        <!-- ---------- 字幕列表视图（双语/英语/中文/听写/挖空）---------- -->
        <div v-if="displayMode !== 'wordcard'" class="sl-section">
          <div class="sl-list" ref="scrollContainerRef">
            <div
              v-for="(sub, idx) in subtitles"
              :key="idx"
              class="sl-item"
              :class="{ active: idx === currentSentenceIndex }"
              @click="jumpTo(idx)"
            >
              <!-- 双语 -->
              <template v-if="displayMode === 'bilingual'">
                <div class="sl-en" v-html="kwHighlight(sub.english)"></div>
                <div class="sl-cn">{{ sub.chinese }}</div>
              </template>
              <!-- 英语 -->
              <template v-else-if="displayMode === 'english'">
                <div class="sl-en" v-html="kwHighlight(sub.english)"></div>
              </template>
              <!-- 中文 -->
              <template v-else-if="displayMode === 'chinese'">
                <div class="sl-cn-full">
                  <span class="sl-num">{{ idx + 1 }}</span>
                  <span class="sl-cn-txt">{{ sub.chinese }}</span>
                  <t-icon name="chevron-down" class="sl-expand" />
                </div>
              </template>
              <!-- 听写占位 -->
              <template v-else-if="displayMode === 'dictation'">
                <div class="sl-dict-placeholder">...</div>
              </template>
              <!-- 挖空 -->
              <template v-else-if="displayMode === 'blank'">
                <div class="sl-blank" v-html="genBlank(sub)"></div>
              </template>

              <!-- 底部工具栏：时间戳 + 操作按钮 -->
              <div class="sl-footer">
                <span class="sl-time">{{ idx + 1 }} &nbsp; {{ sub.startTime }} - {{ sub.endTime }}</span>
                <div class="sl-actions">
                  <t-tooltip content="播放">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn" @click.stop="playAt(idx)">
                      <template #icon><t-icon name="play" /></template>
                    </t-button>
                  </t-tooltip>
                  <t-tooltip content="复制">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn" @click.stop="copySub(sub)">
                      <template #icon><t-icon name="file-copy" /></template>
                    </t-button>
                  </t-tooltip>
                  <t-tooltip content="收藏">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn" @click.stop="toggleFav(idx)">
                      <template #icon><t-icon :name="sub.fav ? 'heart-filled' : 'heart'" /></template>
                    </t-button>
                  </t-tooltip>
                  <t-tooltip content="编辑">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn">
                      <template #icon><t-icon name="edit-1" /></template>
                    </t-button>
                  </t-tooltip>
                  <t-tooltip v-if="displayMode !== 'dictation'" content="录音">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn" @click.stop="recordAt(idx)">
                      <template #icon><t-icon name="mic" /></template>
                    </t-button>
                  </t-tooltip>
                  <t-tooltip content="查看">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn">
                      <template #icon><t-icon name="browse" /></template>
                    </t-button>
                  </t-tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- end right-panel -->
    </div><!-- end main-content -->

    <!-- ==================== 设置弹窗（暗色主题）==================== -->
    <t-drawer
      v-model:visible="showSettings"
      header="设置"
      :size="560"
      placement="right"
      :footer="false"
      :close-btn="true"
      :show-overlay="true"
      class="settings-drawer"
    >
      <div class="settings-body">
        <!-- 选项卡图标行 -->
        <div class="st-tabs">
          <div
            v-for="(tab, ti) in settingTabs"
            :key="ti"
            class="st-tab"
            :class="{ active: activeStTab === tab.key }"
            @click="activeStTab = tab.key"
          >
            <t-icon :name="tab.icon" class="st-tab-ico" />
            <span>{{ tab.label }}</span>
          </div>
        </div>

        <!-- 字幕大小滑块 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="format-vertical-align-top" class="st-ico" /> 字幕大小</div>
          <t-slider v-model="fontSize" :min="12" :max="28" :step="1" show-value style="width:220px;" />
        </div>

        <!-- 视频居中 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="browse-off" class="st-ico" /> 视频居中</div>
          <t-switch v-model="optVideoCentered" />
        </div>

        <!-- 隐藏充填暂停符 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="pause-circle" class="st-ico" /> 隐藏充填暂停符</div>
          <t-switch v-model="optHidePauseIcon" />
        </div>

        <!-- 显示音标 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="sound" class="st-ico" /> 显示音标</div>
          <t-switch v-model="optShowPhonetic" />
        </div>

        <!-- 显示字幕笔记 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="edit-1" class="st-ico" /> 显示字幕笔记</div>
          <t-switch v-model="optShowNotes" />
        </div>

        <!-- 视频底部字幕位置 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="chevron-down" class="st-ico" /> 视频底部字幕</div>
          <t-radio-group v-model="optSubPosition" variant="default-filled" size="small">
            <t-radio-button value="cn">中文</t-radio-button>
            <t-radio-button value="en">英文</t-radio-button>
            <t-radio-button value="both">双语</t-radio-button>
            <t-radio-button value="none">不显示</t-radio-button>
          </t-radio-group>
        </div>

        <!-- 动态字幕 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="flash" class="st-ico" /> 动态字幕</div>
          <t-radio-group v-model="optDynamicSub" variant="default-filled" size="small">
            <t-radio-button value="karaoke">校歌</t-radio-button>
            <t-radio-button value="highlight">中文</t-radio-button>
            <t-radio-button value="simple">英语</t-radio-button>
            <t-radio-button value="fade">双语</t-radio-button>
          </t-radio-group>
        </div>

        <!-- 主题颜色 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="palette" class="st-ico" /> 主题颜色</div>
          <t-radio-group v-model="optThemeColor" variant="default-filled" size="small" @change="onOptThemeChange">
            <t-radio-button value="system">系统</t-radio-button>
            <t-radio-button value="light">纯</t-radio-button>
            <t-radio-button value="dark">黑</t-radio-button>
          </t-radio-group>
        </div>

        <!-- 跟读高亮字幕 -->
        <div class="st-row">
          <div class="st-lbl"><t-icon name="mic" class="st-ico" /> 跟读高亮字幕</div>
          <t-switch v-model="optFollowHighlight" />
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup>
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
const displayMode = ref('bilingual')
const dictationText = ref('')
const translateText = ref('')
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
const totalStudyTime = ref('244.9')
const activeWcIndex = ref(3) // 默认选中第4个
const selectedWordDetail = ref(null)

// 社交分享列表
const socialShareList = ['wechat', 'qq', 'weibo', 'twitter', 'github', 'link']

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
  displayMode.value === 'bilingual' || displayMode.value === 'blank'
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
const togglePracticeMode = () => { practiceMode.value = practiceMode.value === 'dictation' ? 'read' : 'dictation' }
const showOriginalText = () => { dictationText.value = stripHtml(currentSubtitle.value?.english || '') }
const toggleFavorite = () => { isFavorite.value = !isFavorite.value }
const toggleVideoVisible = () => { videoVisible.value = !videoVisible.value }
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

// 挖空生成：将<span class="kw...">替换为绿色填充框
const genBlank = (sub) => {
  return sub.english.replace(/<span[^>]*data-w="([^"]*)"[^>]*>([^<]+)<\/span>/g, (_, w, txt) => {
    return `<input type="text" class="blank-input" placeholder="${txt}" />`
  })
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

// 监听
watch(displayMode, (v) => { if (v === 'wordcard') selectedWordDetail.value = null })
watch(optThemeColor, (v) => {
  if (v === 'dark') isDark.value = true
  else if (v === 'light') isDark.value = false
})

onMounted(() => document.addEventListener('click', handleKwClick))
onUnmounted(() => document.removeEventListener('click', handleKwClick))
</script>

<style scoped lang="scss">
/* ============================================================
   CSS 变量 —— 明暗双主题
   ============================================================ */
.learn-container {
  --bg-root: #1a1a1a;
  --bg-card: #222;
  --bg-elevated: #2a2a2a;
  --bg-input: #1e1e1e;
  --border-main: #333;
  --border-subtle: rgba(255,255,255,.07);
  --text-1: #eee;
  --text-2: rgba(255,255,255,.72);
  --text-3: rgba(255,255,255,.55);
  --text-4: rgba(255,255,255,.35);
  --ico: rgba(255,255,255,.78);
  --ico-hover: #fff;
  --hover-bg: rgba(255,255,255,.08);
  --active-bg: rgba(255,255,255,.07);

  /* 关键词色 */
  --kw-orange-bg: rgba(230,162,60,.22);
  --kw-orange-hover: rgba(230,162,60,.42);
  --kw-green-bg: rgba(0,168,112,.22);
  --kw-green-solid: #4caf50;
  --kw-yellow-bg: rgba(245,189,58,.22);
  --kw-purple-bg: rgba(156,96,240,.22);
  --kw-blue-bg: rgba(66,153,225,.22);

  &.theme-light {
    --bg-root: #fff; --bg-card: #fafafa; --bg-elevated: #f5f5f5; --bg-input: #fff;
    --border-main: #e8e8e8; --border-subtle: rgba(0,0,0,.06);
    --text-1: #1a1a1a; --text-2: rgba(0,0,0,.68); --text-3: rgba(0,0,0,.48); --text-4: rgba(0,0,0,.32);
    --ico: rgba(0,0,0,.6); --ico-hover: #222;
    --hover-bg: rgba(0,0,0,.05); --active-bg: rgba(0,0,0,.04);
    --kw-orange-bg: rgba(230,162,60,.15); --kw-orange-hover: rgba(230,162,60,.35);
    --kw-green-bg: rgba(0,168,112,.14); --kw-yellow-bg: rgba(245,189,58,.15);
    --kw-purple-bg: rgba(156,96,240,.15); --kw-blue-bg: rgba(66,153,225,.15);
  }

  height: 100vh;
  background: var(--bg-root);
  color: var(--text-1);
  display: flex; flex-direction: column; overflow: hidden;
  transition: background .3s, color .3s;
}

/* ============================================================
   通用：图标按钮颜色 + 尺寸 —— 全部提亮
   ============================================================ */
.header-icon-btn {
  :deep(.t-icon) { font-size: 20px; color: var(--ico) !important; transition: color .2s; }
  &:hover :deep(.t-icon) { color: var(--ico-hover) !important; }
}
.tool-btn {
  :deep(.t-icon) { font-size: 18px; color: var(--ico) !important; transition: color .2s; }
  &:hover :deep(.t-icon) { color: var(--ico-hover) !important; }
  .fav-active { color: #e34d59 !important; }
}
.sl-act-btn {
  :deep(.t-icon) { font-size: 18px; color: var(--ico) !important; transition: color .2s; }
  &:hover :deep(.t-icon) { color: var(--ico-hover) !important; }
}
.panel-btn :deep(.t-icon) { font-size: 18px; color: var(--ico) !important; }

/* ============================================================
   HEADER —— 清晰的 Tab 导航栏
   ============================================================ */
.header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 24px; background: var(--bg-root);
  border-bottom: 1px solid var(--border-main); flex-shrink: 0;

  .header-left {
    display: flex; align-items: center; gap: 14px;
    .title { font-size: 18px; font-weight: 600; margin: 0; }
  }
  .mode-switcher {
    display: flex; align-items: center;
    gap: 4px;

    /* Card 模式：明暗双主题适配 */
    :deep(.t-tabs) { background: transparent !important; }
    :deep(.t-tabs__header) { border-bottom: none !important; background: transparent !important; }
    :deep(.t-tabs__nav-container),
    :deep(.t-tabs__nav-scroll) { background: transparent !important; }
    :deep(.t-tabs__nav-wrap) {
      background: var(--bg-elevated) !important;
      border-radius: 6px;
      padding: 2px;
      border: none !important;
    }
    :deep(.t-tabs__nav-item) {
      padding: 4px 14px !important;
      border-radius: 4px !important;
      font-size: 13px;
      color: var(--text-3) !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      transition: all .2s;
      &::after { display: none !important; }
      &:hover {
        color: var(--text-1) !important;
        background: var(--hover-bg) !important;
        box-shadow: none !important;
      }
      &.t-is-active {
        color: var(--text-1) !important;
        background: var(--bg-root) !important;
        box-shadow: 0 1px 3px rgba(0,0,0,.12) !important;
        font-weight: 600;
        &:hover { background: var(--bg-root) !important; }
      }
    }

    /* 词卡按钮 */
    .wordcard-header-btn {
      margin-left: 4px;
      font-size: 13px;
      font-weight: 500;
      height: 34px;
      padding: 0 16px;
      border-radius: 6px;
    }
  }
}

/* 右侧功能图标按钮 —— 提亮（在 .header 级别下）*/
.header-icon-btn {
    :deep(.t-icon) { font-size: 20px; color: rgba(255,255,255,.75) !important; transition: color .2s; }
    &:hover :deep(.t-icon) { color: #fff !important; }
  }

/* ============================================================
   MAIN LAYOUT —— 左右各占 50%
   ============================================================ */
.main-content {
  display: flex; flex: 1; overflow: hidden;
}

/* ============================================================
   VIDEO SECTION —— 左侧 60%，视频占比更大
   ============================================================ */
.video-section {
  width: 60%; display: flex; flex-direction: column; background: var(--bg-root);
  gap: 0;
  &.hide-video .video-player-wrapper { height: 0; overflow: hidden; }
}
.video-player-wrapper {
  position: relative;
  /* 视频占大部分空间 */
  flex: 6; /* 占比权重 */
  display: flex; align-items: center; justify-content: center;
  background: #000;
  border-radius: 14px; margin: 10px 10px 0 10px;
  overflow: hidden;
  .video-player { width: 100%; height: 100%; object-fit: contain; }
  .play-overlay {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--ico);
    &:hover { color: var(--ico-hover); }
    .play-overlay-icon { color: inherit; }
  }
  .video-info-overlay {
    position: absolute; top: 18px; left: 24px; display: flex; flex-direction: column; gap: 8px;
    .video-title { font-size: 17px; font-weight: 500; color: var(--text-1); }
    .episode-label { font-size: 26px; font-weight: 700; color: var(--text-1); opacity: .8; }
  }
}
.video-progress {
  padding: 6px 20px;
  .time-display {
    display: flex; justify-content: space-between; margin-top: 4px;
    font-size: 13px; color: var(--text-3);
  }
}

/* ============================================================
   CONTROL PANEL —— 大字体大图标，高对比度
   ============================================================ */
.control-panel {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 12px 24px;
  flex-wrap: wrap;
  .ctrl-item {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    cursor: pointer; padding: 7px 12px; border-radius: 6px; min-width: 56px;
    transition: background .15s;
    &:hover { background: var(--hover-bg); }
    .ctrl-label { font-size: 16px; font-weight: 600; color: var(--text-1); line-height: 1.3; }
    .ctrl-name { font-size: 12px; color: var(--text-3); line-height: 1.3; }
    .phonetic-symbol { &.active { color: #4caf50; } }
    .point-a { color: #4caf50; }
    .ctrl-ico { font-size: 20px; color: var(--ico) !important; transition: color .15s; }
    .ctrl-ico-nav { font-size: 20px; }
    .ctrl-ico-play { color: var(--text-1) !important; font-size: 28px !important; }
  }
  .ctrl-item:hover .ctrl-ico { color: var(--ico-hover) !important; }
}

/* ============================================================
   SUBTITLE DISPLAY —— 大字体
   ============================================================ */
.subtitle-display {
  flex: 4;
  padding: 16px 24px; background: var(--bg-elevated);
  margin: 0 10px 10px 10px;
  border-radius: 12px;
  display: flex; flex-direction: column;
  overflow-y: auto;
  .sub-toolbar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 12px; font-size: 14px; color: var(--text-3);
    .mode-switch-link {
      margin-left: auto; cursor: pointer; color: var(--text-2);
      &:hover { color: var(--text-1); }
    }
    .recording-label { display: flex; align-items: center; gap: 4px; color: var(--text-2); }
    .mic-dot { color: #e34d59 !important; }
  }
  .sub-content-area {
    min-height: 80px;
    display: flex; flex-direction: column; justify-content: center;
    padding: 12px 0;
  }

  .dictation-box {
    display: flex; flex-direction: column; gap: 10px;
    .dictation-textarea :deep(.t-textarea__inner) {
      background: var(--bg-elevated); border-color: var(--border-main);
      color: var(--text-1);
      &::placeholder { color: var(--text-4); }
    }
    .show-original-btn { align-self: flex-start; }
  }
  .translate-box {
    .cn-hint { font-size: 16px; color: var(--text-2); margin-bottom: 10px; }
    .en-input :deep(.t-input__inner) {
      background: var(--bg-elevated); border-color: var(--border-main); color: var(--text-1);
    }
  }
  .normal-subtitle {
    text-align: center;
    .en-text {
      font-size: 26px; font-weight: 500; margin-bottom: 10px; line-height: 1.6;
      :deep(.kw) {
        cursor: pointer; padding: 2px 5px; border-radius: 4px; transition: background .2s;
        &.kw-orange { background: var(--kw-orange-bg); &:hover{background:var(--kw-orange-hover)} }
        &.kw-green  { background: var(--kw-green-bg); }
        &.kw-yellow { background: var(--kw-yellow-bg); }
        &.kw-purple { background: var(--kw-purple-bg); }
        &.kw-blue   { background: var(--kw-blue-bg); }
      }
    }
    .cn-text { font-size: 17px; color: var(--text-2); line-height: 1.5; }
  }
}

/* ============================================================
   RIGHT PANEL —— 右侧 40%
   ============================================================ */
.right-panel {
  width: 40%; min-width: 0;
  background: var(--bg-root); border-left: 1px solid var(--border-main);
  overflow: hidden; display: flex; flex-direction: column; position: relative;
}

/* ---------- WORD DETAIL PANEL ---------- */
.word-detail-panel {
  position: absolute; inset: 0; background: var(--bg-root); z-index: 10;
  display: flex; flex-direction: column; overflow-y: auto;
  .wd-header {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px; border-bottom: 1px solid var(--border-main);
    .wd-word { font-size: 20px; font-weight: 600; flex: 1; color: var(--text-1); }
    .wd-actions { display: flex; align-items: center; gap: 10px;
      .wd-star-btn { font-size: 13px; padding: 3px 10px; }
    }
  }
  .wd-body { padding: 20px;
    .wd-phonetic-row {
      display: flex; gap: 18px; margin-bottom: 18px;
      .phon-badge {
        font-size: 15px; color: var(--text-2);
        padding: 6px 14px; background: var(--bg-elevated); border-radius: 5px;
        em { font-style: normal; color: var(--text-2); }
      }
    }
    .wd-meaning-row {
      display: flex; align-items: flex-start; gap: 10px; margin-bottom: 20px; font-size: 15px; line-height: 1.65;
      .meaning-txt { color: var(--text-2);
        em { color: #e6a23c; font-style: normal; }
      }
    }
    .wd-example-block { margin-bottom: 20px;
      .ex-label { font-size: 13px; color: var(--text-4); margin-bottom: 5px; }
      .ex-en { font-size: 15px; color: var(--text-1); line-height: 1.65; margin-bottom: 3px; opacity: .85; }
      .ex-cn { font-size: 14px; color: var(--text-2); line-height: 1.55; }
    }
    .wd-recall-row {
      display: flex; align-items: center; gap: 8px;
      padding: 12px 18px; background: var(--bg-elevated); border-radius: 8px;
      font-size: 15px; color: var(--text-2); cursor: pointer; margin-bottom: 20px;
      transition: background .2s;
      &:hover { background: var(--hover-bg); }
      .recall-ico { color: var(--text-2); font-size: 20px; }
    }
    .wd-social-row {
      display: flex; gap: 10px; justify-content: center;
      .social-dot {
        width: 38px; height: 38px; border-radius: 50%;
        border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
        background: transparent; transition: transform .2s;
        :deep(.t-icon) { font-size: 18px; }
        &:hover { transform: scale(1.12); }
        &.sd-wechat  { :deep(.t-icon){color:#07c160} }
        &.sd-qq     { :deep(.t-icon){color:#12b7f5} }
        &.sd-weibo  { :deep(.t-icon){color:#e6162d} }
        &.sd-twitter { :deep(.t-icon){color:#1da1f2} }
        &.sd-github { :deep(.t-icon){color:var(--ico)} }
        &.sd-link   { :deep(.t-icon){color:var(--text-4)} }
      }
    }
  }
}

/* ---------- WORD CARD LIST —— 大字体 ---------- */
.wc-section {
  display: flex; flex-direction: column; height: 100%;
  .wc-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px; border-bottom: 1px solid var(--border-main);
    .wc-total-time { font-size: 14px; color: var(--text-3); }
  }
  .wc-list {
    flex: 1; overflow-y: auto; padding: 10px;
    .wc-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; margin-bottom: 6px; border-radius: 10px;
      cursor: pointer; transition: background .2s;
      &:hover { background: var(--hover-bg); }
      &.active { background: var(--active-bg); }
      .wc-left { display: flex; align-items: center; gap: 14px;
        .wc-no { font-size: 14px; color: var(--text-4); min-width: 24px; }
        .wc-word { font-size: 18px; font-weight: 500; color: var(--text-1); }
      }
      .wc-right { display: flex; align-items: center; gap: 8px;
        .wc-arrow { color: var(--text-4) !important; font-size: 16px; }
      }
    }
  }
}

/* ---------- SUBTITLE LIST —— 大字体 ---------- */
.sl-section { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
.sl-list {
  flex: 1; overflow-y: auto; padding: 12px;
  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: var(--text-4); border-radius: 3px; }

  .sl-item {
    padding: 16px; margin-bottom: 8px; border-radius: 10px; cursor: pointer; transition: all .2s;
    &:hover { background: var(--hover-bg); }
    &.active { background: var(--active-bg); border-left: 4px solid var(--kw-green-solid); }

    /* 双语 */
    .sl-en {
      font-size: 18px; line-height: 1.65; margin-bottom: 8px;
      :deep(.kw) {
        cursor: pointer; padding: 2px 5px; border-radius: 4px; transition: background .2s;
        &.kw-orange { background: var(--kw-orange-bg); &:hover{background:var(--kw-orange-hover)} }
        &.kw-green  { background: var(--kw-green-bg); }
        &.kw-yellow { background: var(--kw-yellow-bg); }
        &.kw-purple { background: var(--kw-purple-bg); }
        &.kw-blue   { background: var(--kw-blue-bg); }
      }
    }
    .sl-cn { font-size: 15px; color: var(--text-2); line-height: 1.55; }

    /* 中文全文 */
    .sl-cn-full {
      display: flex; align-items: flex-start; gap: 12px;
      .sl-num { font-size: 14px; color: var(--text-4); min-width: 22px; padding-top: 2px; }
      .sl-cn-txt { flex: 1; font-size: 16px; line-height: 1.6; color: var(--text-2); }
      .sl-expand { color: var(--text-4); font-size: 18px; flex-shrink: 0; margin-top: 3px; }
    }

    /* 听写占位 */
    .sl-dict-placeholder { color: var(--text-4); font-size: 17px; letter-spacing: 6px; }

    /* 挖空 —— 绿色填充框 */
    .sl-blank {
      font-size: 17px; line-height: 1.7; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      :deep(.blank-input) {
        display: inline-block; width: 80px; height: 28px;
        background: var(--kw-green-bg); border: none; border-radius: 4px;
        color: var(--text-2); font-size: 14px; text-align: center; outline: none;
        padding: 0 6px; box-sizing: border-box;
        &::placeholder { color: var(--text-4); opacity: .6; }
        &:focus { box-shadow: 0 0 0 1px var(--kw-green-solid); }
      }
    }

    .sl-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border-subtle);
      .sl-time { font-size: 13px; color: var(--text-4); }
      .sl-actions { display: flex; gap: 4px; }
    }
  }
}

/* ============================================================
   SETTINGS DRAWER — 暗色主题弹窗
   ============================================================ */
.settings-drawer {
  :deep(.t-drawer__body) { background: #1e1e1e !important; color: #ddd !important; }
  :deep(.t-drawer__header) { background: #1e1e1e !important; color: #ddd !important; border-bottom: 1px solid #333; }
  :deep(.t-drawer__close-btn) { color: #999; &:hover { color: #ddd; } }
  :deep(.t-drawer__title-text) { color: #ddd; font-weight: 600; }
}
.settings-body {
  padding: 20px 24px;
  .st-tabs {
    display: flex; align-items: center; gap: 14px;
    padding-bottom: 16px; border-bottom: 1px solid #333; margin-bottom: 20px; position: relative;
    .st-tab {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      cursor: pointer; padding: 8px 12px; border-radius: 6px;
      color: #888; font-size: 11px; transition: all .2s;
      &:hover, &.active { color: #5ba3ff; background: rgba(91,163,255,.1); }
      .st-tab-ico { font-size: 20px; }
    }
  }
  .st-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 0; border-bottom: 1px solid #2a2a2a;
    .st-lbl {
      display: flex; align-items: center; gap: 8px; font-size: 14px; color: #ccc;
      .st-ico { color: #777; font-size: 17px; }
    }
  }
}

/* ============================================================
   ANIMATIONS
   ============================================================ */
.slide-right-enter-active, .slide-right-leave-active { transition: transform .3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }
</style>
