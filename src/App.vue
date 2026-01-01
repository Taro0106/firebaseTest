<script setup>
import { computed } from 'vue' // 記得導入 computed
import { RouterView, useRoute } from 'vue-router' // 記得導入 useRoute
import Navbar from './components/Navbar.vue'

const route = useRoute()

// 判斷是否為首頁 (假設你的首頁路徑是 '/')
const isLandingPage = computed(() => route.path === '/')
</script>

<template>
  <div class="app-layout">
    <Navbar v-if="!isLandingPage"/>

    <main :class="isLandingPage ? 'loginpage' : 'main-container'">
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
  overflow-y: auto;
  overflow-x: hidden;
  background-image: url('https://i.pinimg.com/736x/e5/74/98/e574986391e767659f0fe852c8c7ede2.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

/* 登入頁面容器：通常會想要乾乾淨淨，或是全螢幕居中 */
.loginpage {
  flex: 1;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 登入頁可以自訂背景，或是維持空白 */
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

  .main-container {
  margin-bottom: 70px;
}
}
</style>