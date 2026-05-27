<template>
  <div class="video-player-wrapper">
    <video
      ref="videoElement"
      :src="videoSrc"
      :controls="controls"
      :autoplay="autoplay"
      :loop="loop"
      @play="onPlay"
      @pause="onPause"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      class="video-element"
    >
      <track
        v-if="subtitles"
        kind="subtitles"
        :src="subtitles"
        srclang="zh"
        label="中文字幕"
        default
      />
      您的浏览器不支持视频播放
    </video>

    <div v-if="showSubtitle && currentSubtitle" class="subtitle-container">
      <p class="subtitle-main">{{ currentSubtitle.text }}</p>
      <p class="subtitle-trans">{{ currentSubtitle.translation }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  videoSrc: {
    type: String,
    required: true
  },
  controls: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: false
  },
  subtitles: {
    type: String,
    default: ''
  },
  showSubtitle: {
    type: Boolean,
    default: true
  },
  subtitleData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['play', 'pause', 'timeupdate', 'ended'])

const videoElement = ref(null)
const currentSubtitle = ref(null)

const onPlay = () => {
  emit('play')
}

const onPause = () => {
  emit('pause')
}

const onTimeUpdate = (event) => {
  const currentTime = event.target.currentTime
  emit('timeupdate', currentTime)
  
  // 更新字幕
  if (props.subtitleData && props.subtitleData.length > 0) {
    const subtitle = props.subtitleData.find(
      s => currentTime >= s.start && currentTime <= s.end
    )
    currentSubtitle.value = subtitle || null
  }
}

const onEnded = () => {
  emit('ended')
}

// 暴露方法供父组件调用
const play = () => videoElement.value?.play()
const pause = () => videoElement.value?.pause()
const seek = (time) => {
  if (videoElement.value) {
    videoElement.value.currentTime = time
  }
}

defineExpose({ play, pause, seek })
</script>

<style scoped lang="scss">
.video-player-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;

  .video-element {
    width: 100%;
    display: block;
  }
}

.subtitle-container {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.75);
  padding: 12px 24px;
  border-radius: 6px;
  text-align: center;
  min-width: 300px;
  max-width: 80%;

  .subtitle-main {
    color: #fff;
    font-size: 18px;
    font-weight: 500;
    margin: 0 0 8px 0;
  }

  .subtitle-trans {
    color: #ccc;
    font-size: 14px;
    margin: 0;
  }
}
</style>
