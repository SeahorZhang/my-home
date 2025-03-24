<script setup>
import Avatar from "./common/Avatar.vue";
import SocialLinks from "./common/SocialLinks.vue";

const props = defineProps({
  personalInfo: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <section class="hero-section">
    <!-- 预加载头像图片 -->
    <link rel="preload" :href="personalInfo.avatar" as="image" />
    
    <div class="profile-layout">
      <Avatar
        :src="personalInfo.avatar"
        :alt="personalInfo.name + '的头像'"
        animated
      />
      <div class="profile-info">
        <div class="name-title-container">
          <h1 class="profile-name">{{ personalInfo.name }}</h1>
          <h2 class="profile-title">{{ personalInfo.title }}</h2>
        </div>
        <div class="bio-container">
          <p class="profile-bio">
            👋 你好！我是一名充满热情的技术爱好者和创造者。
            我坚信技术能力不该仅限于职场，并致力于探索独立开发者的自由之路。
          </p>
        </div>
        
        <!-- 使用提取的社交链接组件 -->
        <SocialLinks :links="personalInfo.socialLinks" />
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference '../custom.css';
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

/* 个人信息样式优化 */
.profile-info {
  @apply flex flex-col items-center md:items-start space-y-6;
}

.name-title-container {
  @apply text-center md:text-left;
}

.profile-name {
  @apply text-4xl font-bold text-gray-800 mb-2 relative inline-block;
}

.dark .profile-name {
  color: var(--text-primary-dark);
}

.profile-title {
  @apply text-xl text-gray-600 font-medium;
}

.dark .profile-title {
  color: var(--text-secondary-dark);
}

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
</style>
