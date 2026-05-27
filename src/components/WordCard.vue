<template>
  <div class="word-card" @click="handleClick">
    <t-card hover>
      <template #title>
        <div class="word-title">
          <span class="word">{{ word }}</span>
          <t-button 
            v-if="showAudio" 
            size="small" 
            variant="text" 
            shape="circle"
            @click.stop="playAudio"
          >
            <template #icon><t-icon name="volume-up" /></template>
          </t-button>
        </div>
      </template>
      
      <template #description>
        <div class="word-content">
          <p class="phonetic" v-if="phonetic">{{ phonetic }}</p>
          <p class="meaning">{{ meaning }}</p>
          <p class="example" v-if="example">
            <strong>例句：</strong>{{ example }}
          </p>
        </div>
      </template>

      <template #actions v-if="showActions">
        <t-button size="small" variant="text" @click.stop="handleAddToFavorite">
          <template #icon><t-icon name="star" /></template>
          收藏
        </t-button>
        <t-button size="small" variant="text" @click.stop="handleAddToNotebook">
          <template #icon><t-icon name="book-mark" /></template>
          笔记
        </t-button>
      </template>
    </t-card>
  </div>
</template>

<script setup>
const props = defineProps({
  word: {
    type: String,
    required: true
  },
  phonetic: {
    type: String,
    default: ''
  },
  meaning: {
    type: String,
    required: true
  },
  example: {
    type: String,
    default: ''
  },
  audioUrl: {
    type: String,
    default: ''
  },
  showAudio: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'favorite', 'notebook'])

const handleClick = () => {
  emit('click', props.word)
}

const playAudio = () => {
  if (props.audioUrl) {
    const audio = new Audio(props.audioUrl)
    audio.play()
  }
}

const handleAddToFavorite = () => {
  emit('favorite', props.word)
}

const handleAddToNotebook = () => {
  emit('notebook', props.word)
}
</script>

<style scoped lang="scss">
.word-card {
  cursor: pointer;
  
  .word-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .word {
      font-size: 18px;
      font-weight: 600;
      color: var(--td-text-color-primary);
    }
  }

  .word-content {
    .phonetic {
      color: var(--td-text-color-placeholder);
      font-size: 14px;
      margin-bottom: 8px;
    }

    .meaning {
      color: var(--td-text-color-secondary);
      font-size: 14px;
      margin-bottom: 8px;
    }

    .example {
      color: var(--td-text-color-secondary);
      font-size: 13px;
      margin: 0;
      
      strong {
        color: var(--td-text-color-primary);
      }
    }
  }
}
</style>
