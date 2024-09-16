<script setup lang="ts">
import data from "./data";
import { withBase } from "vitepress";
</script>

<template>
  <template v-for="({ text, items }, i) in data" :key="i">
    <h3 style="margin-bottom: 12px">{{ text }}</h3>
    <div class="grid">
      <a
        v-for="(item, j) in items"
        :key="j"
        class="grid__item"
        :href="item.link"
        target="_blank"
      >
        <div class="header">
          <img
            v-if="item.icon"
            :src="withBase('/img/toolSoftware' + item.icon)"
          />
          <span>{{ item.text }}</span>
        </div>
        <p class="desc" :title="item.desc">{{ item.desc }}</p>
        <div class="tag">
          <Badge
            v-for="tag in item.tags"
            :key="tag"
            :type="tag.type"
            :text="tag.text"
          />
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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
  height: 32px;
  width: 32px;
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

.tag > * {
  margin: 0 4px 4px 0;
}
</style>
