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
  localIcon: {
    type: String,
    default: "",
  },
  // 应用网站 URL
  appUrl: {
    type: String,
    default: "",
  },
});

const iconUrl = ref("");

// 如果有本地图标路径，优先使用
function loadLocalIcon() {
  if (!props.localIcon) return false;
  try {
    iconUrl.value = withBase("/img/toolSoftware" + props.localIcon);
    return true;
  } catch {
    return false;
  }
}

// 处理图标加载错误的情况
const getIcon = () => {
  try {
    const domain = new URL(props.appUrl).hostname;
    // 使用 icon.horse 服务获取图标
    // iconUrl.value = `https://icon.horse/icon/${domain}`;
    iconUrl.value = `https://logo.clearbit.com/${domain}`;
  } catch (e) {
    // 如果URL解析失败，使用默认图标
    iconUrl.value = defaultIcon;
  }
};

const handleIconError = () => {
  iconUrl.value = defaultIcon;
};

// 首先尝试加载本地图标
const hasLocalIcon = loadLocalIcon();

if (!hasLocalIcon) {
  if (props.appUrl) {
    getIcon();
  } else {
    handleIconError();
  }
}
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
