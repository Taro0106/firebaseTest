<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const brandName = ref(' Favory')
const navLinks = ref([
  { name: '首頁', path: '/' },
  { name: '漫畫收藏', path: '/about' }
])
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <RouterLink to="/" class="brand-group">
        <img src="@/assets/logo.svg" alt="Logo" class="logo-img" />
        <span class="brand-name">{{ brandName }}</span>
      </RouterLink>

      <ul class="nav-menu">
        <li v-for="link in navLinks" :key="link.name">
          <RouterLink :to="link.path" class="nav-item">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
/* 導覽列主體 */
.navbar {
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* 增加陰影質感 */
  padding: 0.8rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* 內容容器 */
.container {
  margin: 0 auto;
  padding: 0 50px;
  display: flex;
  justify-content: space-between; /* 關鍵：讓左右兩大塊分開 */
  align-items: center;
}

/* --- 左側區域 --- */
.brand-group {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none; /* 移除 RouterLink 預設底線 */
}

.logo-img {
  width: 35px;
  height: 35px;
  object-fit: contain;
}

.brand-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

/* --- 右側區域 --- */
.nav-menu {
  display: flex;
  list-style: none;
  gap: 1.5rem; /* 分頁之間的間距 */
  margin: 0;
  padding: 0;
}

.nav-item {
  text-decoration: none;
  color: #606266; /* 預設文字顏色 */
  font-weight: 500;
  font-size: 1rem;
  padding: 8px 4px;
  transition: all 0.3s ease;
  position: relative;
}

/* 滑鼠懸停效果 */
.nav-item:hover {
  color: #42b883;
}

/* 當前所在頁面的樣式 (Vue Router 自動添加) */
.router-link-active {
  color: #42b883 !important;
  font-weight: 600;
}


/* 響應式微調：手機版時縮小間距 */
@media (max-width: 768px) {
  .nav-menu {
    gap: 1rem;
  }
  .brand-name {
    font-size: 1.1rem;
  }
}
</style>