<script setup lang="ts">
import { defineProps, computed } from 'vue'
import data from './data'
import { withBase } from 'vitepress'

const props = defineProps<{
  /** 图标 */
  icon?: string | { svg: string }
  /** 名称 */
  text: string
  /** 描述 */
  desc?: string
  /** 链接 */
  links?: string[]
  tag?: string[]
}>()

const svg = computed(() => {
  if (typeof props.icon === 'object') return props.icon.svg
  return ''
})
</script>


<template>

  <template v-for="({ text, items }, i) in data" :key="i">
    <h3 style="margin-bottom: 12px"> {{ text }} </h3>
    <div class="grid">
      <a v-for="(item, j) in items" :key="j" class="grid__item" :href="item.link" target="_blank">
        <div class="header">
          <img v-if="item.icon" width="32px" height="32px" :src="withBase('/img/toolSoftware' + item.icon)" />
          <span>{{ item.text }}</span>
        </div>
        <p class="desc" :title="item.desc"> {{ item.desc }} </p>
        <div class="tag">
          <Badge v-for="tag in item.tags" :key="tag" :type="tag.type" :text="tag.text" />
        </div>
      </a>
    </div>
  </template>
</template>

<style scoped>
.grid {
  --m-nav-gap: 10px;
  display: grid;
  grid-row-gap: var(--m-nav-gap);
  grid-column-gap: var(--m-nav-gap);
  grid-auto-flow: row dense;
  justify-content: center;
  margin-top: var(--m-nav-gap);
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.grid__item {
  display: block;
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 8px;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s;
  padding: 16px;
  display: flex;
  flex-direction: column;

  &:hover {
    background-color: var(--vp-c-bg-soft);
  }
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  height: 32px;
  color: var(--vp-c-text-1);
}


.header img {
  margin-right: 10px;
}

.desc {
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin: 0;
  line-height: 20px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.tag {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 10px;
}

.tag>* {
  margin: 0 4px 4px 0;
}

/* 
.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  border-radius: 6px;
  width: 48px;
  height: 48px;
  font-size: 24px;
  background-color: var(--vp-c-mute);
  transition: background-color 0.25s;

  :deep(svg) {
    width: 24px;
    fill: currentColor;
  }

  :deep(img) {
    border-radius: 4px;
    width: 24px;
  }
}

.title {
  overflow: hidden;
  flex-grow: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 48px;
  font-size: 16px;
  font-weight: 600;
}

.desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
  margin: 10px 0 0;
  line-height: 20px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

@media (max-width: 960px) {
  .m-nav-link {
    .box {
      padding: 8px;
    }

    .icon {
      width: 40px;
      height: 40px;
    }

    .title {
      line-height: 40px;
      font-size: 14px;
    }
  }
} */
</style>