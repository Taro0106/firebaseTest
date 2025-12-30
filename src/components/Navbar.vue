<script setup>
import { ref, computed } from 'vue'

// --- 預留使用者資料 ---
const user = ref({
  name: '未登入',
  avatar: 'https://cdn-icons-png.flaticon.com/512/3682/3682281.png' // 預設可愛頭像
})

// --- 模擬分類清單 (之後會從 Firestore 動態抓取) ---
const categories = ref(['漫畫', '動漫', '輕小說', '畫集'])

// 控制手機版分類彈窗
const isCategoryModalOpen = ref(false)

const toggleCategoryModal = () => {
  isCategoryModalOpen.value = !isCategoryModalOpen.value
}
</script>

<template>
  <nav class="navbar-container">
    <aside class="sidebar-desktop">
      <div class="brand">
        <img src="../pic/logo2.png" alt="Favory Logo" class="brand-logo">
        <h1 class="brand-name">Favory</h1>
      </div>

      <div class="user-profile">
        <img :src="user.avatar" alt="avatar" class="avatar">
        <span class="user-name">{{ user.name }}</span>
      </div>

      <div class="menu-sections">
        <router-link to="/List" class="nav-link">
          <span class="icon">📚</span> 全部收藏
        </router-link>

        <div class="divider"></div>

        <div class="category-section">
          <p class="section-label">我的分類</p>
          <div class="category-list">
            <router-link 
              v-for="cat in categories" 
              :key="cat" 
              :to="`/category/${cat}`" 
              class="category-item"
            >
              # {{ cat }}
            </router-link>
          </div>
        </div>
      </div>
    </aside>

    <div class="bottom-nav-mobile">
      <router-link to="/" class="mobile-nav-item">
        <span class="icon">📚</span>
        <span class="label">全部</span>
      </router-link>

      <button @click="toggleCategoryModal" class="mobile-nav-item btn-reset">
        <span class="icon">🏷️</span>
        <span class="label">分類</span>
      </button>

      <router-link to="/profile" class="mobile-nav-item">
        <img :src="user.avatar" class="mini-avatar">
        <span class="label">帳號</span>
      </router-link>
    </div>

    <Transition name="fade">
      <div v-if="isCategoryModalOpen" class="mobile-modal-overlay" @click="toggleCategoryModal">
        <div class="mobile-modal-content" @click.stop>
          <h3>選擇分類</h3>
          <div class="mobile-category-grid">
            <router-link 
              v-for="cat in categories" 
              :key="cat" 
              :to="`/category/${cat}`" 
              class="m-cat-item"
              @click="isCategoryModalOpen = false"
            >
              {{ cat }}
            </router-link>
          </div>
          <button class="close-btn" @click="toggleCategoryModal">關閉</button>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<style scoped>
/* --- 基礎變數與重置 --- */
.navbar-container { font-family: 'Noto Sans TC', sans-serif; }
.btn-reset { background: none; border: none; cursor: pointer; color: inherit; }

/* --- 電腦版側邊欄樣式 --- */
.sidebar-desktop {
  width: 260px;
  height: 100vh;
  position: relative;
  left: 0;
  top: 0;
  background: white;
  border-right: 2px solid #ffe4e1;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  z-index: 1000;
}

.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; justify-content: center; }
.brand-logo {
  width: 40px;      /* 根據你的 logo 比例調整寬度 */
  height: auto;     /* 保持比例 */
  object-fit: contain;
}

/* 如果是手機版，logo 區塊通常會隱藏或縮小 */
@media (max-width: 768px) {
  .brand-logo {
    display: none;  /* 手機版底部導覽通常不放 logo */
  }
}
.brand-name { font-size: 22px; color: #ff82ab; margin: 0; }

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
  padding: 20px;
  background: #fff5f7;
  border-radius: 20px;
}
.avatar { width: 60px; height: 60px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(255, 182, 193, 0.3); }
.user-name { color: #5d4037; font-weight: bold; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  text-decoration: none;
  color: #5d4037;
  border-radius: 15px;
  transition: 0.3s;
  font-weight: 500;
}
.nav-link:hover, .router-link-active { background: #fff0f5; color: #ff69b4; }

.divider { height: 2px; background: #fff0f5; margin: 20px 0; }

.section-label { font-size: 13px; color: #ffb6c1; font-weight: bold; margin-bottom: 15px; padding-left: 10px; }
.category-list { display: flex; flex-direction: column; gap: 8px; }
.category-item {
  padding: 10px 15px;
  text-decoration: none;
  color: #888;
  font-size: 15px;
  border-radius: 10px;
  transition: 0.2s;
}
.category-item:hover { color: #ff82ab; background: #fffafa; padding-left: 20px; }

/* --- 手機版底部導覽 --- */
.bottom-nav-mobile { display: none; }

@media (max-width: 768px) {
  .sidebar-desktop { display: none; }
  .bottom-nav-mobile {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 70px;
    background: white;
    border-top: 2px solid #ffe4e1;
    justify-content: space-around;
    align-items: center;
    z-index: 2000;
    padding-bottom: env(safe-area-inset-bottom); /* 適應 iPhone 底部橫條 */
  }
  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-decoration: none;
    color: #888;
    font-size: 12px;
    gap: 4px;
  }
  .mobile-nav-item.router-link-active { color: #ff69b4; font-weight: bold; }
  .mini-avatar { width: 24px; height: 24px; border-radius: 50%; }
  .icon { font-size: 20px; }
}

/* --- 手機版彈窗樣式 --- */
.mobile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end; /* 從底部彈出 */
  z-index: 3000;
}
.mobile-modal-content {
  width: 100%;
  background: white;
  border-radius: 30px 30px 0 0;
  padding: 30px;
  max-height: 70vh;
  overflow-y: auto;
}
.mobile-category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}
.m-cat-item {
  background: #fff5f7;
  padding: 15px;
  text-align: center;
  border-radius: 15px;
  color: #ff82ab;
  text-decoration: none;
  font-weight: bold;
}
.close-btn { width: 100%; padding: 12px; background: #eee; border: none; border-radius: 15px; margin-top: 10px; }

/* 動畫 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>