<script setup>
// 导入配置数据，提高可维护性
import { personalInfo, projects, hobbies } from "./data";
import { ref, onMounted } from "vue";

// 打包时间 - 使用构建时的时间
const buildTime = __BUILD_TIME__;

// 动画控制 - 简化为单个状态对象
const animationState = ref({
  main: false,
  projects: Array(projects.length).fill(false),
  hobbies: Array(hobbies.length).fill(false),
});

// 使用更简洁的动画初始化方法
onMounted(() => {
  // 使用 requestAnimationFrame 代替多个 setTimeout
  requestAnimationFrame(() => {
    animationState.value.main = true;

    // 使用单个定时器和索引来控制序列动画
    let index = 0;
    const animateItems = () => {
      if (index < projects.length) {
        animationState.value.projects[index] = true;
      }

      if (index < hobbies.length) {
        animationState.value.hobbies[index] = true;
      }

      index++;
      if (index < Math.max(projects.length, hobbies.length)) {
        setTimeout(animateItems, 120);
      }
    };

    // 延迟启动项目和爱好的动画
    setTimeout(animateItems, 400);
  });
});
</script>

<template>
  <div class="about-container" :class="{ 'is-visible': animationState.main }">
    <!-- 顶部个人介绍 -->
    <section class="hero-section">
      <div class="profile-layout">
        <div class="avatar-wrapper">
          <img :src="personalInfo.avatar" alt="个人头像" class="avatar" />
        </div>
        <div class="profile-info">
          <div class="name-title-container">
            <h1 class="profile-name">{{ personalInfo.name }}</h1>
            <h2 class="profile-title">{{ personalInfo.title }}</h2>
          </div>
          <div class="bio-container">
            <p class="profile-brief">{{ personalInfo.bio }}</p>
            <p class="profile-bio">
              👋 你好！我是一名充满热情的技术爱好者和创造者。
              我坚信技术能力不该仅限于职场，并致力于探索独立开发者的自由之路。
            </p>
          </div>
          <nav class="social-links-container">
            <a
              v-for="(link, index) in personalInfo.socialLinks"
              :key="index"
              :href="link.link"
              target="_blank"
              :title="link.label"
              class="social-link"
              aria-label="社交媒体链接"
            >
              <span
                :class="`vpi-social-${link.icon}`"
                :style="{
                  '--icon': `url('https://api.iconify.design/simple-icons/${link.icon}.svg')`,
                }"
              ></span>
            </a>
          </nav>
        </div>
      </div>
    </section>

    <!-- 项目展示 - 优化版 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">开发项目</h2>
        <div class="section-divider"></div>
      </div>
      <div class="projects-grid">
        <div
          v-for="(project, index) in projects"
          :key="index"
          class="project-card"
          :class="{ 'is-visible': animationState.projects[index] }"
        >
          <div class="card-image-container">
            <img :src="project.image" :alt="project.title" class="card-image" />
            <span class="project-type-badge">Chrome扩展</span>
            <div class="card-overlay">
              <a :href="project.link" class="view-project-btn" target="_blank">
                查看项目
              </a>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ project.title }}</h3>
            <p class="card-description">{{ project.description }}</p>
            <a :href="project.link" class="card-link" target="_blank">
              了解更多 <span class="arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 生活爱好 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">生活爱好</h2>
        <div class="section-divider"></div>
      </div>
      <div class="hobbies-grid">
        <div
          v-for="(hobby, index) in hobbies"
          :key="index"
          class="hobby-card"
          :class="{ 'is-visible': animationState.hobbies[index] }"
        >
          <div class="hobby-icon">{{ hobby.icon }}</div>
          <h3 class="hobby-title">{{ hobby.name }}</h3>
          <p class="hobby-description">{{ hobby.description }}</p>
        </div>
      </div>
    </section>

    <!-- 构建时间信息 -->
    <footer class="build-info-container">
      <div class="build-info">
        <span
          class="vpi-social-build-16 build-icon"
          style="
            --icon: url('https://api.iconify.design/qlementine-icons/build-16.svg');
          "
        ></span>
        <span class="build-time">本站构建于：{{ buildTime }}</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@reference '../.vitepress/theme/custom.css';

/* 基础动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* 容器与布局 */
.about-container {
  margin-top: calc(var(--vp-nav-height) * -1);
  @apply opacity-0 transition-all duration-500;
}

.about-container.is-visible {
  @apply opacity-100;
}

/* 个人介绍区 */
.hero-section {
  @apply relative mb-20 pt-40 pb-32 px-6;
  background-color: var(--hero-bg-light);
}

.dark .hero-section {
  background-color: var(--hero-bg-dark);
}

.profile-layout {
  @apply flex flex-col md:flex-row md:items-start md:gap-16 max-w-5xl mx-auto;
}

/* 头像样式优化 */
.avatar-wrapper {
  @apply mb-10 md:mb-0 relative size-48;
  animation: floatAnimation 6s ease-in-out infinite;
}

@keyframes floatAnimation {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 添加媒体查询，优化小屏幕下的头像大小和动画 */
@media (max-width: 768px) {
  .avatar-wrapper {
    @apply size-36 mx-auto;
    animation: floatAnimation 6s ease-in-out infinite;
  }

  @keyframes floatAnimation {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    } /* 减小动画幅度 */
  }

  .profile-layout {
    @apply gap-8; /* 减小间距 */
  }
}

.avatar {
  @apply size-full p-4 transition-all duration-500;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.15);
  border: 4px solid rgba(224, 242, 254, 0.3);
}

.dark .avatar {
  border-color: var(--hero-bg-dark);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

/* 个人信息样式优化 */
.profile-info {
  @apply flex flex-col items-center md:items-start space-y-6;
}

.name-title-container {
  @apply text-center md:text-left;
}

.profile-name {
  @apply text-5xl font-bold mb-3 text-transparent bg-clip-text relative;
  background-image: linear-gradient(
    90deg,
    var(--accent-color),
    var(--accent-dark)
  );
}

.profile-name::after {
  content: "";
  @apply absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-700;
  width: 60px;
  border-radius: 2px;
  transform: translateY(8px);
}

.dark .profile-name::after {
  @apply bg-gradient-to-r from-primary-400 to-primary-600;
}

.profile-title {
  @apply text-xl font-medium text-gray-600 mt-6;
}

.dark .profile-title {
  color: var(--text-primary-dark);
}

/* 个人简介样式 */
.bio-container {
  @apply space-y-4 text-center md:text-left max-w-2xl;
}

.profile-brief {
  @apply text-base font-medium text-gray-700;
}

.profile-bio {
  @apply text-base leading-relaxed text-gray-600;
}

.dark .profile-brief,
.dark .profile-bio {
  color: var(--text-secondary-dark);
}

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

/* 内容区块 */
.content-section {
  @apply mb-20 px-4;
}

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

.section-badge {
  @apply inline-block px-3 py-1 text-xs font-medium rounded-full mb-4;
}

.projects-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto;
}

/* 项目卡片现代化设计 */
.project-card {
  @apply rounded-2xl overflow-hidden transition-all duration-500 opacity-0 transform scale-95;
  background-color: var(--card-bg-light);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(224, 242, 254, 0.2);
  height: 100%;
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

/* 爱好卡片 */
.hobbies-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto;
}

.hobby-card {
  @apply rounded-xl overflow-hidden shadow-md p-6
         transition-all duration-500 opacity-0 transform scale-95;
  background-color: var(--card-bg-light);
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
