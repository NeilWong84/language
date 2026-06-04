import { ref } from 'vue'
import { useRouter } from 'vue-router'

// ==================== 筛选状态 ====================
export const searchQuery = ref('')
export const activeCategory = ref('all')
export const activeDifficulty = ref('intermediate')

export const categories = [
  { label: '全部', value: 'all' },
  { label: '单词书', value: 'vocabulary' },
  { label: '长文章', value: 'articles' },
  { label: '我的收藏', value: 'favorite' },
  { label: '最近练习', value: 'recent' }
]

export const difficulties = [
  { label: '入门', value: 'beginner' },
  { label: '初级', value: 'elementary' },
  { label: '中级', value: 'intermediate' },
  { label: '高级', value: 'advanced' },
  { label: '精通', value: 'mastery' }
]

// ==================== 考试词汇数据 ====================
export interface ExamCourse {
  id: string
  name: string
  wordCount: number
  estimatedTime: string
  progress: number
  iconBg: string
  iconColor: string
  hot?: boolean
  recommended?: boolean
}

export const examCourses = ref<ExamCourse[]>([
  {
    id: 'cet4',
    name: '四级词汇',
    wordCount: 4500,
    estimatedTime: '25 小时',
    progress: 78,
    iconBg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(129, 199, 132, 0.08))',
    iconColor: '#4caf50',
    hot: true
  },
  {
    id: 'cet6',
    name: '六级词汇',
    wordCount: 5500,
    estimatedTime: '30 小时',
    progress: 65,
    iconBg: 'linear-gradient(135deg, rgba(33, 150, 243, 0.15), rgba(100, 181, 246, 0.08))',
    iconColor: '#2196f3'
  },
  {
    id: 'ielts',
    name: '雅思核心',
    wordCount: 3000,
    estimatedTime: '20 小时',
    progress: 82,
    iconBg: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15), rgba(186, 104, 200, 0.08))',
    iconColor: '#9c27b0',
    recommended: true
  },
  {
    id: 'toefl',
    name: '托福词汇',
    wordCount: 8000,
    estimatedTime: '40 小时',
    progress: 60,
    iconBg: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 183, 77, 0.08))',
    iconColor: '#ff9800'
  },
  {
    id: 'gre',
    name: 'GRE词汇',
    wordCount: 12000,
    estimatedTime: '60 小时',
    progress: 45,
    iconBg: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15), rgba(77, 208, 225, 0.08))',
    iconColor: '#00bcd4'
  },
  {
    id: 'kaoyan',
    name: '考研英语',
    wordCount: 5500,
    estimatedTime: '30 小时',
    progress: 70,
    iconBg: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(129, 199, 132, 0.08))',
    iconColor: '#4caf50'
  }
])

// ==================== 场景词汇数据 ====================
export interface SceneCourse {
  id: string
  name: string
  desc: string
  wordCount: number
  icon: string
  iconBg: string
  iconColor: string
}

export const sceneCourses = ref<SceneCourse[]>([
  {
    id: 'business',
    name: '商务英语',
    desc: '涵盖商务场景核心词汇',
    wordCount: 3580,
    icon: 'briefcase',
    iconBg: 'linear-gradient(135deg, rgba(0, 151, 167, 0.12), rgba(77, 182, 172, 0.06))',
    iconColor: '#0097a7'
  },
  {
    id: 'travel',
    name: '旅游英语',
    desc: '旅行各场景词汇和表达',
    wordCount: 1640,
    icon: 'airplane',
    iconBg: 'linear-gradient(135deg, rgba(255, 152, 0, 0.12), rgba(255, 193, 7, 0.06))',
    iconColor: '#ff9800'
  },
  {
    id: 'computer',
    name: '计算机英语',
    desc: 'IT领域专业词汇',
    wordCount: 3120,
    icon: 'desktop',
    iconBg: 'linear-gradient(135deg, rgba(33, 150, 243, 0.12), rgba(100, 181, 246, 0.06))',
    iconColor: '#2196f3'
  },
  {
    id: 'medical',
    name: '医学英语',
    desc: '医疗健康专业词汇',
    wordCount: 2870,
    icon: 'heart',
    iconBg: 'linear-gradient(135deg, rgba(244, 67, 54, 0.12), rgba(239, 83, 80, 0.06))',
    iconColor: '#e53935'
  },
  {
    id: 'law',
    name: '法律英语',
    desc: '法律术语和职业表达',
    wordCount: 2150,
    icon: 'gavel',
    iconBg: 'linear-gradient(135deg, rgba(63, 81, 181, 0.12), rgba(92, 107, 192, 0.06))',
    iconColor: '#3f51b5'
  },
  {
    id: 'daily',
    name: '日常口语',
    desc: '日常交流高频表达',
    wordCount: 1980,
    icon: 'chat',
    iconBg: 'linear-gradient(135deg, rgba(255, 152, 0, 0.12), rgba(255, 183, 77, 0.06))',
    iconColor: '#ff9800'
  }
])

// ==================== 长文章数据 ====================
export interface ArticleItem {
  id: string
  title: string
  count: number
  difficulty: string
  difficultyLabel: string
  totalWords: number
  starred: boolean
}

export const articles = ref<ArticleItem[]>([
  {
    id: 'essay-classic',
    title: '经典美文',
    count: 50,
    difficulty: 'easy',
    difficultyLabel: '简单',
    totalWords: 12000,
    starred: false
  },
  {
    id: 'essay-econ',
    title: '经济学人精选',
    count: 30,
    difficulty: 'hard',
    difficultyLabel: '困难',
    totalWords: 8000,
    starred: false
  },
  {
    id: 'tech-article',
    title: '科技文章',
    count: 40,
    difficulty: 'medium',
    difficultyLabel: '中等',
    totalWords: 15000,
    starred: false
  },
  {
    id: 'fairytale',
    title: '童话故事',
    count: 25,
    difficulty: 'easy',
    difficultyLabel: '简单',
    totalWords: 5000,
    starred: false
  },
  {
    id: 'movie-subtitle',
    title: '电影台词',
    count: 60,
    difficulty: 'medium',
    difficultyLabel: '中等',
    totalWords: 6000,
    starred: false
  }
])

// ==================== 设置状态 ====================
export const isDark = ref(true)
export const showSettings = ref(false)
export const showCompleted = ref(true)
export const keySound = ref(false)

// ==================== 方法 ====================
// 路由方法在 useCourses 内部调用，确保在 setup 上下文中
let _router: ReturnType<typeof import('vue-router').useRouter> | null = null

export const goToWordTyping = (course: ExamCourse | SceneCourse) => {
  _router?.push(`/practice/word?course=${course.id}`)
}

export const goToSentenceTyping = (article: ArticleItem) => {
  _router?.push(`/practice/sentence?article=${article.id}`)
}

export const toggleStar = (article: ArticleItem) => {
  article.starred = !article.starred
}

// 组合式函数
export function useCourses() {
  // 在 setup 上下文中调用 useRouter
  const router = useRouter()
  
  // 将 router 赋给模块级变量，供 goToWordTyping / goToSentenceTyping 使用
  _router = router
  
  return {
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
  }
}
