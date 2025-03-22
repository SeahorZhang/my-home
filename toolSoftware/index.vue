<script setup lang="ts">
import IconComponent from "./IconComponent.vue";
import Props from "./type";

defineProps<{
  data: Props[];
}>();
</script>

<template>
  <template v-for="({ text, items }, i) in data" :key="i">
    <h3 class="mb-3">{{ text }}</h3>
    <div
      class="grid grid-flow-row-dense gap-2.5 justify-center mt-2.5 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]"
    >
      <a
        v-for="(item, j) in items"
        :key="j"
        class="border border-solid border-[var(--vp-c-bg-soft)] rounded-lg h-full cursor-pointer transition-all duration-300 p-4 flex flex-col hover:bg-[var(--vp-c-bg-soft)]"
        :href="item.link"
        target="_blank"
      >
        <div class="flex items-center h-8 text-[var(--vp-c-text-1)] gap-2.5">
          <IconComponent
            :appName="item.text"
            :localIcon="item.icon"
            :appUrl="item.link"
          />
          <div class="flex items-center h-8 text-[var(--vp-c-text-1)]">
            <span>{{ item.text }}</span>
          </div>
        </div>
        <p
          class="flex-1 line-clamp-2 overflow-hidden text-ellipsis m-0 text-xs text-[var(--vp-c-text-2)]"
          :title="item.desc"
        >
          {{ item.desc }}
        </p>
        <div class="flex items-center flex-wrap [&>*]:mr-1 [&>*]:mt-1">
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
