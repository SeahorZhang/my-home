<script setup>
import DefaultTheme from "vitepress/theme";
const { Layout } = DefaultTheme;
import SnowfallBgaa from "./SnowfallBg.vue";
import TextGenerateEffect from "./TextGenerateEffect.vue";
</script>

<template>
  <Layout>
    <template #home-hero-before>
      <SnowfallBgaa
        color="ADD8E6"
        class="absolute inset-0 -z-10"
        :min-radius="0.2"
        :max-radius="5"
        :speed="0.5"
      />
      <div
        class="flex justify-center items-center pb-72 flex-col h-screen overflow-hidden absolute top-0 left-0 right-0 bottom-0"
      >
        <TextGenerateEffect
          class="text-5xl font-medium"
          words="记录开发程序和日常使用软件"
        />
        <TextGenerateEffect
          class="text-2xl pt-5"
          words="白天社畜打工人&nbsp;&nbsp;晚上独立开发者"
        />
      </div>
    </template>
  </Layout>
</template>
