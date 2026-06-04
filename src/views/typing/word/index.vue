<template>
  <div class="word-typing" :class="{ 'theme-dark': isDark, 'zen-active': zenMode }">
    <header v-if="!zenMode" class="top-nav">
      <div class="nav-left">
        <span class="brand">TypeMaster</span>
        <button class="nav-btn back-btn" @click="$router.back()">
          <t-icon name="chevron-left" />
          返回课程
        </button>
      </div>
      <div class="nav-center">
        <h1 class="course-title">{{ courseName }}</h1>
        <span class="progress-text">{{ currentIndex + 1 }}/{{ wordList.length }}</span>
      </div>
      <div class="nav-right">
        <button class="icon-btn" title="设置" @click="showSettings = true">
          <t-icon name="setting" />
        </button>
        <button class="icon-btn" :title="soundOn ? '关闭声音' : '开启声音'" @click="toggleSound">
          <t-icon :name="soundOn ? 'sound' : 'sound-mute'" />
        </button>
        <div class="user-avatar" @click="showUserMenu = !showUserMenu">
          <span>U</span>
          <t-icon name="chevron-down" size="14px" />
        </div>
      </div>
    </header>

    <div class="main-layout" :class="{ 'zen-layout': zenMode }">
      <div class="left-panel">
        <div v-if="!zenMode" class="stats-row">
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
            <div class="stat-icon-wrap streak">
              <t-icon name="rise" />
            </div>
            <div class="stat-body">
              <span class="stat-label">连续正确</span>
              <span class="stat-value">{{ streakCount }}</span>
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

        <div class="word-display-area">
          <div class="word-show">
            <template v-for="(char, idx) in currentWord.split('')" :key="idx">
              <span v-if="idx === userInput.length && !isCurrentComplete" class="typing-cursor">|</span>
              <span class="char" :class="getCharClass(idx)">{{ char }}</span>
            </template>
          </div>

          <div class="word-meta">
            <div class="phonetic-row">
              <span class="phonetic">/{{ currentWordData.phonetic }}/</span>
              <button class="play-sound-btn" title="播放发音" @click="playPronunciation()">
                <t-icon name="sound" />
              </button>
            </div>
            <div class="meaning-row">
              <span class="pos-tag">{{ currentWordData.pos }}</span>
              <span class="meaning">{{ currentWordData.meaning }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <button class="action-btn" @click="playPronunciation('us')">
              <t-icon name="sound" />
              美式
            </button>
            <button class="action-btn" @click="playPronunciation('uk')">
              <t-icon name="sound" />
              英式
            </button>
            <button class="action-btn hint-btn" @click="showHint = !showHint">
              <t-icon name="lightbulb" />
              {{ showHint ? '隐藏提示' : '显示提示' }}
            </button>
            <button class="action-btn" @click="addToMistakes">
              <t-icon name="bookmark" />
              加入错题
            </button>
            <button class="action-btn zen-btn" :class="{ active: zenMode }" @click="toggleZenMode()">
              <t-icon name="lightbulb" />
              {{ zenMode ? '退出禅模式' : '禅模式' }}
            </button>
          </div>

          <transition name="fade">
            <div v-if="showHint" class="hint-box">
              <p>提示：{{ getHintText() }}</p>
            </div>
          </transition>
        </div>

        <div v-if="showKeyboard" class="keyboard-section">
          <div class="keyboard-wrapper">
            <div class="kb-row">
              <kbd v-for="key in numRowKeys" :key="key" :class="getKeyClass(key)" @click="onKeyClick(key)">
                {{ key === 'Backspace' ? '' : key }}
                <t-icon v-if="key === 'Backspace'" name="delete" size="16px" />
              </kbd>
            </div>
            <div class="kb-row">
              <kbd v-for="key in row1Keys" :key="key" :class="getKeyClass(key)" @click="onKeyClick(key)">
                {{ key }}
              </kbd>
            </div>
            <div class="kb-row">
              <kbd class="kb-modifier">Shift</kbd>
              <kbd v-for="key in row2Keys" :key="key" :class="getKeyClass(key)" @click="onKeyClick(key)">
                {{ key }}
              </kbd>
              <kbd class="kb-modifier">Enter</kbd>
            </div>
            <div class="kb-row">
              <kbd class="kb-modifier wide">Ctrl</kbd>
              <kbd v-for="key in row3Keys" :key="key" :class="getKeyClass(key)" @click="onKeyClick(key)">
                {{ key }}
              </kbd>
              <kbd class="kb-modifier wide">Shift</kbd>
            </div>
            <div class="kb-row space-row">
              <kbd class="kb-wide" :class="{ active: lastKeyPressed === ' ' }" @click="onKeyClick(' ')">空格</kbd>
            </div>
          </div>
        </div>
      </div>

      <aside v-if="!zenMode" class="right-panel">
        <div class="mistake-header">
          <t-icon name="file-paste" />
          <span>我的错题本</span>
        </div>
        <div class="mistake-list">
          <div
            v-for="(item, idx) in mistakeList"
            :key="idx"
            class="mistake-item"
            @click="goToWord(item.index)"
          >
            <div class="mistake-word">{{ item.word }}</div>
            <div class="mistake-count">错误 {{ item.count }} 次</div>
            <t-icon name="chevron-right" class="mistake-arrow" />
          </div>
          <div v-if="mistakeList.length === 0" class="empty-mistake">
            <t-icon name="info-circle" />
            <p>暂无错题记录</p>
          </div>
        </div>
        <button v-if="mistakeList.length > 0" class="retry-mistakes-btn" @click="startMistakePractice">
          <t-icon name="refresh" />
          开始错题重练
        </button>
      </aside>
    </div>

    <footer v-if="!zenMode" class="bottom-control-bar">
      <div class="bottom-left">
        <span class="dict-label">
          <t-icon name="book" /> 当前词库:
        </span>
        <select v-model="selectedDict" class="dict-select">
          <option value="cet4">四级词汇</option>
          <option value="cet6">六级词汇</option>
          <option value="ielts">雅思核心词</option>
          <option value="toefl">托福词汇</option>
          <option value="gre">GRE 词汇</option>
          <option value="kaoyan">考研英语</option>
        </select>
      </div>
      <div class="bottom-center">
        <span class="mode-label">模式:</span>
        <div class="mode-tabs">
          <button class="mode-tab active">单词模式</button>
          <router-link to="/practice/sentence" class="mode-tab">句子模式</router-link>
        </div>
      </div>
      <div class="bottom-right">
        <div class="toggle-item">
          <span class="toggle-label">自动发音:</span>
          <t-switch v-model="autoPronounce" />
        </div>
        <div class="toggle-item">
          <span class="toggle-label">键盘提示:</span>
          <t-switch v-model="showKeyboard" />
        </div>
      </div>
    </footer>

    <t-dialog
      v-model:visible="showCompleteDialog"
      header="练习完成"
      :footer="false"
      width="520px"
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
            <span class="cs-label">完成数量</span>
            <span class="cs-value">{{ completedCount }} / {{ wordList.length }}</span>
          </div>
        </div>
        <div class="complete-actions">
          <t-button theme="primary" size="large" @click="retryAll">重新开始</t-button>
          <t-button variant="outline" size="large" @click="$router.back()">返回</t-button>
        </div>
      </div>
    </t-dialog>

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
          <span>自动下一题</span>
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
import { useWordTyping } from './index'

const {
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
  completedCount,
  streakCount,
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
} = useWordTyping()
</script>

<style scoped lang="scss">
@use './index.scss' as *;
</style>
