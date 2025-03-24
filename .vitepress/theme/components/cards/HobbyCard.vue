<script setup>
/**
 * @typedef {Object} Hobby
 * @property {string} name - 爱好名称
 * @property {string} icon - 爱好图标
 * @property {string} description - 爱好描述
 */

defineProps({
  /**
   * @type {Hobby}
   */
  hobby: {
    type: Object,
    required: true
  },
  isVisible: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <div
    class="hobby-card"
    :class="{ 'is-visible': isVisible }"
  >
    <div class="hobby-icon" aria-hidden="true">{{ hobby.icon }}</div>
    <h3 class="hobby-title">{{ hobby.name }}</h3>
    <p class="hobby-description">{{ hobby.description }}</p>
  </div>
</template>

<style scoped>
@reference '../../custom.css';

.hobby-card {
  @apply rounded-xl overflow-hidden shadow-md p-6
         transition-all duration-500 opacity-0 transform scale-95;
  background-color: var(--card-bg-light);
  will-change: transform, opacity;
}

.dark .hobby-card {
  background-color: var(--card-bg-dark);
  box-shadow: var(--shadow-sm-dark);
}

.hobby-card.is-visible {
  @apply opacity-100 scale-100;
}

.hobby-card:hover {
  @apply transform -translate-y-2 shadow-lg;
  box-shadow: var(--shadow-md-dark);
}

.dark .hobby-card:hover {
  box-shadow: var(--shadow-md-dark);
}

.hobby-icon {
  @apply text-4xl mb-4;
}

.hobby-title {
  @apply text-xl font-semibold text-gray-800 mb-3;
}

.dark .hobby-title {
  color: var(--text-primary-dark);
}

.hobby-description {
  @apply text-sm text-gray-600;
}

.dark .hobby-description {
  color: var(--text-secondary-dark);
}
</style> 