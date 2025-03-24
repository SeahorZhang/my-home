<script setup>
defineProps({
  type: {
    type: String,
  },
});
</script>

<template>
  <div
    class="grid-container"
    :class="{
      'projects-grid': type === 'projects',
      'hobbies-grid': type === 'hobbies',
    }"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
@reference '../../custom.css';

.grid-container {
  @apply grid mx-auto;
}

.projects-grid {
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl;
}

.hobbies-grid {
  @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl;
}
</style>
