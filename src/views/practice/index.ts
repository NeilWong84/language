import { ref } from 'vue'

export function usePractice() {
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

  return {
    activeTab,
    answer,
    options,
    vocabularyList,
    submitAnswer,
    startRecording,
    stopRecording,
  }
}
