<script setup>
import overview from "./overview";
import { Link } from "@element-plus/icons-vue";

const props = defineProps({
  name: String,
  // type: String,
  // url: String,
  // fee: Number,
  // links: Array,
  // imgs: Array,
  // path: String,
  // synopsis: String,
});

let data = {};
overview.forEach((item) => {
  item.items.forEach((list) => {
    if (list.text === props.name) {
      return (data = list);
    }
  });
});
</script>

<template>
  <h1>
    {{ data.text }}
    <el-tag
      v-for="(item,i) in data.tag"
      :key="i"
      style="vertical-align: middle;margin-left: 8px;"
      effect="dark"
      :type="item.type"
    >
      {{ item.text }}
    </el-tag>
  </h1>

  <p>{{ data.synopsis }}</p>

  <p>
    <a
      v-for="(item, i) in data.links"
      :key="i"
      :href="item.url"
      :target="item.target||'_blank'"
      class="button"
    >
      <el-button type="primary">
        {{ item.type }}
        <el-icon class="el-icon--right"><Link /></el-icon>
      </el-button>
    </a>
  </p>

  <el-image v-for="(item, i) in data.imgs" :key="i" :src="item" />
</template>
<style scoped>
.button + .button {
  margin-left: 12px;
}
</style>
