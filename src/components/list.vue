<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase' 
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

const collectionList = ref([]) 
const selectedItem = ref(null) // 儲存當前點選的作品

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const q = query(
        collection(db, "myFavoryList"), 
        where("uid", "==", user.uid), 
        orderBy("createdAt", "desc")
      );
      onSnapshot(q, (querySnapshot) => {
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        collectionList.value = list;
      });
    } else {
      collectionList.value = [];
    }
  });
})

const deleteItem = async (id) => {
  if (confirm('要跟這部作品說掰掰嗎？ 🥺')) {
    await deleteDoc(doc(db, "myFavoryList", id));
    selectedItem.value = null; // 刪除後關閉 Modal
  }
}

// 開啟詳情
const openModal = (item) => {
  selectedItem.value = item;
}

// 關閉詳情
const closeModal = () => {
  selectedItem.value = null;
}
</script>

<template>
  <div class="container">
    <div class="list-grid">
      <div v-for="item in collectionList" :key="item.id" class="item-card" @click="openModal(item)">
        <div class="card-img">
          <img :src="item.image" :alt="item.name">
          <div class="overlay">
            <div class="name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="fade">
      <div v-if="selectedItem" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <button class="close-btn" @click="closeModal">×</button>
          
          <div class="modal-body">
            <div class="modal-img-container">
              <img :src="selectedItem.image" :alt="selectedItem.name">
            </div>
            
            <div class="modal-info">
              <h2 class="detail-name">{{ selectedItem.name }}</h2>
              
              <div class="detail-meta">
                <span class="tag">🏷️ {{ selectedItem.category }}</span>
                <span class="tag status">📍 {{ selectedItem.status }}</span>
              </div>

              <div class="detail-rating">
                <span class="stars">{{ '⭐'.repeat(selectedItem.rating) }}</span>
                <span class="rating-text">({{ selectedItem.rating }}/5)</span>
              </div>

              <div class="detail-comment">
                <h3>評語</h3>
                <p>{{ selectedItem.comment || '這個主人很懶，什麼都沒留下...' }}</p>
              </div>

              <button class="detail-delete-btn" @click="deleteItem(selectedItem.id)">
                🗑️ 移除此收藏
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="collectionList.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <p>還沒有收藏任何作品呢～</p>
    </div>
  </div>
</template>

<style scoped>
* { box-sizing: border-box; }

.container {
  max-width: 95%; /* 稍微加寬，讓一排三個不擁擠 */
  margin: 0 auto;
  padding: 20px 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 2. 強制一排三個 (Grid 調整) */
.list-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)); /* 永遠至少三格 */
  gap: 12px;
}

.main-title {
  text-align: center;
  background: linear-gradient(135deg, #ff6b9d 0%, #c06c84 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 50px;
  letter-spacing: 2px;
}

.heart {
  display: inline-block;
  animation: heartbeat 1.5s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  50% { transform: scale(1); }
}

.item-card {
  position: relative;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(255, 107, 157, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
}

.item-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 40px rgba(255, 107, 157, 0.25);
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  color: #ff6b9d;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.3s ease;
}

.item-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #ff6b9d;
  color: white;
  transform: scale(1.1) rotate(90deg);
}

.card-img {
  position: relative;
  width: 100%;
  padding-top: 140%;
  overflow: hidden;
}

.card-img img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-card:hover .card-img img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
  padding: 20px 15px 10px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  
}

.item-card:hover .overlay {
  transform: translateY(0);
}

.name {
  color: white;
  font-weight: 700;
  font-size: 15px;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  line-height: 1.3;
  overflow: hidden;        /* 超過寬度隱藏 */
  text-overflow: ellipsis; /* 顯示 ... */
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #c06c84;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 18px;
  font-weight: 600;
}

/* --- 電腦版 RWD 調整 --- */
@media (min-width: 768px) {
  .container {
    padding: 40px;
  }
  
  .list-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); /* 大螢幕可自動增格 */
    gap: 25px;
  }

  .item-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }

  .name {
    font-size: 14px;
  }

  .stars {
    font-size: 10px;
  }
}

/* --- Modal 樣式 --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 20px;
}
/* --- Modal 核心滾動修正 --- */
.modal-content {
  background: white;
  width: 100%;
  max-width: 800px;
  max-height: 90vh; /* 限制 Modal 最大高度 */
  border-radius: 20px;
  position: relative;
  /* 移除 overflow: hidden 讓裡面可以滾動 */
  display: flex;
  flex-direction: column;
  animation: modalUp 0.3s ease-out;
  padding: 20px;
}

.modal-body {
  flex: 1; /* 佔滿 content 剩餘空間 */
  display: flex;
  flex-direction: column; /* 手機版預設：上下排列 */
  
  /* 關鍵修正：讓 body 區域產生滾動條 */
  overflow-y: auto; 
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch; /* 手機滑動加速 */
}

.modal-img-container {
  width: 90%;
  flex-shrink: 0; /* 防止圖片被壓縮 */
  margin: 0px auto; /* 關鍵 2：上下留點間距，左右自動置中 */
  background: #f9f9f9;
  border-radius: 20px;

}

.modal-img-container img {
  width: 100%;
  height: auto;
  display: block; /* 移除圖片下方間隙 */
  object-fit: contain;
  border-radius: 20px;

}

.modal-info {
  padding: 0px 10px 5px 10px;
  width: 100%;
  /* 手機版不要讓 info 自己滾動，讓整個 body 滾動就好 */
}

.detail-name {
  font-size: 1.8rem;
  color: #5d4037;
  margin-bottom: 15px;
  /* 換行處理 */
  inline-size: 100%;       /* 確保佔滿寬度 */
  overflow-wrap: break-word; /* 遇到超長連續字元（如英文）強制斷行 */
  word-break: break-all;     /* 針對亞洲文字與英文混合的優化 */
  line-height: 1.3;
}

.detail-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tag {
  background: #fff0f5;
  color: #ff82ab;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
}

.detail-rating {
  margin-bottom: 25px;
  font-size: 1.2rem;
}

.rating-text {
  font-size: 14px;
  color: #999;
  margin-left: 8px;
}

.detail-comment {
  background: #fffafb;
  padding: 10px;
  border-radius: 15px;
  border-left: 4px solid #ffb6c1;
  margin-bottom: 30px;
  /* 寬度超過隱藏（通常建議顯示省略號，否則使用者不知道後面還有字） */
  width: 100%;
  white-space: nowrap;     /* 強制不換行 */
  overflow: hidden;        /* 超過寬度隱藏 */
  text-overflow: ellipsis; /* 顯示 ... */
}

.detail-comment h3 {
  font-size: 16px;
  color: #ff82ab;
  margin-bottom: 5px;
  margin-top: 0px;
}

.detail-comment p {
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap; /* 保持換行 */
  margin-top: 0px;
  /* 換行處理 */
  inline-size: 100%;       /* 確保佔滿寬度 */
  overflow-wrap: break-word; /* 遇到超長連續字元（如英文）強制斷行 */
  word-break: break-all;     /* 針對亞洲文字與英文混合的優化 */
  line-height: 1.3;
}

.detail-delete-btn {
  width: 100%;
  padding: 12px;
  background: #fff0f5;
  color: #ff6b9d;
  border: 1px solid #ffb6c1;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
}

.detail-delete-btn:hover {
  background: #ff6b9d;
  color: white;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: white;
  border: none;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* --- 電腦版 RWD 修正 --- */
@media (min-width: 768px) {
  .modal-content {
    height: 600px;
    max-width: 900px; /* 稍微加寬一點，讓左右都有呼吸空間 */
    width: 90%; 
  }

  .modal-body {
    flex-direction: row; 
    align-items: stretch; /* 確保左右兩條一樣高 */
    overflow: hidden;
    border-radius: 20px;

  }

  /* 左側圖片區：寬度固定，不被壓縮 */
  .modal-img-container {
    width: 45%; /* 固定佔比 45% */
    flex-shrink: 0; /* 關鍵：強制不被擠壓 */
    height: 100%;
    margin: 0; 
    background: #fdfdfd; /* 淡淡的底色 */
    display: flex;
    align-items: center; /* 垂直置中 */
    justify-content: center; /* 水平置中 */
    padding: 20px; /* 給圖片一點留白，才不會貼邊 */
  }

  .modal-img-container img {
    width: auto;
    height: auto;
    max-width: 100%; /* 寬度不超過容器 */
    max-height: 100%; /* 高度不超過容器 */
    object-fit: contain; /* 確保比例正確且完整顯示 */
    border-radius: 20px; /* 圖片加點小圓角更精緻 */
    box-shadow: 0 4px 15px rgba(0,0,0,0.05); /* 輕微陰影 */
  }

  /* 右側資訊區：寬度固定，獨立滾動 */
  .modal-info {
    width: 55%; /* 固定佔比 55% */
    flex-shrink: 0; /* 關鍵：強制不被擠壓 */
    height: 100%;
    overflow-y: auto; 
    padding: 0px 20px;
    background: white;
  }
}
</style>