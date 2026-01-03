<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase' // 確保路徑對應你的 firebase.js
import { onAuthStateChanged, signOut } from "firebase/auth"
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
// 關鍵修正：必須引入這些方法
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
const router = useRouter()

// 1. 初始化使用者資料 (預設為未登入狀態)
const user = ref({
  name: '未登入',
  avatar: 'https://cdn-icons-png.flaticon.com/512/3682/3682281.png'
})
const isLoggedIn = ref(false)

// 2. 監聽 Firebase 登入狀態
onMounted(() => {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // 如果有登入，抓取 Google 的資料
      user.value = {
        name: firebaseUser.displayName || '神秘收藏家',
        avatar: firebaseUser.photoURL || 'https://cdn-icons-png.flaticon.com/512/3682/3682281.png'
      }
      // 登入成功後，立刻執行抓取分類
      fetchUserCategories(firebaseUser.uid);
      isLoggedIn.value = true
    } else {
      // 如果沒登入，回到預設狀態
      user.value = {
        name: '未登入',
        avatar: 'https://cdn-icons-png.flaticon.com/512/3682/3682281.png'
      }
      isLoggedIn.value = false
      categories.value = []; // 沒登入就清空
    }
  })
})

const handleLogout = async () => {
  // 1. 先跳出詢問視窗
  const result = await Swal.fire({
    title: '要準備離開了嗎？',
    text: "登出後就需要重新登入才能看到收藏喔！",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ff799f', // 使用你喜歡的粉色
    cancelButtonColor: '#aaa',
    confirmButtonText: '是的，登出',
    cancelButtonText: '再留一下',
    reverseButtons: true, // 將確認按鈕放在右邊
    background: '#fffafb', // 搭配你的網頁背景色
  });

  // 2. 如果使用者點擊「是的，登出」
  if (result.isConfirmed) {
    try {
      await signOut(auth);

      // 3. 顯示登出成功的通知（自動關閉）
      Swal.fire({
        icon: 'success',
        title: '已安全登出',
        text: '期待下次見到你 ✨',
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true
      });

      router.push('/'); // 跳回登入頁
    } catch (error) {
      console.error("登出失敗", error);
      Swal.fire({
        icon: 'error',
        title: '登出時發生錯誤',
        text: '請稍後再試一次 Q_Q',
      });
    }
  }
};

// 分類邏輯保持不變
// 用來存放去重後的分類
const categories = ref([])

// --- 核心邏輯：獲取該使用者的所有分類 ---
const fetchUserCategories = async (uid) => {
  try {
    const q = query(
      collection(db, "myFavoryList"), 
      where("uid", "==", uid)
    );
    
    unsubscribe = onSnapshot(q, (snapshot) => {
    const allCats = [];
    snapshot.forEach((doc) => {
      if (doc.data().category) {
        allCats.push(doc.data().category);
      }
    });
    // 去重
    categories.value = [...new Set(allCats)];
    console.log("分類已即時更新:", categories.value);
  }, (error) => {
    console.error("監聽分類失敗:", error);
  });
    
    // 如果想要確保總是有幾個基本選項，可以這樣寫：
    // const basic = ['漫畫', '動漫'];
    // categories.value = [...new Set([...basic, ...allCats])];
    
  } catch (error) {
    console.error("抓取分類失敗", error);
  }
}
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
      </div>

      <div class="user-profile">
        <img :src="user.avatar" alt="avatar" class="avatar">
        <span class="user-name">{{ user.name }}</span>
        <button v-if="isLoggedIn" @click="handleLogout" class="logout-btn">登出</button>
      </div>

      <div class="divider"></div>

      <div class="menu-sections">
        <router-link to="/Myhome/List" class="nav-link">
          <span class="icon"><i class="fa-regular fa-heart"></i></span> 全部收藏
        </router-link>

        <router-link to="/Myhome/AddFavory" class="nav-link">
          <span class="icon"><i class="fa-solid fa-plus"></i></span> 新增
        </router-link>

        <div class="category-section">
          <p class="section-label">我的分類</p>
          <div class="category-list">
            <router-link 
              v-for="cat in categories" 
              :key="cat" 
              :to="`/Myhome/category/${cat}`" 
              class="category-item"
            >
              # {{ cat }}
            </router-link>
          </div>
        </div>
      </div>
    </aside>

    <div class="bottom-nav-mobile">
      <router-link to="/Myhome/List" class="mobile-nav-item">
        <span class="icon"><i class="fa-regular fa-heart"></i></span>
        <span class="label">全部</span>
      </router-link>

      <router-link to="/Myhome/AddFavory" class="mobile-nav-item">
        <span class="icon"><i class="fa-solid fa-plus"></i></span>
        <span class="label">新增</span>
      </router-link>

      <button @click="toggleCategoryModal" class="mobile-nav-item btn-reset">
        <span class="icon"><i class="fa-solid fa-hashtag"></i></span>
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
              :to="`/Myhome/category/${cat}`" 
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
  position: sticky;
  left: 0;
  top: 0;
  background: white;
  border-right: 2px solid #ffe4e1;
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  z-index: 1000;
  overflow: hidden; /* 防止側邊欄本身出現滾輪 */
}

/* --- 2. 固定區域 (不參與滾動) --- */
.brand, 
.user-profile {
  flex-shrink: 0; /* 絕對不被壓縮 */
  padding: 20px 20px 10px 20px;
}

/* --- 3. 統一滾動區域 --- */
.menu-sections {
  flex: 1;            /* 填滿剩餘空間 */
  overflow-y: auto;   /* 開啟滾動 */
  padding: 0 20px 40px 20px; /* 底部留白，滾動到底部才美 */
  
  /* 隱藏滾動條 */
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.menu-sections::-webkit-scrollbar {
  display: none;
}

/* --- 4. 內部分類區塊 (不需額外滾動) --- */
.category-section {
  margin-top: 10px;
  /* 移除原本的 flex: 1 和 min-height: 0 */
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 移除原本的 overflow-y: auto */
}

/* --- 額外小優化：讓 Divider 更明顯分隔固定區與滾動區 --- */
.divider {
  height: 1px;
  background: #fff0f5;
  margin: 5px 0;
  flex-shrink: 0;
}

/* 如果是手機版，logo 區塊通常會隱藏或縮小 */
@media (max-width: 1024px) {
  .sidebar-desktop {
    width: 180px;
  }
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
  .mobile-nav-item.router-link-active { background: #fff;color: #ff69b4; font-weight: bold; }
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

/* 在你原本的樣式後面加入 */
.logout-btn {
  margin-top: 8px;
  background: none;
  border: 1px solid #ffb6c1;
  color: #ff82ab;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.3s;
}

.logout-btn:hover {
  background: #ffe4e1;
  color: #ff69b4;
}

.mini-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>