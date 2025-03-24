<script setup>
defineProps({
  buildTime: {
    type: String,
    required: true
  }
});
</script>

<template>
  <footer class="build-info-container">
    <div class="build-info">
      <span
        class="vpi-social-build-16 build-icon"
        aria-hidden="true"
        style="
          --icon: url('https://api.iconify.design/qlementine-icons/build-16.svg');
        "
      ></span>
      <time :datetime="buildTime" class="build-time">本站构建于：{{ buildTime }}</time>
    </div>
  </footer>
</template>

<style scoped>
@reference '../custom.css';

/* 构建时间 */
.build-info-container {
  @apply text-center text-sm text-gray-500 mt-16 mb-8;
}

.dark .build-info-container {
  color: var(--text-secondary-dark);
}

.build-info {
  @apply inline-flex items-center py-1.5 px-4 rounded-full;
  background-color: rgba(224, 242, 254, 0.3);
}

.dark .build-info {
  background-color: rgba(27, 27, 31, 0.6);
  border: 1px solid var(--border-dark);
}

.build-icon {
  @apply text-primary-500 mr-2;
}

.dark .build-icon {
  color: #38bdf8;
}

.build-time {
  @apply text-gray-600;
}

.dark .build-time {
  color: var(--text-secondary-dark);
}
</style> 