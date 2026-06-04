<template>
  <div class="courses-page theme-dark">
    <!-- ==================== 顶部导航栏 ==================== -->
    <header class="top-nav">
      <div class="nav-left">
        <t-button variant="text" shape="square" class="back-btn" @click="$router.back()">
          <template #icon><t-icon name="chevron-left" /></template>
        </t-button>
        <div class="brand">
          <span class="brand-icon">T</span>
          <span class="brand-name">TypeMaster</span>
        </div>
      </div>
      <h1 class="page-title">选择你的课程</h1>
      <div class="nav-right">
        <t-button variant="text" shape="square" size="small" @click="showSettings = true">
          <template #icon><t-icon name="setting" /></template>
        </t-button>
        <div class="user-avatar">
          <t-icon name="user-circle" size="28px" />
        </div>
      </div>
    </header>

    <!-- ==================== 主内容区 ==================== -->
    <main class="main-content">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <t-icon name="search" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索课程、单词书或文章..."
          class="search-input"
        />
      </div>

      <!-- 筛选栏：分类标签 + 难度筛选 -->
      <div class="filter-bar">
        <div class="category-tabs">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="cat-tab"
            :class="{ active: activeCategory === cat.value }"
            @click="activeCategory = cat.value"
          >{{ cat.label }}</button>
        </div>
        <div class="difficulty-tabs">
          <button
            v-for="diff in difficulties"
            :key="diff.value"
            class="diff-tab"
            :class="{ active: activeDifficulty === diff.value }"
            @click="activeDifficulty = diff.value"
          >{{ diff.label }}</button>
        </div>
      </div>

      <!-- ========== 考试词汇 ========== -->
      <section class="course-section">
        <div class="section-header">
          <h2 class="section-title">考试词汇</h2>
          <a href="#" class="view-all" @click.prevent>查看全部 <t-icon name="chevron-right" /></a>
        </div>
        <div class="exam-cards">
          <div
            v-for="course in examCourses"
            :key="course.id"
            class="exam-card"
            :class="{ recommended: course.recommended, hot: course.hot }"
            @click="goToWordTyping(course)"
          >
            <div class="card-badges">
              <span v-if="course.hot" class="badge badge-hot">热门</span>
              <span v-if="course.recommended" class="badge badge-rec">推荐</span>
            </div>
            <div class="card-icon" :style="{ background: course.iconBg, color: course.iconColor }">
              <t-icon name="book" size="32px" />
            </div>
            <h3 class="card-title">{{ course.name }}</h3>
            <p class="card-count">{{ course.wordCount }}词</p>
            <p class="card-meta">
              <t-icon name="time" />
              预计 {{ course.estimatedTime }}
            </p>
            <div class="progress-wrap">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: course.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ course.progress }}%</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ========== 场景词汇 ========== -->
      <section class="course-section">
        <div class="section-header">
          <h2 class="section-title">场景词汇</h2>
        </div>
        <div class="scene-grid">
          <div
            v-for="course in sceneCourses"
            :key="course.id"
            class="scene-card"
            @click="goToWordTyping(course)"
          >
            <div class="scene-icon" :style="{ background: course.iconBg, color: course.iconColor }">
              <t-icon :name="course.icon" size="32px" />
            </div>
            <div class="scene-info">
              <h3>{{ course.name }}</h3>
              <p class="scene-desc">{{ course.desc }}</p>
              <p class="scene-stats">{{ course.wordCount }}词</p>
            </div>
          </div>
        </div>

        <!-- 右侧：长文章练习 -->
        <div class="article-section">
          <div class="section-header">
            <h2 class="section-title">长文章练习</h2>
            <a href="#" class="view-all" @click.prevent>查看全部 <t-icon name="chevron-right" /></a>
          </div>
          <div class="article-list">
            <div
              v-for="article in articles"
              :key="article.id"
              class="article-item"
              @click="goToSentenceTyping(article)"
            >
              <div class="article-icon">
                <t-icon name="file-paste" />
              </div>
              <div class="article-info">
                <h4>{{ article.title }} <span class="article-count">({{ article.count }}篇)</span></h4>
                <div class="article-meta-row">
                  <span class="diff-badge" :class="'diff-' + article.difficulty">{{ article.difficultyLabel }}</span>
                  <span class="word-count">{{ article.totalWords }}字</span>
                </div>
              </div>
              <button class="star-btn" @click.stop="toggleStar(article)">
                <t-icon :name="article.starred ? 'star-filled' : 'star'" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ==================== 底部统计栏 ==================== -->
    <footer class="stats-footer">
      <div class="stat-item">
        <div class="stat-icon-bg clock">
          <t-icon name="time" />
        </div>
        <div class="stat-detail">
          <span class="stat-label">今日练习</span>
          <span class="stat-value">45<span class="unit">分钟</span></span>
          <span class="stat-trend up">较昨日 +15分钟 <t-icon name="arrow-up" /></span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon-bg words">
          <t-icon name="book" />
        </div>
        <div class="stat-detail">
          <span class="stat-label">累计单词</span>
          <span class="stat-value">2,580<span class="unit">个</span></span>
          <span class="stat-trend up">较昨日 +120个 <t-icon name="arrow-up" /></span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon-bg streak">
          <t-icon name="check-circle" />
        </div>
        <div class="stat-detail">
          <span class="stat-label">连续打卡</span>
          <span class="stat-value">12<span class="unit">天</span></span>
          <span class="stat-trend">继续加油 <t-icon name="fire" /></span>
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-icon-bg accuracy">
          <t-icon name="target" />
        </div>
        <div class="stat-detail">
          <span class="stat-label">平均准确率</span>
          <span class="stat-value">94<span class="unit">%</span></span>
          <span class="stat-trend up">较昨日 +2% <t-icon name="arrow-up" /></span>
        </div>
      </div>
    </footer>

    <!-- 浮动按钮：错题本 -->
    <button class="float-action-btn" @click="$router.push('/profile')">
      <t-icon name="book" size="24px" />
      <span>我的错题本</span>
      <span class="badge-dot">23</span>
    </button>

    <!-- 设置弹窗 -->
    <t-dialog v-model:visible="showSettings" header="设置" :footer="false" width="400px">
      <div class="settings-body">
        <div class="setting-row">
          <span>深色模式</span>
          <t-switch v-model="isDark" />
        </div>
        <div class="setting-row">
          <span>显示已完成课程</span>
          <t-switch v-model="showCompleted" />
        </div>
        <div class="setting-row">
          <span>键盘音效</span>
          <t-switch v-model="keySound" />
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { useCourses } from './index'

const {
  searchQuery,
  activeCategory,
  activeDifficulty,
  categories,
  difficulties,
  examCourses,
  sceneCourses,
  articles,
  isDark,
  showSettings,
  showCompleted,
  keySound,
  goToWordTyping,
  goToSentenceTyping,
  toggleStar
} = useCourses()
</script>

<style scoped lang="scss">
@use './index.scss' as *;
</style>
