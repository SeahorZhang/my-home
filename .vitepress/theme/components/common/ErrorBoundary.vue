<script setup>
import { ref, onErrorCaptured } from 'vue';

const error = ref(null);

onErrorCaptured((err) => {
  error.value = err;
  console.error('Error captured:', err);
  return false; // 防止错误向上传播
});
</script>

<template>
  <div v-if="error" class="error-container">
    <div class="error-content">
      <h2 class="error-title">抱歉，加载过程中出现了问题</h2>
      <p class="error-message">{{ error.message }}</p>
      <button @click="error = null" class="retry-button">
        重试
      </button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<style scoped>
@reference '../../custom.css';
.error-container {
  @apply flex items-center justify-center min-h-80 p-8;
}

.error-content {
  @apply bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center max-w-lg mx-auto;
}

.error-title {
  @apply text-xl font-bold text-red-600 dark:text-red-400 mb-4;
}

.error-message {
  @apply text-gray-700 dark:text-gray-300 mb-6;
}

.retry-button {
  @apply px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors;
}
</style> 