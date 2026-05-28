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
        <!-- 统一模式Tab -->
        <t-tabs v-model="displayMode" theme="card" size="medium">
          <t-tab-panel value="bilingual" label="双语" />
          <t-tab-panel value="english" label="英语" />
          <t-tab-panel value="chinese" label="中文" />
          <t-tab-panel value="dictation" label="听写" />
          <t-tab-panel value="blank" label="词组" />
          <t-tab-panel value="read" label="阅读" />
          <t-tab-panel value="translation" label="中译英" />
          <t-tab-panel value="wordcard" label="词卡" />
        </t-tabs>

        <t-divider layout="vertical" :style="{ borderColor: isDark ? '#333' : '#e0e0e0' }" />

        <!-- 功能按钮组：隐藏视频 / 设置 / 主题切换 -->
        <t-button variant="text" shape="square" size="small" class="header-icon-btn" @click="toggleVideoVisible">
          <template #icon><t-icon :name="videoVisible ? 'browse-off' : 'browse'" /></template>
        </t-button>
        <t-button variant="text" shape="square" size="small" class="header-icon-btn" @click="showSettings = true">
          <template #icon><t-icon name="setting" /></template>
        </t-button>

        <t-divider layout="vertical" :style="{ borderColor: isDark ? '#333' : '#e0e0e0' }" />
        <t-button variant="text" shape="square" size="small" class="header-icon-btn theme-toggle" @click="toggleTheme">
          <template #icon><t-icon :name="isDark ? 'lightbulb' : 'moon'" /></template>
        </t-button>
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
            <t-icon :name="videoVisible ? 'browse-off' : 'browse'" class="ctrl-ico" />
            <span class="ctrl-name">{{ videoVisible ? '隐藏视频' : '显示视频' }}</span>
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
        <div v-if="videoVisible" class="subtitle-display">
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
              切换到{{ displayMode === 'dictation' ? '跟读' : '听写' }}
            </span>

            <span class="recording-label">
              录音：<span class="mic-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </span>
            </span>
          </div>

          <!-- 内容区域 -->
          <div class="sub-content-area">
            <!-- 听写模式（displayMode 或 practiceMode 为 dictation）：文本域 + 查看原文按钮 -->
            <div v-if="displayMode === 'dictation'" class="dictation-box">
              <t-textarea
                v-model="dictationText"
                placeholder="开始听写吧..."
                :autosize="{ minRows: 2, maxRows: 4 }"
                class="dictation-textarea"
              />
              
              <!-- Toggle 按钮：查看原文 / 关闭 -->
              <t-button 
                theme="default" 
                variant="base" 
                size="medium" 
                class="show-original-btn" 
                @click="toggleShowOriginal"
              >
                {{ showOriginal ? '关闭' : '查看原文' }}
              </t-button>
              
              <!-- 原文显示区域（toggle 显示）-->
              <transition name="slide-down">
                <div v-if="showOriginal" class="original-text-box">
                  <div class="original-label">字幕原文：</div>
                  <div class="original-content">{{ stripHtml(currentSubtitle?.english || '') }}</div>
                </div>
              </transition>
            </div>

            <!-- 中译英模式 -->
            <div v-else-if="displayMode === 'translation'" class="read-subtitle">
              <p class="en-text" v-html="renderedEnglish"></p>
              <p class="cn-text">{{ currentSubtitle?.chinese }}</p>
            </div>

            <!-- 挖空模式 -->
            <div v-else-if="displayMode === 'blank'" class="blank-subtitle" @click="onBlankClick">
              <p class="en-text" v-html="renderLeftBlank()"></p>
            </div>

            <!-- 阅读模式 -->
            <div v-else-if="displayMode === 'read'" class="read-subtitle">
              <p class="en-text" v-html="renderedEnglish"></p>
              <p class="cn-text">{{ currentSubtitle?.chinese }}</p>
            </div>

            <!-- 正常字幕展示 -->
            <div v-else class="normal-subtitle">
              <!-- 中文模式：只显示中文 -->
              <template v-if="displayMode === 'chinese'">
                <p class="cn-text chinese-only">{{ currentSubtitle?.chinese }}</p>
              </template>
              <!-- 其他模式：显示英文 + 中文（根据条件） -->
              <template v-else>
                <p class="en-text" v-html="renderedEnglish"></p>
                <p v-if="shouldShowCnTranslation" class="cn-text">{{ currentSubtitle?.chinese }}</p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- ====== 右侧面板区域 ====== -->
      <div class="right-panel">

        <!-- 隐藏视频时的遮罩层 -->
        <div v-if="!videoVisible" class="rp-overlay" @click="toggleVideoVisible">
          <span class="rp-overlay-text">已隐藏字幕</span>
          <span class="rp-overlay-hint">点击显示</span>
        </div>

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
            <t-message theme="info" size="small" class="wc-msg" :content="`当前视频共计：${totalStudyTime} 条词/短语`" />
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
              <!-- 阅读模式：行号 + 英文(kw) + 展开箭头 -->
              <template v-if="displayMode === 'read'">
                <div class="sl-read-row">
                  <span class="sl-read-num">{{ idx + 1 }}</span>
                  <div class="sl-read-content">
                    <div class="sl-read-en" v-html="kwHighlight(sub.english)"></div>
                    <transition name="read-expand">
                      <div v-if="readExpandSet.has(idx)" class="sl-read-cn">{{ sub.chinese }}</div>
                    </transition>
                  </div>
                  <span class="sl-read-arrow" :class="{ expanded: readExpandSet.has(idx) }" @click.stop="toggleReadExpand(idx)">
                    <t-icon name="chevron-down" />
                  </span>
                </div>
              </template>

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
              <!-- 听写占位 / 字幕预览 -->
              <template v-else-if="displayMode === 'dictation'">
                <!-- 预览展开：显示当前行字幕 -->
                <div v-if="subtitlePreviewSet.has(idx)" class="sl-dict-preview">
                  <div class="preview-en" v-html="kwHighlight(sub.english)"></div>
                  <div class="preview-cn">{{ sub.chinese }}</div>
                </div>
                <!-- 默认：省略号占位 -->
                <div v-else class="sl-dict-placeholder">...</div>
              </template>
              <!-- 中译英：行号 + 中文 + 展开箭头(展开显示英文) -->
              <template v-else-if="displayMode === 'translation'">
                <div class="sl-translate-row">
                  <span class="sl-translate-num">{{ idx + 1 }}</span>
                  <div class="sl-translate-content">
                    <div class="sl-translate-cn">{{ sub.chinese }}</div>
                    <transition name="read-expand">
                      <div v-if="translateExpandSet.has(idx)" class="sl-translate-en" v-html="kwHighlight(sub.english)"></div>
                    </transition>
                  </div>
                  <span class="sl-translate-arrow" :class="{ expanded: translateExpandSet.has(idx) }" @click.stop="toggleTranslateExpand(idx)">
                    <t-icon name="chevron-down" />
                  </span>
                </div>
              </template>

              <!-- 挖空 -->
              <template v-else-if="displayMode === 'blank'">
                <div class="sl-blank" v-html="genBlank(sub, idx)" @click="onBlankClick"></div>
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
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn sl-mic-btn" @click.stop="recordAt(idx)">
                      <template #icon>
                        <span class="mic-icon-btn">
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                          </svg>
                        </span>
                      </template>
                    </t-button>
                  </t-tooltip>
                  <t-tooltip :content="subtitlePreviewSet.has(idx) ? '隐藏' : '查看'">
                    <t-button variant="text" shape="square" size="small" class="sl-act-btn" :class="{ 'preview-active': subtitlePreviewSet.has(idx) }" @click.stop="toggleSubtitlePreview(idx)">
                      <template #icon><t-icon :name="subtitlePreviewSet.has(idx) ? 'browse-off' : 'browse'" /></template>
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
import { useLearn } from './index'
const {
  // 响应式状态
  isDark,
  videoPlayer,
  scrollContainerRef,
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  currentSentenceIndex,
  displayMode,
  dictationText,
  translateText,
  showOriginal,  // 是否显示原文
  subtitlePreviewSet,  // 隐藏按钮：已展开预览的行索引集合
  readExpandSet,  // 阅读模式：已展开中文的行索引集合
  translateExpandSet,  // 中译英模式：已展开英文的行索引集合
  blankRevealed,
  toggleBlankReveal,
  renderLeftBlank,
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
  toggleSubtitlePreview,  // 切换字幕预览显示/隐藏
  toggleReadExpand,  // 切换阅读模式中文展开/收起
  toggleTranslateExpand,  // 切换中译英模式英文展开/收起
  onBlankClick,  // 挖空块点击事件
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
} = useLearn()
</script>

<style scoped lang="scss">
@import './index.scss';
</style>
