<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

// Swiper 相關引入
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const recentItems = ref([])
const currentUser = ref(null)

// 抓取全站最新 5 筆
const fetchRecentItems = async () => {
  const q = query(
    collection(db, "myFavoryList"),
    orderBy("createdAt", "desc"),
    limit(5)
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
</script>

<template>
    <section class="hero-section">
      <swiper
        :modules="[Autoplay, Pagination]"
        :slides-per-view="1"
        :autoplay="{ delay: 5000 }"
        :pagination="{ clickable: true }"
        class="my-swiper"
      >
        <swiper-slide v-for="item in recentItems" :key="item.id">
          <div class="hero-card">
            <div class="creator-tag">
              <img :src="item.userAvatar || 'https://i.pinimg.com/474x/ac/df/d8/acdfd8460a47c598dbbc9d1794561595.jpg'" class="creator-avatar">
              <div class="creator-meta">
                <span class="creator-name">{{ item.uid || '匿名收藏家' }}</span>
                <span class="post-time">{{ new Date(item.createdAt?.toDate()).toLocaleDateString() }}</span>
              </div>
            </div>

            <div class="card-content">
              <div class="left-info">
                <h1 class="item-name">{{ item.name }}</h1>
                <!-- <div class="rating-box">
                  <span class="star-text">★</span>
                  <span class="rating-num">{{ item.rating }}</span>
                </div> -->
                <div class="comment-text">
                  <div class="comment-inner">
                    {{ item.comment || '這名收藏家很懶，什麼都沒留下...' }}
                  </div>
                </div>
              </div>

              <div class="right-img">
                <img :src="item.image" class="floating-img">
                <div class="category-tag"># {{ item.category }}</div>
                <div class="rating-tag">★ {{ item.rating }}</div>
              </div>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </section>
    
</template>

<style scoped>
/* Hero 輪播區 */
.hero-section {
  padding-top: 10px; /* 給圖片突出的空間 */
  width: 90%;
  margin: 0px auto;
}

/* 3. 調整長方形本體 */
.hero-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #ff799f;
  border-radius: 20px;
  width: 95%;           /* 佔滿 slide 寬度 */
  height: 300px;         /* 長方形高度固定 */
  display: flex;
  margin: 0;             /* 移除 margin，靠 swiper 控制間距 */
  box-shadow: 0 10px 20px rgba(255, 168, 174, 0.3);

}

/* 發布者標籤 */
.creator-tag {
  position: absolute;
  top: -50px;
  left: 15px;
  padding: 6px 15px; /* 稍微縮小上下內距 */
  display: flex;
  flex-direction: row; /* 🌟 強制水平排列 */
  align-items: center;
  gap: 12px; /* 元素之間的間距 */
  white-space: nowrap; /* 🌟 確保文字絕對不會換行 */
  z-index: 20;
}

/* 內部的名字和時間也排成一列 */
.creator-meta {
  display: flex;
  flex-direction: row; /* 🌟 讓名字跟時間也併排 */
  align-items: center;
  gap: 10px; /* 名字跟時間中間隔開一點 */
}

.creator-name {
  font-size: 0.85rem;
  font-weight: bold;
  color: #333;
}

.post-time {
  font-size: 0.75rem;
  color: #333;
  /* 可以在時間前面加一個小圓點分隔線 */
  display: flex;
  align-items: center;
}

.post-time::before {
  content: "•";
  margin-right: 8px;
  color: #333;
}
.creator-avatar { width: 35px; height: 35px; border-radius: 50%; object-fit: cover; }

/* 內容佈局 */
.card-content {
  display: flex;
  width: 100%;
  padding: 20px 50px;
}

.left-info { 
  flex: 1;           /* 佔據剩餘所有空間 */
  min-width: 0;      /* 允許縮小到比文字窄 */
  width: 0;          /* 🌟 這是終極大招：強制從 0 開始計算寬度，由 Flex 決定分配 */
  padding-right: 50px;
  display: flex;     /* 讓內部元素也遵循 Flex */
  flex-direction: column; 
  /* 🌟 關鍵：允許子元素溢出，這樣貼紙才看得到 */
  overflow: visible;
}
.item-name {
  font-size: 2.5rem;
  margin: 0;
  color: #fff;
  font-family: 'Varela Round', 'M PLUS Rounded 1c', sans-serif;
  /* 製作出類似白色邊框的效果 */
  text-shadow: 
    1px 1px 0 #ff799f,
   -1px -1px 0 #ff799f,
    1px -1px 0 #ff799f,
   -1px 1px 0 #ff799f,
    0px 4px 10px rgba(255, 121, 159, 0.2);
  /* 單行省略 */
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* 🌟 確保寬度不會超出父層 */
  width: 90%;
}
.rating-box { color: #f1c40f; font-size: 1.5rem; margin: 10px 0; }
/* --- 外層：貼紙容器（允許溢出，負責外框樣式） --- */
.comment-text {
  flex: 1;
  position: relative; 
  margin-top: 10px;
  padding: 15px; /* 稍微調整 padding */
  background: #ffffff;
  border-radius: 12px;
  border: 2px dashed #ffb6cb;
  box-shadow: 4px 4px 0px rgba(255, 182, 203, 0.1);
  
  /* 🌟 重要：這裡不要寫 overflow: hidden，讓貼紙能飛出去 */
  overflow: visible; 
  display: flex;
}

.comment-inner {
  flex: 1;
  width: 100%;
  min-width: 0;

  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  font-size: 0.9rem;
  color: #666;

  max-height: calc(1.6em * 5); /* 5 行 */
  overflow: hidden;
}

/* --- 貼紙本體（維持原樣，現在絕對不會被砍了！） --- */
.comment-text::before {
  content: "";
  font-size: 0.6rem;
  font-weight: bold;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%) rotate(-2deg);
  width: 80px;
  height: 24px;
  background: rgba(255, 150, 180, 0.9);
  box-shadow: 2px 2px 5px rgba(0,0,0,0.1);
  z-index: 10;
}

/* 右區容器：作為定位基準 */
.right-img {
  flex: 0 0 320px; /* 固定寬度給圖片 */
  position: relative;
  height: 100%;    /* 跟隨父層長方形的高度 */
}

/* 核心：突破天際的圖片 */
.floating-img {
  position: absolute;
  bottom: 0;       /* 🌟 底部貼齊長方形底部 */
  right: 20px;     /* 距離右邊一點距離，更有層次 */
  
  width: 280px;    /* 寬度稍微縮小一點點，避免太擠 */
  max-height: 380px;
  height: 380px;
  object-fit: cover;
  border-radius: 16px;
  /* 確保它在最前面 */
  z-index: 2000;
  /* 加上一個輕微的轉場，輪播切換時更順 */
  transition: transform 0.3s ease;
}

/* 讓圖片滑鼠過去時有微動感 */
.hero-card:hover .floating-img {
  transform: translateY(-5px);
}

/* Swiper 分頁點顏色 */
:deep(.swiper-pagination-bullet-active) { background: #ff799f; }
/* 1. 讓 Swiper 容器恢復隱藏溢出，但增加上下內距讓圖片有地方伸展 */
:deep(.swiper) {
  padding-top: 120px;    /* 🌟 給圖片向上突出的空間 */
  padding-bottom: 50px;  /* 給下方陰影空間 */
  overflow: hidden;      /* 恢復隱藏，防止左右黏在一起 */
}

/* 2. 讓 Slide 寬度維持，但內容置中 */
:deep(.swiper-slide) {
  display: flex;
  justify-content: center;
  align-items: flex-end; /* 讓內容物貼齊底部 */
}

.category-tag {
  position: absolute;
  bottom: 20px;
  right: -10px;
  background: #ff799fe7;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(255, 121, 159, 0.3);
  z-index: 2001;

}

.rating-tag {
  position: absolute;
  top: -110px;
  left: -10px;
  background: rgba(255, 255, 255, 0.877);
  color: #ff799f;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(255, 121, 159, 0.3);
  z-index: 2001;

}

/* --- 手機版 RWD 設計：維持橫向版型 --- */
@media (max-width: 768px) {
  /* 1. 調整導覽列 */
  .top-nav { padding: 10px 15px; }
  .user-info .nav-name { display: none; }
  .nav-item { font-size: 0.75rem; }

  /* 2. 調整 Swiper 容器間距 */
  :deep(.swiper) {
    padding-top: 40px; /* 縮小上方空間 */
    padding-bottom: 30px;
  }
  .hero-section { 
    width: 90%; 
    margin: 40px auto;
  }

  /* 3. 長方形卡片：縮小高度以適應手機 */
  .hero-card {
    height: 135px; /* 降低高度，讓比例協調 */
  }

  /* 4. 內容區比例分配 */
  .card-content {
    padding: 15px 20px; /* 縮小內距 */
    gap: 10px;
  }

  /* 左區：文字自動撐開 */
  .left-info {
    flex: 1; 
    padding-right: 10px;
  }

  .item-name {
    font-size: 1.2rem; /* 標題縮小 */
    line-height: 1.2;
  }
  
  .rating-box {
    font-size: 1rem;
    margin: 5px 0;
  }

 .comment-inner {
  max-height: calc(1.6em * 2); /* 5 行 */
  height: calc(1.6em * 2); /* 5 行 */
}

.comment-text::before {
  top: -8px;
  left: 50%;
  width: 50px;
  height: 12px;
}

.comment-text {
  margin-top: 8px;
}

  /* 右區：固定寬度並縮小圖片 */
  .right-img {
    flex: 0 0 110px; /* 固定寬度，不讓圖片佔據太多空間 */
  }

  .floating-img {
    width: 100px;  /* 寬度大幅縮小 */
    height: 150px; /* 維持比例 */
    right: 0px;    /* 貼齊右側 */
    border-width: 3px; /* 邊框變細 */
    box-shadow: 0 10px 15px rgba(255, 168, 174, 0.3);
  }

  /* 5. 發布者標籤：也要跟著縮小 */
  .creator-tag {
    top: -32px;
    left: 15px;
    padding: 4px 10px;
  }
  .creator-avatar { width: 25px; height: 25px; }
  .creator-name { display: none; }
  .post-time { font-size: 0.6rem; }
  .category-tag {
    bottom: 10px;
    right: -20px;
    font-size: 0.7rem;
    padding: 4px 8px;

  }
  .rating-tag {
    top: -40px;
    left: -10px;
    padding: 4px 8px;
    font-size: 0.7rem;

  }
}

/* 針對更小的螢幕 (iPhone SE 等) */
@media (max-width: 400px) {
  .right-img { flex: 0 0 90px; }
  .floating-img { width: 85px; height: 130px; }
  .item-name { font-size: 1rem; }
  .hero-card {
    height: 120px; /* 降低高度，讓比例協調 */
  }
  .category-tag {
    bottom: 10px;
    right: -10px;
    font-size: 0.6rem;
    padding: 4px 7px;

  }
  .rating-tag {
    top: -35px;
    left: -10px;
    font-size: 0.6rem;
    padding: 4px 7px;

  }
   .comment-inner {
  max-height: calc(1.6em * 1); /* 5 行 */
  height: calc(1.6em * 1); /* 5 行 */
}
  
}



</style>