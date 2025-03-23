<script setup>
import { ref } from "vue";
import { withBase } from "vitepress";
const defaultIcon = withBase("/default.svg");

const props = defineProps({
  // 应用名称
  appName: {
    type: String,
    required: true,
  },
  // 本地图标路径 (如 /chrome.png)
  icon: {
    type: String,
    default: "",
  },
});

const iconUrl = ref("");

// 如果有本地图标路径，优先使用
function loadLocalIcon() {
  if (!props.icon) return handleIconError();
  try {
    iconUrl.value = withBase("./icons/" + props.icon);
  } catch {
    handleIconError();
  }
}

const handleIconError = () => {
  iconUrl.value = defaultIcon;
};

loadLocalIcon();
</script>

<template>
  <img
    v-if="iconUrl"
    :src="iconUrl"
    :alt="appName"
    @error="handleIconError"
    class="max-w-full max-h-full object-contain rounded-lg size-8"
  />
</template>
