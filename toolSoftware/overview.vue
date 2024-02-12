<script setup>
import data from "./overview";
import { withBase } from 'vitepress'

</script>

<template>
  <template v-for="(list, i) in data" :key="i">
    <h3 style="margin-bottom: 12px"> {{ list.text }} </h3>
    <div class="grid">
      <a v-for="(item, j) in list.items" :key="j" class="item" :href="withBase(list.base + item.link)">
        <div class="tip">
          <span>{{ item.type }}</span>
        </div>
        <el-card class="card" shadow="hover">
          <h3>{{ item.text }}</h3>
          <el-row justify="center">
            <el-tag v-for="tag in item.tag" class="tag" :type="tag.type==='tip'?'success':tag.type">
              {{ tag.text}}
            </el-tag>
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

.grid .item{
  position: relative;
}

.grid .item .tip{
  position: absolute;
  top:0;
  right:0;
  font-size: 12px;
  background-color: #409EFF;
  border-radius: 0 4px 0 4px;
  padding:4px 6px;
  color:#fff;
  line-height: 1;
}
.grid .item .tip >span:not(:last-child){
  margin-right: 4px;
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
