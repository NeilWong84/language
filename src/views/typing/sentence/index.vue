<template>
  <div class="sentence-typing" :class="{ 'theme-dark': isDark }">
    <!-- ==================== 顶部导航栏 ==================== -->
    <header class="top-nav">
      <div class="nav-left">
        <span class="brand">TypeMaster</span>
        <button class="nav-btn back-btn" @click="$router.back()">
          <t-icon name="chevron-left" />
          返回课馆
        </button>
      </div>
      <div class="nav-center">
        <h1 class="course-title">{{ articleTitle }}</h1>
      </div>
      <div class="nav-right">
        <button class="icon-btn" @click="showSettings = true">
          <t-icon name="setting" />
        </button>
        <button class="icon-btn" @click="toggleSound">
          <t-icon :name="soundOn ? 'sound' : 'sound-mute'" />
        </button>
        <div class="user-avatar">
          <span>U</span>
          <t-icon name="chevron-down" size="14px" />
        </div>
      </div>
    </header>

    <!-- ==================== 主内容区域 ==================== -->
    <div class="main-layout">
      <!-- 左侧主区域 -->
      <div class="left-panel">
        <!-- ========== 统计卡片行 ========== -->
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-icon-wrap speed">
              <t-icon name="speedometer" />
            </div>
            <div class="stat-body">
              <span class="stat-label">WPM 速度</span>
              <span class="stat-value">{{ wpm }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap accuracy">
              <t-icon name="check-circle" />
            </div>
            <div class="stat-body">
              <span class="stat-label">准确率</span>
              <span class="stat-value">{{ accuracy }}%</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap completed">
              <t-icon name="file-paste" />
            </div>
            <div class="stat-body">
              <span class="stat-label">已完成句数</span>
              <span class="stat-value highlight-blue">{{ completedCount }}/{{ sentenceList.length }}</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon-wrap duration">
              <t-icon name="time" />
            </div>
            <div class="stat-body">
              <span class="stat-label">练习时长</span>
              <span class="stat-value time-val">{{ formattedTime }}</span>
            </div>
          </div>
        </div>

        <!-- ========== 句子展示区 ========== -->
        <div class="sentence-display-area">
          <!-- 文章标题与进度 -->
          <div class="article-header">
            <h2 class="article-title">{{ articleTitle }}</h2>
            <div class="sentence-progress-info">
              <span>第 {{ currentIndex + 1 }} 句 / 共 {{ sentenceList.length }} 句</span>
              <button class="play-sentence-btn" @click="playSentenceAudio">
                <t-icon name="sound" /> 发音
              </button>
            </div>
          </div>

          <!-- 当前句子显示（带逐字高亮） -->
          <div class="current-sentence-box">
            <div class="sentence-text">
              <template v-for="(char, idx) in displayText.split('')" :key="'ref-'+idx">
                <span
                  class="ref-char"
                  :class="getRefCharClass(idx)"
                >{{ char }}</span>
              </template>
              <span v-if="!isCurrentComplete && isTyping" class="typing-cursor">|</span>
            </div>

            <!-- 中文翻译 -->
            <div class="chinese-translation">
              {{ cleanChineseText }}
            </div>
          </div>

          <!-- 本句进度条 -->
          <div class="local-progress-section">
            <div class="progress-label-row">
              <span>本句进度</span>
              <span>{{ currentSentenceProgress }}%</span>
            </div>
            <div class="mini-progress-bar">
              <div class="mini-progress-fill" :style="{ width: currentSentenceProgress + '%' }"></div>
            </div>
          </div>

          <!-- 全文章节进度 -->
          <div class="article-progress-section">
            <span class="progress-label">文章句子进度</span>
            <div class="sentence-dots">
              <button
                v-for="(s, idx) in sentenceList"
                :key="idx"
                class="sent-dot"
                :class="{
                  'completed': idx < currentIndex || (idx === currentIndex && isCurrentComplete),
                  'current': idx === currentIndex,
                  'pending': idx > currentIndex
                }"
                @click="goToSentence(idx)"
              >
                {{ idx + 1 }}
              </button>
            </div>
          </div>

          <!-- 隐藏输入框 -->
          <input
            ref="inputRef"
            class="hidden-input"
            v-model="userInput"
            @input="onInput"
            @keydown="onKeyDown"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />

          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <button class="action-btn" @click="prevSentence">
              <t-icon name="chevron-left" /> 上一句
            </button>
            <button class="action-btn" @click="togglePause">
              <t-icon :name="isPaused ? 'play-circle' : 'pause-circle'" />
              {{ isPaused ? '继续练习' : '暂停练习' }}
            </button>
            <button class="action-btn" @click="skipCurrent">
              <t-icon name="chevron-right" /> 跳过当前
            </button>
            <button class="action-btn hint-btn" @click="showTranslation = !showTranslation">
              <t-icon name="translation" /> 显示翻译
            </button>
            <button class="action-btn" @click="addToMistakes">
              <t-icon name="bookmark" /> 添加到错题本
            </button>
            <button class="action-btn primary-action" @click="nextSentence" :disabled="!canNext">
              下一句 <t-icon name="chevron-right" />
            </button>
          </div>
        </div>

        <!-- ========== 虚拟键盘 ========== -->
        <div v-if="showKeyboard" class="keyboard-section">
          <div class="keyboard-wrapper">
            <div class="kb-row">
              <kbd v-for="key in numRowKeys" :key="key" :class="getKeyClass(key)">{{ key }}</kbd>
            </div>
            <div class="kb-row">
              <kbd v-for="key in row1Keys" :key="key" :class="getKeyClass(key)">{{ key }}</kbd>
            </div>
            <div class="kb-row">
              <kbd class="kb-modifier">Shift</kbd>
              <kbd v-for="key in row2Keys" :key="key" :class="getKeyClass(key)">{{ key }}</kbd>
              <kbd class="kb-modifier">Enter</kbd>
            </div>
            <div class="kb-row">
              <kbd class="kb-modifier wide">Ctrl</kbd>
              <kbd v-for="key in row3Keys" :key="key" :class="getKeyClass(key)">{{ key }}</kbd>
              <kbd class="kb-modifier wide">Shift</kbd>
            </div>
            <div class="kb-row space-row">
              <kbd class="kb-wide" :class="{ active: lastKeyPressed === ' ' }">空格</kbd>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <aside class="right-panel">
        <!-- 文章信息卡片 -->
        <div class="info-card article-info">
          <h3 class="info-title">文章信息</h3>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">文章:</span>
              <span class="info-value">{{ articleTitle }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">难度:</span>
              <span class="difficulty-badge" :class="difficultyLevel">{{ difficultyLabel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">总字数:</span>
              <span class="info-value mono">{{ totalWordCount.toLocaleString() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">预计时间:</span>
              <span class="info-value mono">{{ estimatedTime }} 分钟</span>
            </div>
            <div class="info-item">
              <span class="info-label">当前进度:</span>
              <span class="info-value progress-highlight">{{ overallProgress }}%</span>
            </div>
          </div>
          <div class="overall-progress-bar">
            <div class="overall-fill" :style="{ width: overallProgress + '%' }"></div>
          </div>
        </div>

        <!-- 错题本快捷区 -->
        <div class="info-card mistake-card">
          <h3 class="info-title">错题本快捷区</h3>
          <div class="mistake-subtitle">
            本句错误单词:
          </div>
          <div class="current-mistake-words">
            <span
              v-if="currentMistakeWords.length === 0"
              class="no-mistake"
            >
              暂无错误 ✓
            </span>
            <span
              v-for="(mw, idx) in currentMistakeWords"
              :key="idx"
              class="mistake-word-tag error"
            >
              {{ mw.word }}
              <span class="mistake-tag-count">错误 {{ mw.count }} 次</span>
            </span>
          </div>
          
          <button 
            v-if="mistakeList.length > 0" 
            class="view-all-mistakes-btn"
            @click="showAllMistakes = !showAllMistakes"
          >
            <t-icon name="chevron-right" /> 查看完整错题本 →
          </button>
        </div>

        <!-- 完整错题列表 (展开) -->
        <transition name="slide-fade">
          <div v-if="showAllMistakes && mistakeList.length > 0" class="all-mistakes-list">
            <div
              v-for="(item, idx) in mistakeList"
              :key="idx"
              class="mistake-entry"
            >
              <span class="me-word">{{ item.sentencePreview }}</span>
              <span class="me-count">错 {{ item.count }} 次</span>
            </div>
          </div>
        </transition>
      </aside>
    </div>

    <!-- ==================== 底部控制栏 ==================== -->
    <footer class="bottom-control-bar">
      <div class="bottom-left">
        <span class="dict-label">
          <t-icon name="book" /> 当前文章:
        </span>
        <select v-model="selectedArticle" class="article-select">
          <option value="econ">经济学人精选</option>
          <option value="tech">科技前沿</option>
          <option value="culture">文化漫谈</option>
          <option value="news">新闻英语</option>
        </select>
      </div>
      <div class="bottom-center">
        <span class="mode-label">模式切换:</span>
        <div class="mode-tabs">
          <router-link to="/practice/word" class="mode-tab">单词模式</router-link>
          <button class="mode-tab active">句子模式</button>
        </div>
      </div>
      <div class="bottom-right">
        <div class="toggle-item">
          <span class="toggle-label">自动发音:</span>
          <t-switch v-model="autoPronounce" />
        </div>
        <div class="toggle-item">
          <span class="toggle-label">显示翻译:</span>
          <t-switch v-model="showTranslation" />
        </div>
        <div class="toggle-item">
          <span class="toggle-label">键盘提示:</span>
          <t-switch v-model="showKeyboard" />
        </div>
        <button class="hide-panel-btn" @click="hideRightPanel = !hideRightPanel">
          {{ hideRightPanel ? '显示' : '隐藏' }}
        </button>
      </div>
    </footer>

    <!-- ==================== 完成弹窗 ==================== -->
    <t-dialog
      v-model:visible="showCompleteDialog"
      header="🎉 文章练习完成!"
      :footer="false"
      width="560px"
    >
      <div class="complete-content">
        <div class="complete-stats-grid">
          <div class="cs-item">
            <span class="cs-label">总用时</span>
            <span class="cs-value">{{ formattedTotalTime }}</span>
          </div>
          <div class="cs-item">
            <span class="cs-label">平均 WPM</span>
            <span class="cs-value">{{ averageWpm }}</span>
          </div>
          <div class="cs-item">
            <span class="cs-label">总准确率</span>
            <span class="cs-value highlight-green">{{ totalAccuracy }}%</span>
          </div>
          <div class="cs-item">
            <span class="cs-label">完成句数</span>
            <span class="cs-value">{{ completedCount }} / {{ sentenceList.length }}</span>
          </div>
        </div>

        <!-- 各句详细统计 -->
        <div class="detail-section" v-if="allStats.length > 0">
          <h4 class="detail-title">各句统计详情</h4>
          <div class="detail-list">
            <div v-for="(stat, idx) in allStats" :key="idx" class="detail-row">
              <span class="dr-index">#{{ idx + 1 }}</span>
              <span class="dr-wpm">{{ stat.wpm }} wpm</span>
              <div class="dr-bar-track">
                <div class="dr-bar-fill" :style="{ width: stat.accuracy + '%', background: stat.accuracy >= 90 ? $success : stat.accuracy >= 70 ? $warning : $error }"></div>
              </div>
              <span class="dr-acc" :style="{ color: stat.accuracy >= 90 ? $success-light : stat.accuracy >= 70 ? $warning : $error-light }">{{ stat.accuracy }}%</span>
            </div>
          </div>
        </div>

        <div class="complete-actions">
          <t-button theme="primary" size="large" @click="retryAll">重新开始</t-button>
          <t-button variant="outline" size="large" @click="$router.back()">返回</t-button>
        </div>
      </div>
    </t-dialog>

    <!-- ==================== 设置弹窗 ==================== -->
    <t-dialog
      v-model:visible="showSettings"
      header="设置"
      :footer="false"
      width="420px"
    >
      <div class="settings-body">
        <div class="setting-item">
          <span>忽略大小写</span>
          <t-switch v-model="ignoreCase" />
        </div>
        <div class="setting-item">
          <span>忽略标点符号</span>
          <t-switch v-model="ignorePunctuation" />
        </div>
        <div class="setting-item">
          <span>自动下一句</span>
          <t-switch v-model="autoNext" />
        </div>
        <div class="setting-item">
          <span>显示虚拟键盘</span>
          <t-switch v-model="showKeyboard" />
        </div>
        <div class="setting-item">
          <span>深色模式</span>
          <t-switch v-model="isDark" />
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { useSentenceTyping } from './index'

const {
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
} = useSentenceTyping()
</script>

<style scoped lang="scss">
@use './index.scss' as *;
</style>
