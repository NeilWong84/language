<template>
  <t-config-provider :global-config="localeConfig">
    <router-view />
  </t-config-provider>
</template>

<script setup>
import { ref, provide, watch } from 'vue'
import zhConfig from 'tdesign-vue-next/es/locale/zh_CN'

const localeConfig = ref(zhConfig)
const isDark = ref(true)

// TDesign 暗黑模式：通过 :root.dark 类激活（tdesign-vue-next 内置支持）
watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
}, { immediate: true })

provide('globalIsDark', isDark)
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
    'Noto Color Emoji';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #1a1a1a;
  color: #fff;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
