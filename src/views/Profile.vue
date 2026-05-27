<template>
  <div class="profile">
    <t-layout>
      <t-header>
        <t-head-menu theme="light">
          <template #logo>
            <span class="logo">语言学习平台</span>
          </template>
          <t-menu-item route="/">首页</t-menu-item>
          <t-menu-item route="/learn">视频学习</t-menu-item>
          <t-menu-item route="/practice">练习中心</t-menu-item>
          <t-menu-item route="/profile" active>个人中心</t-menu-item>
        </t-head-menu>
      </t-header>

      <t-content class="content">
        <div class="profile-header">
          <t-avatar size="large" alt="用户头像">U</t-avatar>
          <div class="user-info">
            <h2>用户名</h2>
            <p>加入时间：2026-01-01</p>
          </div>
        </div>

        <t-divider />

        <t-row :gutter="[24, 24]">
          <t-col :span="8">
            <t-card title="学习统计">
              <div class="stats-item">
                <span>已学视频</span>
                <strong>12</strong>
              </div>
              <div class="stats-item">
                <span>学习时长</span>
                <strong>8.5 小时</strong>
              </div>
              <div class="stats-item">
                <span>掌握词汇</span>
                <strong>156</strong>
              </div>
              <div class="stats-item">
                <span>练习次数</span>
                <strong>48</strong>
              </div>
            </t-card>
          </t-col>

          <t-col :span="8">
            <t-card title="学习进度">
              <t-progress 
                :percentage="65" 
                label="总体进度"
                theme="line"
              />
              <div class="progress-detail">
                <p>听力水平: 中等</p>
                <p>口语水平: 初级</p>
                <p>词汇量: 156</p>
              </div>
            </t-card>
          </t-col>

          <t-col :span="8">
            <t-card title="最近学习">
              <t-list>
                <t-list-item v-for="item in recentLearning" :key="item.id">
                  <t-list-item-meta
                    :title="item.title"
                    :description="item.date"
                  />
                </t-list-item>
              </t-list>
            </t-card>
          </t-col>
        </t-row>

        <t-divider />

        <div class="settings">
          <h3>设置</h3>
          <t-form label-align="left" label-width="100px">
            <t-form-item label="学习目标">
              <t-select v-model="settings.goal" style="width: 300px;">
                <t-option label="日常交流" value="daily" />
                <t-option label="商务应用" value="business" />
                <t-option label="考试备考" value="exam" />
              </t-select>
            </t-form-item>
            
            <t-form-item label="每日目标">
              <t-slider v-model="settings.dailyGoal" :min="10" :max="120" :step="10" style="width: 300px;" />
              <span style="margin-left: 12px;">{{ settings.dailyGoal }} 分钟</span>
            </t-form-item>

            <t-form-item label="字幕设置">
              <t-switch v-model="settings.showSubtitle" />
              <span style="margin-left: 12px;">默认显示字幕</span>
            </t-form-item>

            <t-form-item>
              <t-button theme="primary">保存设置</t-button>
            </t-form-item>
          </t-form>
        </div>
      </t-content>
    </t-layout>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({
  goal: 'daily',
  dailyGoal: 30,
  showSubtitle: true
})

const recentLearning = ref([
  { id: 1, title: '餐厅点餐场景', date: '2026-05-27' },
  { id: 2, title: '机场问路对话', date: '2026-05-26' },
  { id: 3, title: '商务会议介绍', date: '2026-05-25' }
])
</script>

<style scoped lang="scss">
.profile {
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
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;

  .user-info {
    h2 {
      margin-bottom: 8px;
      color: var(--td-text-color-primary);
    }

    p {
      color: var(--td-text-color-secondary);
    }
  }
}

.stats-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--td-component-stroke);

  &:last-child {
    border-bottom: none;
  }

  strong {
    color: var(--td-brand-color);
  }
}

.progress-detail {
  margin-top: 16px;
  
  p {
    margin-bottom: 8px;
    color: var(--td-text-color-secondary);
  }
}

.settings {
  margin-top: 20px;
  padding: 20px;
  background: var(--td-bg-color-container);
  border-radius: 8px;

  h3 {
    margin-bottom: 20px;
    color: var(--td-text-color-primary);
  }
}
</style>
