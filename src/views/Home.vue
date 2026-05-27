<template>
  <div class="home">
    <div class="banner">
      <h1>视频驱动型语言学习</h1>
      <p>通过真实视频场景，沉浸式学习外语</p>
      <t-button theme="primary" size="large" @click="goToLearn">
        开始学习
      </t-button>
    </div>

    <div class="features">
      <t-row :gutter="[16, 16]">
        <t-col :span="4" v-for="feature in features" :key="feature.title">
          <t-card :title="feature.title" :description="feature.desc" hover />
        </t-col>
      </t-row>
    </div>

    <div class="footer">
      <p>© 2026 视频驱动型语言学习平台</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = ref([
  { title: '视频学习', desc: '真实场景视频，沉浸式学习体验' },
  { title: '智能字幕', desc: '双语字幕，点击查词，即时翻译' },
  { title: '互动练习', desc: '基于视频内容的智能练习系统' },
  { title: '学习追踪', desc: '记录学习进度，科学复习计划' },
  { title: '发音评测', desc: 'AI语音识别，精准发音纠正' },
  { title: '社区交流', desc: '与学友互动，共同进步' }
])

const goToLearn = () => {
  router.push('/learn')
}
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  padding: 20px;
  flex: 1;
}

.banner {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, var(--td-brand-color-light) 0%, var(--td-brand-color-focus) 100%);
  border-radius: 8px;
  margin-bottom: 40px;

  h1 {
    font-size: 48px;
    color: var(--td-brand-color);
    margin-bottom: 16px;
  }

  p {
    font-size: 20px;
    color: var(--td-text-color-secondary);
    margin-bottom: 32px;
  }
}

.features {
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  padding: 20px;
  color: var(--td-text-color-placeholder);
  border-top: 1px solid var(--td-component-stroke);
  margin-top: 40px;
}
</style>
