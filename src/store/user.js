import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref('')
  const isLoggedIn = ref(false)

  function setUserInfo(info) {
    userInfo.value = info
    isLoggedIn.value = true
  }

  function setToken(newToken) {
    token.value = newToken
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    isLoggedIn.value = false
  }

  return {
    userInfo,
    token,
    isLoggedIn,
    setUserInfo,
    setToken,
    logout
  }
})
