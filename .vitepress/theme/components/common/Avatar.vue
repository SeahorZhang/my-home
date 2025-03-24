<script setup>
defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: '头像'
  },
  size: {
    type: String,
    default: 'default' // 'small', 'default', 'large'
  },
  animated: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div 
    class="avatar-wrapper"
    :class="[
      size === 'small' ? 'size-32 md:size-36' : 
      size === 'large' ? 'size-56 md:size-64' : 
      'size-36 md:size-48',
      { 'animated': animated }
    ]"
  >
    <img :src="src" :alt="alt" class="avatar" />
  </div>
</template>

<style scoped>
@reference '../../custom.css';

/* 头像容器样式 */
.avatar-wrapper {
  @apply relative mx-auto md:mx-0 mb-10 md:mb-0;
}

/* 浮动动画效果 */
.animated {
  animation: floatAnimation 6s ease-in-out infinite;
}

@keyframes floatAnimation {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式小屏幕动画 */
@media (max-width: 768px) {
  .animated {
    animation: floatAnimation 6s ease-in-out infinite;
  }

  @keyframes floatAnimation {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    } /* 减小动画幅度 */
  }
}

/* 头像样式 */
.avatar {
  @apply size-full p-4 transition-all duration-500;
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.15);
  border: 4px solid rgba(224, 242, 254, 0.3);
}

.dark .avatar {
  border-color: var(--hero-bg-dark);
}
</style> 