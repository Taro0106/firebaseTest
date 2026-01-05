<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import TopNav from '../components/topNav.vue'
import Hero from '../components/homeHero.vue'

const recentItems = ref([])
const currentUser = ref(null)

// 抓取全站最新 5 筆
const fetchRecentItems = async () => {
  const q = query(
    collection(db, "myFavoryList"),
    orderBy("createdAt", "desc")
  )
  const querySnapshot = await getDocs(q)
  recentItems.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
  fetchRecentItems()
})

import Swal from 'sweetalert2'

// 隨機抽取函式
const handleRandomPick = () => {
  const randomIndex = Math.floor(Math.random() * recentItems.value.length);
  selectedPick.value = recentItems.value[randomIndex];
  showGacha.value = true;
};

const showGacha = ref(false); // 控制彈窗顯示
const selectedPick = ref(null); // 存抽到的那筆資料

  
</script>

<template>
<section class="gacha-section">
  <div class="gacha-container" @click="handleRandomPick">
    <div class="gacha-content">
      <span class="gacha-icon">🎁</span>
      <div class="gacha-text">
        <h3>不知道看什麼嗎？</h3>
        <p>點擊抽一張驚喜收藏！</p>
      </div>
    </div>
    <button class="gacha-btn">試試手氣</button>
  </div>
</section>
  <Transition name="fade">
  <div v-if="showGacha" class="modal-overlay" @click.self="showGacha = false">
    <Transition name="pop">
      <div class="gacha-result-card">
        <button class="close-btn" @click="showGacha = false">×</button>
        
        <div class="result-img-wrapper">
          <img :src="selectedPick.image" class="result-img">
          <div class="category-tag"># {{ selectedPick.category }}</div>
        </div>

        <div class="result-info">
          <div class="result-user">
            <img :src="selectedPick.userAvatar" class="mini-avatar">
            <span>{{ selectedPick.userName }} 的分享</span>
          </div>
          <h2 class="result-title">{{ selectedPick.name }}</h2>
          <div class="result-rating">★ {{ selectedPick.rating }}</div>
          <p class="result-comment">{{ selectedPick.comment }}</p>
          
          <div class="result-actions">
            <button class="retry-btn" @click="handleRandomPick">再抽一次</button>
            <button class="go-btn">查看詳情</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</Transition>
</template>


<style scoped>
/* --- Gacha 互動區塊 --- */
.gacha-section {
  width: 90%;
  max-width: 800px; /* 控制不要太寬 */
  margin: 40px auto; /* 與上方 Hero 隔開 */
  padding-bottom: 60px; /* 給底部留點空間 */
}

.gacha-container {
  background: linear-gradient(135deg, #ff799f 0%, #ffb6cb 100%);
  border-radius: 24px;
  padding: 25px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(255, 121, 159, 0.25);
  transition: transform 0.3s ease;
}

.gacha-container:hover {
  transform: translateY(-5px) scale(1.01);
}

.gacha-content {
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
}

.gacha-icon { font-size: 45px; }

.gacha-text h3 { margin: 0; font-size: 1.3rem; }
.gacha-text p { margin: 5px 0 0; opacity: 0.9; font-size: 0.95rem; }

.gacha-btn {
  background: white;
  color: #ff799f;
  border: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: bold;
  font-size: 1rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

/* 關閉按鈕樣式 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  z-index: 100;
}
.close-btn:hover { color: #ff799f; }

/* RWD 調整 */
@media (max-width: 768px) {
  .gacha-container {
    flex-direction: column;
    text-align: center;
    padding: 25px;
  }
  .gacha-content { flex-direction: column; gap: 10px; }
  .gacha-btn { width: 100%; }
}

/* 遮罩背景 */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(255, 182, 203, 0.4);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 抽獎結果卡片 */
.gacha-result-card {
  background: white;
  width: 90%;
  max-width: 90%;
  border-radius: 30px;
  padding: 80px 30px 30px; /* 上方預留給圖片 */
  position: relative;
  box-shadow: 0 20px 60px rgba(255, 121, 159, 0.3);
}

/* 🌟 向上突破的圖片 */
.result-img-wrapper {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.result-img {
  width: 160px;
  height: 220px;
  object-fit: cover;
  border-radius: 20px;
  border: 6px solid white;
  box-shadow: 0 15px 30px rgba(0,0,0,0.2);
}

.category-tag {
  position: absolute;
  bottom: 10px;
  right: -20px;
  background: #ff799f;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  box-shadow: 0 4px 10px rgba(255, 121, 159, 0.3);
}

/* 文字區域 */
.result-info { text-align: center; }
.result-user { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px; opacity: 0.7; font-size: 0.8rem; }
.mini-avatar { width: 20px; height: 20px; border-radius: 50%; }
.result-title { font-size: 1.5rem; color: #333; margin: 10px 0; }
.result-rating { color: #f1c40f; margin-bottom: 15px; }
.result-comment { color: #666; font-size: 0.9rem; line-height: 1.5; margin-bottom: 25px; }

/* 按鈕區 */
.result-actions { display: flex; gap: 10px; }
.retry-btn, .go-btn {
  flex: 1; padding: 12px; border-radius: 15px; border: none; font-weight: bold; cursor: pointer; transition: 0.3s;
}
.retry-btn { background: #f0f0f0; color: #666; }
.go-btn { background: #ff799f; color: white; }
.retry-btn:hover { background: #e0e0e0; }
.go-btn:hover { background: #ff5c8a; transform: translateY(-3px); }

/* --- 動畫 --- */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.pop-enter-active { transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.pop-enter-from { transform: scale(0.5) translateY(100px); opacity: 0; }
</style>