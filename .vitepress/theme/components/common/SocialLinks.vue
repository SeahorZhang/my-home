<script setup>
defineProps({
  links: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <nav class="social-links-container">
    <a
      v-for="(link, index) in links"
      :key="index"
      :href="link.link"
      target="_blank"
      :title="link.label"
      class="social-link"
      :aria-label="`访问${link.label}`"
    >
      <span class="sr-only">{{ link.label }}</span>
      <span
        :class="`vpi-social-${link.icon}`"
        aria-hidden="true"
        :style="{
          '--icon': `url('https://api.iconify.design/simple-icons/${link.icon}.svg')`,
        }"
      ></span>
    </a>
  </nav>
</template>

<style scoped>
@reference '../../custom.css';

/* 社交链接样式 */
.social-links-container {
  @apply flex gap-4 justify-center md:justify-start mt-2;
}

.social-link {
  @apply flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300;
  background: linear-gradient(145deg, #f8fafc, #e6edf5);
  box-shadow: 3px 3px 6px #d1d9e2, -3px -3px 6px #ffffff;
}

.social-link:hover {
  background: var(--accent-color);
  color: white;
}

.dark .social-link {
  background: linear-gradient(145deg, #2a2a2d, #222225);
  box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.2),
    -3px -3px 6px rgba(60, 60, 65, 0.1);
}

.dark .social-link:hover {
  background: var(--accent-color);
}

/* 屏幕阅读器专用文本 */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
}
</style> 