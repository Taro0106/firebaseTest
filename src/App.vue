<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="app-layout">
    <Navbar />

    <main class="main-container">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex; /* 讓左右並排 */
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 側邊欄容器：實體佔位，不使用 fixed */
.sidebar {
  flex-shrink: 0; /* 防止被擠壓 */
  height: 100vh;
  border-right: 2px solid #ffe4e1;
}

/* 主內容區：自動填滿剩餘空間 */
.main-container {
  flex: 1; /* 這裡不需要 margin-left，它會自動貼在 sidebar 右邊 */
  height: 100vh;
  overflow-y: hidden;
  overflow-x: hidden;
  background-color: #fffafb;
}

/* 手機版適應：改回上下堆疊 */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: 70px; /* 如果手機版 Navbar 在底部，這裡甚至可以設為 0 */
  }
}
</style>