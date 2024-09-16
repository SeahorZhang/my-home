<script setup lang="ts">

</script>

<template>
  <div class="wtab">
    <img class="logo" src="/public/cat.svg" width="150" height="150" alt="logo">
    <p class="title">WTab，组件视界</p>
    <p class="text">只需联网加载一次，后续即可离线使用。所有数据均存在本地，你的数据你掌控！</p>
    <button class="btn">
      <a type="button" href="https://wtab.cn/" target="_blank">去体验</a>
    </button>
  </div>
</template>

<style scoped>
.wtab {
  background-color: #8399F6;
  height: 100vh;
  text-align: center;
  overflow: hidden;
}

.logo {
  margin: 40px auto 0;
}

.title {
  font-size: 64px;
  font-weight: 700;
  color: #fff;
  margin-top: 40px;
  line-height: 1;
}

.text {
  max-width: 700px;
  font-size: 22px;
  color: #777474;
  margin: 50px auto 0 auto;
  line-height: 1.3;
  color: #fff;
}

.wtab .btn {
  color: #fff;
  background-color: #4861f0;
  border-radius: 10px;
  overflow: hidden;
  font-size: 16px;
  transition: background-color 0.2s;
  margin-top: 20px;
}

.wtab .btn a {
  padding: 10px 20px;
  display: block;
}

.wtab .btn:hover {
  background-color: #a1b0ff;
}
</style>