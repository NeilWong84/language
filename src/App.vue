<template>
  <t-config-provider :global-config="localeConfig">
    <router-view />
  </t-config-provider>
</template>

<script setup>
import { ref } from 'vue'
import zhConfig from 'tdesign-vue-next/es/locale/zh_CN'

const localeConfig = ref(zhConfig)
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

/* TDesign深色主题覆盖 */
.t-head-menu {
  background: #1a1a1a !important;
  border-bottom: 1px solid #2a2a2a !important;
}
</style>
