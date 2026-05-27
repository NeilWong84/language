<template>
  <div class="practice">
    <t-layout>
      <t-header>
        <t-head-menu theme="light">
          <template #logo>
            <span class="logo">语言学习平台</span>
          </template>
          <t-menu-item route="/">首页</t-menu-item>
          <t-menu-item route="/learn">视频学习</t-menu-item>
          <t-menu-item route="/practice" active>练习中心</t-menu-item>
          <t-menu-item route="/profile">个人中心</t-menu-item>
        </t-head-menu>
      </t-header>

      <t-content class="content">
        <h1>练习中心</h1>
        
        <t-tabs v-model="activeTab">
          <t-tab-panel :value="1" label="听力练习">
            <div class="practice-content">
              <t-alert theme="info" message="根据视频内容，选择正确的答案" />
              
              <div class="question-card">
                <h3>问题 1/10</h3>
                <p class="question-text">视频中主人公说了什么？</p>
                
                <t-radio-group v-model="answer">
                  <t-radio v-for="option in options" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </t-radio>
                </t-radio-group>

                <t-button theme="primary" @click="submitAnswer" style="margin-top: 20px;">
                  提交答案
                </t-button>
              </div>
            </div>
          </t-tab-panel>

          <t-tab-panel :value="2" label="口语练习">
            <div class="practice-content">
              <t-alert theme="success" message="跟读视频中的句子，系统会评测您的发音" />
              
              <div class="practice-card">
                <p class="practice-text">Please repeat after the video:</p>
                <h3>"Hello, how are you today?"</h3>
                
                <t-button theme="primary" size="large" @click="startRecording">
                  <template #icon><t-icon name="mic" /></template>
                  开始录音
                </t-button>
                
                <t-button variant="outline" size="large" @click="stopRecording" style="margin-left: 12px;">
                  <template #icon><t-icon name="stop-circle" /></template>
                  停止录音
                </t-button>
              </div>
            </div>
          </t-tab-panel>

          <t-tab-panel :value="3" label="词汇练习">
            <div class="practice-content">
              <t-alert theme="warning" message="复习视频中出现的重要词汇" />
              
              <t-row :gutter="[16, 16]">
                <t-col :span="6" v-for="word in vocabularyList" :key="word.id">
                  <t-card :title="word.word" :description="word.meaning" hover>
                    <template #actions>
                      <t-button size="small" variant="text">发音</t-button>
                      <t-button size="small" variant="text">例句</t-button>
                    </template>
                  </t-card>
                </t-col>
              </t-row>
            </div>
          </t-tab-panel>
        </t-tabs>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref(1)
const answer = ref('')
const options = ref([
  { label: '选项 A', value: 'a' },
  { label: '选项 B', value: 'b' },
  { label: '选项 C', value: 'c' },
  { label: '选项 D', value: 'd' }
])

const vocabularyList = ref([
  { id: 1, word: 'Hello', meaning: '你好' },
  { id: 2, word: 'Thank you', meaning: '谢谢' },
  { id: 3, word: 'Goodbye', meaning: '再见' },
  { id: 4, word: 'Please', meaning: '请' }
])

const submitAnswer = () => {
  if (!answer.value) {
    alert('请选择一个答案')
    return
  }
  alert('答案已提交')
}

const startRecording = () => {
  alert('开始录音...')
}

const stopRecording = () => {
  alert('停止录音')
}
</script>

<style scoped lang="scss">
.practice {
  min-height: 100vh;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--td-brand-color);
}

.content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  h1 {
    margin-bottom: 24px;
    color: var(--td-text-color-primary);
  }
}

.practice-content {
  padding: 20px 0;
}

.question-card,
.practice-card {
  margin-top: 24px;
  padding: 24px;
  background: var(--td-bg-color-container);
  border-radius: 8px;

  h3 {
    margin-bottom: 16px;
    color: var(--td-text-color-primary);
  }

  .question-text,
  .practice-text {
    margin-bottom: 20px;
    color: var(--td-text-color-secondary);
    font-size: 16px;
  }
}
</style>
