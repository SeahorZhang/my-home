---
layout: page
title: 关于
---

<script setup>
import { ref } from 'vue'

// 个人基本信息
const personalInfo = {
  name: 'Seahor',
  title: '前端开发工程师',
  bio: '热爱技术 | 开源贡献者 | 生活探索者',
  avatar: '/default.svg',
  socialLinks: [
    { icon: 'github', link: 'https://github.com/seahorseBra', label: 'GitHub' },
    { icon: 'x', link: 'https://twitter.com/seahorseBra', label: 'X' },
  ]
}

// 项目经历
const projects = [
  {
    title: '浏览器首页导航',
    description: '一款高度可定制的浏览器新标签页扩展，支持自定义布局、网站收藏和搜索引擎，为您提供更高效的网络导航体验。',
    link: 'https://chromewebstore.google.com/detail/wtab/diiielhbpbgalhohmfelhgaakdjcmkjl?authuser=0&hl=zh-CN',
    image: '/wtab.png',
    tags: ['Chrome扩展', 'Vue', '前端开发']
  },
  {
    title: '浏览器书签导出',
    description: '便捷的书签管理工具，可一键导出浏览器书签为多种格式，支持云同步和跨浏览器迁移，帮助您整理和备份重要网站收藏。',
    link: 'https://chromewebstore.google.com/detail/pinece-webext/oloddfdfgpipbngfcohnfpgdallhnoep?authuser=0&hl=zh-CN',
    image: '/pinece.png',
    tags: ['Chrome扩展', 'JavaScript', '数据管理']
  },
  {
    title: '多域名cookies同步',
    description: '解决多域名网站登录问题的实用工具，自动同步不同域名之间的Cookie信息，提升用户在相关站点间的无缝体验。',
    link: 'https://chromewebstore.google.com/detail/sync-cookies/hcehoofohgpjngheemopifodkamccbij?authuser=0&hl=zh-CN',
    image: '/Sync Cookies.png',
    tags: ['Chrome扩展', 'Cookie管理', '网络工具']
  }
]

// 生活爱好
const hobbies = [
  { name: '编程', icon: '💻', description: '开发有趣的个人项目和贡献开源' },
  { name: '游戏', icon: '🎮', description: '探索沉浸式游戏世界，尤其喜欢开放世界和战略类游戏' },
  { name: '电影', icon: '🎬', description: '欣赏不同类型的电影，偏爱科幻和悬疑题材' },
  { name: '智能家居', icon: '🏠', description: '打造自动化家居环境，研究IoT设备和自动化场景' },
]

// 动画效果控制
const isVisible = ref(false)
setTimeout(() => {
  isVisible.value = true
}, 100)
</script>

<!-- 使用自定义CSS类的页面 -->
<div class="about-container" :class="{ 'show': isVisible }">
  
  <!-- 顶部个人介绍部分 -->
  <section class="section">
    <div class="hero">
      <div class="flex flex-col items-center md:flex-row md:text-left md:gap-12 max-w-5xl mx-auto">
        <div class="mb-8 md:mb-0">
          <img :src="personalInfo.avatar" alt="个人头像" class="avatar" />
        </div>
        <div>
          <h1 class="title">{{ personalInfo.name }}</h1>
          <h2 class="subtitle">{{ personalInfo.title }}</h2>
          <p class="bio">{{ personalInfo.bio }}</p>
          <div class="social">
            <a v-for="(link, index) in personalInfo.socialLinks" 
               :key="index" 
               :href="link.link" 
               target="_blank" 
               :title="link.label"
               class="social-item">
              <span :class="`vpi-social-${link.icon}`" 
                :style="{'--icon':` url('https://api.iconify.design/simple-icons/${link.icon}.svg')`}"
                class="text-lg"></span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- 关于我的自述部分 -->
  <section class="section">
    <div class="section-header">
      <h2 class="section-title">关于我</h2>
      <div class="section-line"></div>
    </div>
    <div class="content">
      <p class="mb-4">👋 你好！我是一名充满热情的技术爱好者和创造者。我坚信技术能力不该仅限于职场，并致力于探索独立开发者的自由之路。</p>
    </div>
  </section>

  <!-- 项目展示部分 -->
  <section class="section">
    <div class="section-header">
      <h2 class="section-title">项目经历</h2>
      <div class="section-line"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <div v-for="(project, index) in projects" 
           :key="index" 
           class="card project-card"
           :style="{ animationDelay: `${index * 100}ms` }">
        <div class="card-image">
          <img :src="project.image" :alt="project.title" class="image" />
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ project.title }}</h3>
          <p class="card-text">{{ project.description }}</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <span v-for="(tag, tagIndex) in project.tags" 
                  :key="tagIndex" 
                  class="tag">
              {{ tag }}
            </span>
          </div>
          <a :href="project.link" class="link" target="_blank">查看项目 →</a>
        </div>
      </div>
    </div>
  </section>

  <!-- 生活爱好部分 -->
  <section class="section">
    <div class="section-header">
      <h2 class="section-title">生活爱好</h2>
      <div class="section-line"></div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      <div v-for="(hobby, index) in hobbies" 
           :key="index" 
           class="card hobby-card">
        <div class="text-4xl mb-4">{{ hobby.icon }}</div>
        <h3 class="card-title">{{ hobby.name }}</h3>
        <p class="card-text">{{ hobby.description }}</p>
      </div>
    </div>
  </section>
</div>

<style>
@reference "../.vitepress/theme/custom.css";

/* 基础动画 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 容器 */
.about-container {
  @apply opacity-0 translate-y-5 transition-all duration-600 ease-in-out;
}

.about-container.show {
  @apply opacity-100 translate-y-0;
}

/* 通用布局 */
.section {
  @apply mb-16 p-4;
}

.section-header {
  @apply text-center mb-8;
}

.section-title {
  @apply text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2 inline-block;
}

.section-line {
  @apply h-1 w-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded mx-auto;
}

.content {
  @apply text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-3xl mx-auto;
}

/* 卡片组件 */
.card {
  @apply bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl;
}

.card-image {
  @apply h-44 overflow-hidden;
}

.image {
  @apply w-full h-full object-cover transition-transform duration-500 hover:scale-105;
}

.card-body {
  @apply p-6;
}

.card-title {
  @apply text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3;
}

.card-text {
  @apply text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3;
}

/* 英雄区 */
.hero {
  @apply p-12 bg-gradient-to-r from-primary-50/5 to-primary-50/10 dark:from-primary-900/5 dark:to-primary-900/10 rounded-2xl mb-12;
}

.avatar {
  @apply w-44 h-44 rounded-full border-5 border-primary-500/20 object-cover shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl;
}

.title {
  @apply text-4xl font-bold mb-2 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent;
}

.subtitle {
  @apply text-xl font-medium text-gray-600 dark:text-gray-400 mb-4;
}

.bio {
  @apply text-lg text-gray-600 dark:text-gray-400 mb-6;
}

/* 社交链接 */
.social {
  @apply flex gap-4 justify-center md:justify-start;
}

.social-item {
  @apply flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:bg-primary-500 hover:text-white hover:-translate-y-1 hover:shadow-md;
}

/* 项目卡片 */
.project-card {
  @apply opacity-0;
  animation: fadeInUp 0.5s ease forwards;
  animation-fill-mode: forwards;
}

.tag {
  @apply text-xs px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300;
}

.link {
  @apply inline-block text-primary-600 dark:text-primary-400 font-medium text-sm transition-transform hover:translate-x-1;
}

/* 爱好卡片 */
.hobby-card {
  @apply p-6 text-center;
}
</style>
