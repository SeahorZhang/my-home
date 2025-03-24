<script setup>
// 导入配置数据，提高可维护性
import { personalInfo, projects, hobbies } from "./data";
import { ref, onMounted } from "vue";
import SnowfallBg from "./SnowfallBg.vue";
import DefaultTheme from "vitepress/theme";

// 导入组件
import HeroSection from "./components/HeroSection.vue";
import BuildInfo from "./components/BuildInfo.vue";
import ContentSection from "./components/common/ContentSection.vue";
import ProjectCard from "./components/cards/ProjectCard.vue";
import GridContainer from "./components/common/GridContainer.vue";
import HobbyCard from "./components/cards/HobbyCard.vue";

const { Layout } = DefaultTheme;

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
  <Layout>
    <template #home-hero-before>
      <SnowfallBg
        color="ADD8E6"
        class="absolute inset-0 -z-10"
        :min-radius="0.2"
        :max-radius="5"
        :speed="0.5"
      />

      <div
        class="about-container"
        :class="{ 'is-visible': animationState.main }"
      >
        <!-- 使用组件 -->
        <HeroSection :personalInfo="personalInfo" />

        <ContentSection title="开发项目">
          <GridContainer type="projects">
            <ProjectCard
              v-for="(project, index) in projects"
              :key="index"
              :project="project"
              :isVisible="animationState.projects[index]"
            />
          </GridContainer>
        </ContentSection>

        <ContentSection title="生活爱好">
          <GridContainer type="hobbies">
            <HobbyCard
              v-for="(hobby, index) in hobbies"
              :key="index"
              :hobby="hobby"
              :isVisible="animationState.hobbies[index]"
            />
          </GridContainer>
        </ContentSection>

        <BuildInfo :buildTime="buildTime" />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
@reference './custom.css';

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
</style>
