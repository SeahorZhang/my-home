<!-- ---
layout: page
title: Pinece - 浏览器扩展
description: 一个简单而强大的浏览器扩展，帮助你更好地管理和组织标签页
--- -->

<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

  <div class="px-6 py-8 mx-auto max-w-4xl h-screen overflow-hidden">
    <div class="text-center mb-12">
      <img :src="withBase('/img/pinece-logo.png')" alt="Pinece Logo" class="mx-auto mb-6 h-24 w-24"/>
      <h1 class="text-4xl font-bold mb-4">Pinece</h1>
      <p class="text-xl text-[var(--vp-c-text-2)] mb-6">
        一个简单而强大的浏览器扩展，帮助你更好地管理和组织标签页
      </p>
      <div class="flex justify-center gap-4">
        <a 
          href="https://chromewebstore.google.com/detail/pinece-webext/oloddfdfgpipbngfcohnfpgdallhnoep"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-[var(--vp-c-brand)] text-white hover:opacity-90 transition-opacity"
        >
          <span class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </span>
          安装扩展
        </a>
        <a 
          href="https://github.com/pineceweb/pinece"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center px-6 py-3 rounded-lg border border-[var(--vp-c-brand)] text-[var(--vp-c-brand)] hover:bg-[var(--vp-c-brand)] hover:text-white transition-colors"
        >
          <span class="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </span>
          GitHub
        </a>
      </div>
    </div>
    <div class="mb-12">
      <h2 class="text-2xl font-bold mb-6">主要功能</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-6 rounded-lg border border-[var(--vp-c-bg-soft)]">
          <h3 class="text-xl font-semibold mb-3">标签页管理</h3>
          <p class="text-[var(--vp-c-text-2)]">轻松管理和组织您的浏览器标签页，提高工作效率</p>
        </div>
        <div class="p-6 rounded-lg border border-[var(--vp-c-bg-soft)]">
          <h3 class="text-xl font-semibold mb-3">快速搜索</h3>
          <p class="text-[var(--vp-c-text-2)]">快速查找和切换到您需要的标签页</p>
        </div>
        <div class="p-6 rounded-lg border border-[var(--vp-c-bg-soft)]">
          <h3 class="text-xl font-semibold mb-3">标签组</h3>
          <p class="text-[var(--vp-c-text-2)]">创建和管理标签组，更好地组织相关标签页</p>
        </div>
        <div class="p-6 rounded-lg border border-[var(--vp-c-bg-soft)]">
          <h3 class="text-xl font-semibold mb-3">云同步</h3>
          <p class="text-[var(--vp-c-text-2)]">在不同设备间同步您的标签页和设置</p>
        </div>
      </div>
    </div>
  </div>
