import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/learn',
    name: 'Learn',
    component: () => import('@/views/learn/index.vue'),
    meta: { title: '视频学习' }
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/views/practice/index.vue'),
    meta: { title: '练习中心' }
  },
  {
    path: '/practice/courses',
    name: 'Courses',
    component: () => import('@/views/typing/courses/index.vue'),
    meta: { title: '课程选择' }
  },
  {
    path: '/practice/word',
    name: 'WordTyping',
    component: () => import('@/views/typing/word/index.vue'),
    meta: { title: '单词打字练习' }
  },
  {
    path: '/practice/sentence',
    name: 'SentenceTyping',
    component: () => import('@/views/typing/sentence/index.vue'),
    meta: { title: '句子打字练习' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { title: '个人中心' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '视频驱动型语言学习平台'
  next()
})

export default router
