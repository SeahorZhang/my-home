<script setup>
import data from "./overview";
</script>

<template>
  <template v-for="(list, i) in data" :key="i">
    <h3 style="margin-bottom: 12px">{{ list.text }}</h3>
    <div class="grid">
      <a v-for="(item, j) in list.items" :key="j" :href="list.base + item.link">
        <el-card class="card" shadow="hover">
          <h3>{{ item.text }}</h3>
          <el-row justify="center">
            <el-tag class="tag" :type="item.fee ? 'warning' : 'success'">
              {{ item.fee ? "收费" : "免费" }}
            </el-tag>
            <el-tag class="tag">{{ item.type }}</el-tag>
          </el-row>
        </el-card>
      </a>
    </div>
  </template>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.grid a {
  cursor: pointer;
}
.grid a .card {
  height: 100%;
}
.grid a .card h3 {
  text-align: center;
  margin: 0 0 12px;
}

.tag {
  margin: 2px;
}
</style>
