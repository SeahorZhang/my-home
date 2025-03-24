<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <section class="mb-20 px-4">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <div class="section-divider"></div>
    </div>

    <slot></slot>
  </section>
</template>

<style scoped>
@reference '../../custom.css';

.section-header {
  @apply text-center mb-12;
}

.section-title {
  @apply text-2xl font-bold text-gray-800 mb-3 inline-block px-4 py-2 rounded-full;
  background-color: rgba(14, 165, 233, 0.1);
  color: var(--accent-color);
}

.dark .section-title {
  color: var(--text-primary-dark);
  background-color: rgba(14, 165, 233, 0.15);
}

.section-divider {
  @apply h-1 w-20 rounded mx-auto;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-dark));
}
</style>
