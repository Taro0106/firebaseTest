<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'

const topCollectors = ref([])
const loading = ref(true)

const fetchLeaderboard = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "myFavoryList"))
    const items = querySnapshot.docs.map(doc => doc.data())

    // 1. 統計每個使用者的收藏數量
    const userStats = items.reduce((acc, item) => {
      const uid = item.uid || 'anonymous' // 確保有 userId
      if (!acc[uid]) {
        acc[uid] = {
          name: item.uid || '神祕收藏家',
          avatar: item.userAvatar || 'https://i.pinimg.com/474x/ac/df/d8/acdfd8460a47c598dbbc9d1794561595.jpg',
          count: 0
        }
      }
      acc[uid].count++
      return acc
    }, {})

    // 2. 轉換成陣列並排序
    const sortedUsers = Object.values(userStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3) // 只取前三名

    // 3. 重新排列順序： [第二名, 第一名, 第三名] 符合 UI 佈局
    const podiumOrder = []
    if (sortedUsers[1]) podiumOrder.push(sortedUsers[1]) // 銀
    if (sortedUsers[0]) podiumOrder.push(sortedUsers[0]) // 金
    if (sortedUsers[2]) podiumOrder.push(sortedUsers[2]) // 銅
    
    topCollectors.value = podiumOrder
    loading.value = false
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
  }
}

onMounted(() => {
  fetchLeaderboard()
})

// 根據在陣列中的位置判斷它是第幾名（因為我們排過序了）
const getRankClass = (user, index) => {
  if (topCollectors.value.length === 3) {
    return index === 0 ? 'silver' : index === 1 ? 'gold' : 'bronze'
  }
  // 如果人數不足 3 人，邏輯需微調，這裡先假設有 3 人
  return index === 0 ? 'gold' : 'silver'
}

const getRankNumber = (user, index) => {
  if (topCollectors.value.length === 3) {
    return index === 0 ? 2 : index === 1 ? 1 : 3
  }
  return index + 1
}
</script>

<template>
  <section class="podium-section" v-if="!loading">
    <div class="section-header">
      <h2 class="section-title">收藏家名人堂</h2>
      <p class="section-subtitle">向頂尖收藏家致敬 ✨</p>
    </div>

    <div class="podium-container">
      <div 
        v-for="(user, index) in topCollectors" 
        :key="user.name"
        :class="['podium-item', getRankClass(user, index)]"
      >
        <div v-if="getRankClass(user, index) === 'gold'" class="crown">👑</div>
        
        <div class="avatar-wrapper">
          <img :src="user.avatar" class="avatar">
          <div class="rank-badge">{{ getRankNumber(user, index) }}</div>
        </div>
        
        <div class="step">
          <div class="user-info">
            <h4>{{ user.name }}</h4>
            <p>{{ user.count }} 筆收藏</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<style scoped>
.podium-container {
  display: flex;
  align-items: flex-end; /* 🌟 關鍵：讓所有階梯底部對齊 */
  justify-content: center;
  gap: 100px;
  padding-bottom: 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

/* 🌟 主標題：使用你的特徵 text-shadow 與自訂字體 */
.section-title {
  font-size: 2.2rem;
  font-family: 'Varela Round', 'M PLUS Rounded 1c', sans-serif;
  color: #fff;
  margin: 0;
  display: inline-block;
  position: relative;
  z-index: 1;

  /* 延用你的白色邊框效果，但顏色加深一點點增加層次 */
  text-shadow: 
    2px 2px 0 #ff799f,
    -2px -2px 0 #ff799f,
    2px -2px 0 #ff799f,
    -2px 2px 0 #ff799f,
    0px 8px 15px rgba(255, 121, 159, 0.3);
}

/* 🌟 標題下方的裝飾底線 (像筆刷劃過去的感覺) */
.section-title::after {
  content: "";
  position: absolute;
  bottom: 8px;
  left: -10px;
  right: -10px;
  height: 12px;
  background: rgba(255, 182, 203, 0.4);
  z-index: -1;
  border-radius: 10px;
  /* 讓線條兩端不規則，更有手繪感 */
  transform: rotate(-1deg);
}

/* 🌟 副標題：輕盈飄逸 */
.section-subtitle {
  font-size: 1rem;
  color: #ffb6cb;
  margin-top: 15px;
  font-weight: bold;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* 🌟 在副標題兩側加上裝飾小符號 */
.section-subtitle::before,
.section-subtitle::after {
  content: "✦";
  font-size: 1.2rem;
  animation: sparkle 2s infinite ease-in-out;
}

.section-subtitle::after {
  animation-delay: 1s;
}

/* ✨ 星星閃爍動畫 */
@keyframes sparkle {
  0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
}

/* --- 手機版 RWD --- */
@media (max-width: 768px) {
  .section-title {
    font-size: 1.8rem;
  }
  .section-subtitle {
    font-size: 0.9rem;
    letter-spacing: 1px;
  }
}

/* 3. 確保階梯容器有明確的置中邏輯 */
.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;  /* 🌟 核心：確保所有子元素（頭像、階梯）中線對齊 */
  flex: 1;
  max-width: 140px;     /* 與階梯寬度一致 */
}

/* 1. 調整頭像包裝層，確保它是絕對定位的基準點 */
.avatar-wrapper {
  position: relative;
  z-index: 2;
  margin-bottom: -15px; /* 稍微再往下壓一點，立體感更強 */
  display: flex;
  justify-content: center;
  align-items: center;  /* 🌟 確保內容物置中 */
}

.avatar {
  border-radius: 50%;
  object-fit: cover;
  background: white;
  /* 這裡的 width/height 會由你原本的 .gold/.silver/.bronze 覆蓋 */
}

/* 🌟 讓階梯變成容器，把文字推到上方 */
.step {
  width: 200px;         /* 🌟 固定寬度，與 podium-item 搭配 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 25px; /* 🌟 讓文字從階梯頂部往下掉一點，避開重疊的頭像 */
  position: relative;
  border-radius: 20px 20px 0 0;
  box-shadow: 6px 0px 0px 0px rgba(0,0,0,0.05); /* 側邊微陰影 */
}

.user-info {
  text-align: center;
  width: 100%;
  padding: 0 10px;
}

.user-info h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #ffffff; /* 🌟 改成白色，在粉紅底上才亮眼 */
  font-family: 'Varela Round', sans-serif;
  /* 🌟 加上深粉色陰影，讓文字更立體 */
  text-shadow: 1px 1px 2px rgba(180, 50, 80, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-info p {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9); /* 🌟 半透明白 */
  font-weight: bold;
  /* 讓筆數看起來像是一個小標籤 */
  background: rgba(0, 0, 0, 0.1); 
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
}

/* 第一名：金牌階梯 */
.gold .step { height: 160px; background: #ff799f; }
.gold .avatar { width: 110px; height: 110px; border: 4px solid #ea6e91; }
.gold .crown { font-size: 2.5rem; margin-bottom: -10px; animation: float 2s infinite ease-in-out; }

/* 第二名：銀牌階梯 */
.silver .step { height: 120px; background: #ffb6cb; }
.silver .avatar { width: 90px; height: 90px; border: 4px solid #dc9eb0; }

/* 第三名：銅牌階梯 */
.bronze .step { height: 90px; background: #ffe4e1; }
.bronze .avatar { width: 80px; height: 80px; border: 4px solid #e0cac7; }

/* 皇冠飄浮動畫 */
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

/* 2. 徹底修正徽章定位，不干擾父層空間 */
.rank-badge {
  position: absolute;   /* 🌟 改回絕對定位 */
  bottom: 5px;          /* 🌟 距離頭像底部的距離 */
  right: 0px;           /* 🌟 距離頭像右側的距離 */
  
  width: 28px;          /* 稍微加大一點比較好讀 */
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Varela Round', sans-serif;
  font-weight: 900;
  font-size: 1.0rem;
  color: white;
  border: 3px solid white; 
  z-index: 10;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1); /* 加點小陰影 */
}

/* 🥇 第一名：金牌感 */
.gold .rank-badge {
  background: linear-gradient(135deg, #ffce31 0%, #ffad26 100%);
  transform: scale(1.2); /* 第一名稍微大一點 */
  text-shadow: 1px 1px 0px rgba(212, 118, 0, 0.5);
}

/* 🥈 第二名：銀牌感 */
.silver .rank-badge {
  background: linear-gradient(135deg, #e3e3e3 0%, #b5b5b5 100%);
  text-shadow: 1px 1px 0px rgba(100, 100, 100, 0.3);
}

/* 🥉 第三名：銅牌感 */
.bronze .rank-badge {
  background: linear-gradient(135deg, #f5ccb2 0%, #d19a78 100%);
  text-shadow: 1px 1px 0px rgba(139, 69, 19, 0.3);
}

/* 🌟 給第一名的勳章加一個小亮點 (Glossy effect) */
.gold .rank-badge::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
}

@media (max-width: 768px) {
  .podium-container {
    gap: 8px; /* 縮小間距 */
  }

  .podium-item {
    max-width: 100px; /* 手機版上限 */
  }

  .step {
    width: 140px; 
    padding-top: 20px;
    border-radius: 15px 15px 0 0;
  }

  .user-info h4 {
    font-size: 0.9rem; /* 縮小字體防止溢出 */
  }

  .user-info p {
    font-size: 0.7rem;
    padding: 1px 6px;
  }
  
  .rank-badge {
    width: 22px;
    height: 22px;
    font-size: 0.8rem;
    bottom: 5px;
    right: -2px;
  }

  .gold .crown {
    font-size: 1.8rem; /* 皇冠也縮小 */
  }

  .gold .avatar { width: 90px; height: 90px; border: 4px solid #ea6e91; }
  .silver .avatar { width: 80px; height: 80px; border: 4px solid #dc9eb0; }
  .bronze .avatar { width: 70px; height: 70px; border: 4px solid #e0cac7; }
}
</style>