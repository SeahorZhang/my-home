<script setup>
/**
 * @typedef {Object} Project
 * @property {string} title - 项目标题
 * @property {string} description - 项目描述
 * @property {string} image - 项目图片URL
 * @property {string} link - 项目链接
 */

defineProps({
  /**
   * @type {Project}
   */
  project: {
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
    class="project-card"
    :class="{ 'is-visible': isVisible }"
  >
    <div class="card-image-container">
      <img
        :src="project.image"
        :alt="project.title"
        class="card-image"
        loading="lazy"
      />
      <span class="project-type-badge">Chrome扩展</span>
      <div class="card-overlay">
        <a
          :href="project.link"
          class="view-project-btn"
          target="_blank"
          :aria-label="`查看项目: ${project.title}`"
        >
          查看项目
        </a>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ project.title }}</h3>
      <p class="card-description">{{ project.description }}</p>
      <a :href="project.link" class="card-link" target="_blank">
        了解更多 <span class="arrow" aria-hidden="true">→</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
@reference '../../custom.css';

/* 项目卡片现代化设计 */
.project-card {
  @apply rounded-2xl overflow-hidden transition-all duration-500 opacity-0 transform scale-95;
  background-color: var(--card-bg-light);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(224, 242, 254, 0.2);
  height: 100%;
  will-change: transform, opacity;
}

.dark .project-card {
  background-color: var(--card-bg-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(64, 71, 86, 0.2);
}

.project-card.is-visible {
  @apply opacity-100 scale-100;
}

.project-card:hover {
  @apply transform -translate-y-2;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.15);
}

.dark .project-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 图片容器增强 */
.card-image-container {
  @apply h-52 overflow-hidden relative;
}

.card-image {
  @apply w-full h-full object-cover transition-transform duration-700;
  filter: brightness(0.95);
}

.project-card:hover .card-image {
  @apply transform scale-105;
  filter: brightness(1);
}

/* 覆盖层效果 */
.card-overlay {
  @apply absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
}

.project-card:hover .card-overlay {
  @apply opacity-100;
}

.view-project-btn {
  @apply px-4 py-2 bg-white text-gray-800 rounded-full text-sm font-medium 
         transform translate-y-4 transition-transform duration-300;
}

.project-card:hover .view-project-btn {
  @apply translate-y-0;
}

.view-project-btn:hover {
  @apply bg-primary-500 text-white;
}

.dark .view-project-btn {
  @apply bg-gray-800 text-white;
}

.dark .view-project-btn:hover {
  @apply bg-primary-600;
}

/* 角标样式增强 */
.project-type-badge {
  @apply absolute top-3 left-3 bg-primary-500 text-white text-xs font-medium py-1 px-3 rounded-full;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.4);
}

.dark .project-type-badge {
  @apply bg-primary-600;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 内容区样式增强 */
.card-content {
  @apply p-6;
}

.card-title {
  @apply text-xl font-semibold text-gray-800 mb-3;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dark .card-title {
  color: var(--text-primary-dark);
}

.card-description {
  @apply text-sm text-gray-600 mb-6 line-clamp-3 h-16;
}

.dark .card-description {
  color: var(--text-secondary-dark);
}

.card-link {
  @apply inline-flex items-center text-primary-600 font-medium text-sm transition-all duration-200;
  border-bottom: 1px dotted transparent;
}

.dark .card-link {
  color: #38bdf8;
}

.card-link:hover {
  @apply border-primary-500;
}

.card-link:hover .arrow {
  @apply transform translate-x-1;
}

.arrow {
  @apply ml-1 transition-transform duration-200;
}
</style> 