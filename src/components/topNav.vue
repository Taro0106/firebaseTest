<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
const recentItems = ref([])
const currentUser = ref(null)
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})
</script>

<template>
    <nav class="top-nav">
      <div class="nav-left">
        <img src="../pic/logo2.png" class="mini-logo" alt="Logo">
        <template v-if="currentUser">
          <div class="user-info">
            <img :src="currentUser.photoURL" class="nav-avatar">
            <span class="nav-name">{{ currentUser.displayName }}</span>
          </div>
          <router-link to="/Myhome/List" class="nav-item">我的收藏庫</router-link>
          <router-link to="/Home" class="nav-item active">全站收藏</router-link>
        </template>
      </div>
    </nav>

    
</template>

<style scoped>
/* 導覽列 */
.top-nav {
  padding: 15px 5%;
  display: flex;
  align-items: center;
  position: fixed;
  width: 100%;
  z-index: 100;
  height: 40px;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;
  
  /* 🌟 核心設計：半透明毛玻璃膠囊 */
  background: rgba(255, 255, 255, 0.6); /* 半透明白 */
  padding: 8px 20px;
  border-radius: 50px; /* 圓角膠囊形狀 */
  
  /* 細緻的邊框與陰影 */
  border: 1px solid rgba(255, 121, 159, 0.2); /* 淡淡的粉色邊框 */
  box-shadow: 0 4px 15px rgba(255, 182, 203, 0.15);
  
  /* 毛玻璃效果 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  /* 讓導覽列在滑動時有輕微的浮動感 */
  transition: all 0.3s ease;
}

/* 滑鼠滑入時的細微變化 */
.nav-left:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(255, 182, 203, 0.25);
  transform: translateY(-1px);
}

/* 內部的使用者資訊區塊 */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 15px;
  border-right: 1px solid rgba(255, 121, 159, 0.2); /* 分隔線 */
}

/* 調整名字樣式 */
.nav-name {
  font-weight: 600;
  color: #ff799f; /* 標牌粉色 */
  font-size: 0.9rem;
}

/* 導覽連結的樣式優化 */
.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.2s;
}

.nav-item:hover {
  color: #ff799f;
  background: rgba(255, 121, 159, 0.05);
}

.nav-item.active {
  color: white;
  background: #ff799f; /* 選中時的實色背景 */
}
.mini-logo { height: 30px; }
.nav-avatar { width: 32px; height: 32px; border-radius: 50%; }

</style>