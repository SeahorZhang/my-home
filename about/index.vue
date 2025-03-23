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
        <img :src="personalInfo.avatar" alt="个人头像" class="avatar" />
        <div class="profile-info">
          <h1 class="profile-name">{{ personalInfo.name }}</h1>
          <h2 class="profile-title">{{ personalInfo.title }}</h2>
          <div class="bio-container">
            <p class="profile-brief">{{ personalInfo.bio }}</p>
            <p class="profile-bio">
              👋 你好！我是一名充满热情的技术爱好者和创造者。
              我坚信技术能力不该仅限于职场，并致力于探索独立开发者的自由之路。
            </p>
          </div>
          <div class="flex gap-3">
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
          </div>
        </div>
      </div>
    </section>

    <!-- 项目展示 -->
    <section class="content-section">
      <div class="section-header">
        <h2 class="section-title">项目经历</h2>
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
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ project.title }}</h3>
            <p class="card-description">{{ project.description }}</p>
            <div class="tags-container">
              <span
                v-for="(tag, tagIndex) in project.tags"
                :key="tagIndex"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
            <a :href="project.link" class="card-link" target="_blank">
              查看项目 <span class="arrow">→</span>
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
  @apply opacity-0 transition-all duration-500;
  background-color: var(--content-bg-light);
}

.dark .about-container {
  background-color: var(--content-bg-dark);
}

.about-container.is-visible {
  @apply opacity-100;
}

/* 个人介绍区 */
.hero-section {
  @apply px-4 py-12 mb-16;
  background-color: var(--hero-bg-light);
}

.dark .hero-section {
  background-color: var(--hero-bg-dark);
  box-shadow: var(--shadow-sm-dark);
}

.profile-layout {
  @apply flex flex-col items-center md:flex-row md:items-center md:gap-12 max-w-5xl mx-auto;
}

.avatar {
  @apply p-4 w-44 h-44 rounded-full border-5 border-primary-500/20 object-cover transition-all duration-500;
  box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.1);
}

.avatar:hover {
  @apply transform scale-105;
  box-shadow: 0 15px 30px -10px rgba(14, 165, 233, 0.2);
}

.dark .avatar {
  border-color: rgba(14, 165, 233, 0.1);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}

.profile-info {
  @apply flex flex-col items-center md:items-start;
}

.profile-name {
  @apply text-4xl font-bold mb-2 text-transparent bg-clip-text;
  background-image: linear-gradient(
    90deg,
    var(--accent-color),
    var(--accent-dark)
  );
}

.profile-title {
  @apply text-xl font-medium text-gray-600 mb-3;
}

.dark .profile-title {
  color: var(--text-primary-dark);
}

.bio-container {
  @apply mb-6;
}

.profile-brief,
.profile-bio {
  @apply text-base text-gray-600;
}

.dark .profile-brief,
.dark .profile-bio {
  color: var(--text-secondary-dark);
}

.social-link {
  @apply flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 
         text-gray-700 transition-all duration-300;
}

.dark .social-link {
  @apply bg-gray-800 text-gray-300;
}

.social-link:hover {
  @apply bg-primary-500 text-white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* 内容区块 */
.content-section {
  @apply mb-20 px-4;
}

.section-header {
  @apply text-center mb-12;
}

.section-title {
  @apply text-3xl font-bold text-gray-800 mb-3 inline-block;
}

.dark .section-title {
  color: var(--text-primary-dark);
}

.section-divider {
  @apply h-1 w-20 rounded mx-auto;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-dark));
}

/* 项目卡片 */
.projects-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto;
}

.project-card {
  @apply rounded-xl overflow-hidden shadow-md 
         transition-all duration-500 opacity-0 transform scale-95;
  background-color: var(--card-bg-light);
}

.dark .project-card {
  background-color: var(--card-bg-dark);
  box-shadow: var(--shadow-sm-dark);
}

.project-card.is-visible {
  @apply opacity-100 scale-100;
}

.project-card:hover {
  @apply transform -translate-y-2;
  box-shadow: var(--shadow-md-dark);
}

.dark .project-card:hover {
  box-shadow: var(--shadow-md-dark);
}

.card-image-container {
  @apply h-44 overflow-hidden;
}

.card-image {
  @apply w-full h-full object-cover transition-transform duration-700;
}

.project-card:hover .card-image {
  @apply transform scale-105;
}

.card-content {
  @apply p-6;
}

.card-title {
  @apply text-xl font-semibold text-gray-800 mb-3;
}

.dark .card-title {
  color: var(--text-primary-dark);
}

.card-description {
  @apply text-sm text-gray-600 mb-4 line-clamp-3;
}

.dark .card-description {
  color: var(--text-secondary-dark);
}

.tags-container {
  @apply flex flex-wrap gap-2 mb-5;
}

.tag {
  @apply text-xs px-2 py-1 rounded text-primary-800;
  background-color: rgba(14, 165, 233, 0.1);
}

.dark .tag {
  background-color: rgba(14, 165, 233, 0.1);
  color: #7dd3fc;
}

.card-link {
  @apply inline-flex items-center text-primary-600 font-medium text-sm;
}

.dark .card-link {
  color: #38bdf8; /* 亮蓝色，暗模式下更易辨识 */
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
