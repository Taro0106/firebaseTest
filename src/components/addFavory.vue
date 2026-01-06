<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase' 
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, where } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
const router = useRouter()
// --- 1. 狀態與表單變數 ---
const isModalOpen = ref(false)
const FavoryName = ref('')
const imageUrl = ref('') 
const category = ref('')
const status = ref('')
const rating = ref(0)
const comment = ref('')
const isUploading = ref(false)
const collectionList = ref([]) 

// --- 2. Cloudinary 設定 ---
const cloudName = "dn6r2yt4y"; 
const uploadPreset = "Favory";

const uploadToCloudinary = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    if (data.secure_url) imageUrl.value = data.secure_url
  } catch (error) {
    alert('圖片傳送失敗 Q_Q')
  } finally {
    isUploading.value = false
  }
}

const addItem = async () => {
  // 驗證失敗：改用 Swal.fire 警告
  if (!FavoryName.value) {
    return Swal.fire({
      icon: 'warning',
      title: '哎呀！',
      text: '請輸入名稱喔！',
      confirmButtonColor: '#6366f1'
    });
  }
  
  if (!imageUrl.value) {
    return Swal.fire({
      icon: 'warning',
      title: '圖片在哪呢？',
      text: '請挑選一張喜歡的圖片作為封面吧！',
      confirmButtonColor: '#6366f1'
    });
  }

  if (!auth.currentUser) {
    return Swal.fire({
      icon: 'error',
      title: '權限不足',
      text: '登入後才能收藏喔！',
      confirmButtonColor: '#6366f1'
    });
  }

  // 顯示儲存中的 Loading 狀態（防止重複點擊）
  Swal.fire({
    title: '儲存中...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    await addDoc(collection(db, "myFavoryList"), {
      name: FavoryName.value,
      image: imageUrl.value,
      category: category.value,
      status: status.value,
      rating: rating.value,
      comment: comment.value,
      uid: auth.currentUser.uid,
      createdAt: new Date()
    });

    // 成功後顯示超美的勾勾
    Swal.fire({
      icon: 'success',
      title: '成功加入收藏！',
      text: `《${FavoryName.value}》已經入庫囉！`,
      timer: 2000, // 2秒後自動關閉
      showConfirmButton: false,
      timerProgressBar: true,
    });

    // 重置表單
    FavoryName.value = ''; 
    imageUrl.value = ''; 
    comment.value = '';
    category.value = ''; // 記得把分類也重置
    rating.value = 0;    // 回到預設評分
    isModalOpen.value = false;
    router.push('/Myhome/List');

  } catch (e) {
    console.error(e);
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: '發生了一些錯誤，請稍後再試 Q_Q',
    });
  }
}
</script>
<template>
  <div class="container">
    <div class="main-content">
      <div class="image-section">
        <label class="upload-box" :style="{ backgroundImage: `url(${imageUrl})` }">
          <input type="file" @change="uploadToCloudinary" hidden accept="image/*" />
          
          <div v-if="!imageUrl && !isUploading" class="upload-placeholder">
            <span>+ 點擊上傳封面</span>
          </div>
          
          <div v-if="isUploading" class="loading-overlay">上傳中...</div>
          
          <div v-if="imageUrl" class="hover-overlay">
            <span>更換圖片</span>
          </div>
        </label>
      </div>

      <div class="info-section">
        <div class="form-group">
          <label class="label-text">作品名稱</label>
          <input style="max-width: 90%;" v-model="FavoryName" type="text" placeholder="請輸入名稱..." class="input-text" />
        </div>

        <div class="form-group">
          <label class="label-text">狀態</label>
          <div class="radio-group">
            <label><input type="radio" v-model="status" value="完結" hidden> 完結</label>
            <label><input type="radio" v-model="status" value="未完結" hidden> 未完結</label>
          </div>
        </div>

        <div class="form-group">
          <label class="label-text">分類</label>
          <div class="radio-group">
            <label><input type="radio" v-model="category" value="漫畫" hidden> 漫畫</label>
            <label><input type="radio" v-model="category" value="動漫" hidden> 動漫</label>
            <label><input type="radio" v-model="category" value="電影" hidden> 電影</label>
            <input type="text" v-model="category" placeholder="其他" class="input-inline" />
          </div>
        </div>

        

        <div class="form-group rating-row">
          <label>
            <label class="label-text">評分</label>
          </label>
          
          <div class="star-group">
            <span 
              v-for="num in 5" 
              :key="num"
              class="star-item"
              :class="{ 'active': num <= rating }"
              @click="rating = num"
              @mouseover="hoverRating = num"
              @mouseleave="hoverRating = 0"
            >
              ★
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="comment-section">
      <label class="label-text">評論</label>
      <textarea v-model="comment" placeholder="寫點什麼吧..."></textarea>
      <button @click="addItem" :disabled="isUploading" class="submit-btn">
        {{ isUploading ? '上傳中...' : '確認收藏' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 90%;
  max-width: 90%;
  margin: 20px auto;
  padding: 20px;
  background: #fdfdfddc;
  border-radius: 12px;
  box-shadow: 0 4px 15px #ffdce6;
  border: 2px solid #ffb6cb;
}

.main-content {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

/* 圖片區 */
.image-section {
  flex: 0 0 200px;
}
.upload-box {
  display: block;
  width: 200px;
  height: 280px; /* 黃金比例封面 */
  border: 2px dashed #ccc;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}
.upload-box:hover { border-color: #ffb6cb; }
.upload-placeholder:hover,.loading-overlay:hover{ color: #ffb6cb; }

.upload-placeholder,.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #888;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: 0.3s;
}
.upload-box:hover .hover-overlay { opacity: 1; }

/* 表單區 */
.info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.input-text {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.radio-group {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.rating-value {
  color: #ffb6cb;
  font-weight: bold;
  margin-left: 5px;
}

.star-group {
  display: flex;
  gap: 8px; /* 讓星星整齊排列的間距 */
}

/* 評分橫向排列 */
.rating-row {
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.star-item {
  font-size: 20px; /* 星星大小 */
  cursor: pointer;
  color: #e0e0e0; /* 未選中的灰色 */
  transition: all 0.2s ease;
  user-select: none; /* 防止快速點擊時選取到文字 */
}

/* 點擊後的狀態或是滑鼠滑過時的顏色 */
.star-item.active,
.star-item:hover {
  color: #ffb6cb;
  transform: scale(1.1); /* 稍微放大，更有互動感 */
  text-shadow: 0 0 10px rgba(255, 168, 174, 0.3); /* 淡淡的金光 */
}

/* 讓滑鼠移入前面的星星也會一起變色 */
.star-group:hover .star-item:hover ~ .star-item {
  color: #e0e0e0;
  transform: scale(1);
}
/* 下區敘述 */
.comment-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
textarea {
  height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: none;
}
.submit-btn {
  background: #ffb6cb;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.submit-btn:hover { background: #ff799f; }

/* ===== 通用輸入器 ===== */
.input-text,
.input-inline,
textarea {
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  background: #fff;
  color: #8c8c8c;
  transition: 
    border-color 0.25s,
    box-shadow 0.25s,
    background-color 0.25s;
}

.input-text::placeholder,
.input-inline::placeholder,
textarea::placeholder {
  color: #aaa;
}

/* focus 狀態 */
.input-text:focus,
.input-inline:focus,
textarea:focus {
  outline: none;
  border-color: #ffb6cb;
  box-shadow: 0 0 0 3px rgba(255, 168, 174, 0.3);
  background: #fcfdff;
  color: #5e5e5e;
}

/* ===== Radio 美化（不破壞原結構） ===== */
.radio-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #aaaaaa;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.25s;
  color: #aaaaaa;
}

.radio-group input[type="radio"] {
  accent-color: #ffb6cb;
}

/* 被選取時整個 label 高亮 */
.radio-group label:has(input:checked) {
  background: #fff;
  border-color: #ffb6cb;
  color: #ffb6cb;
}

/* ===== textarea 額外優化 ===== */
textarea {
  line-height: 1.6;
}

/* 📱 RWD：小於 768px 時上下排 */
@media (max-width: 768px) {
  .container {
    margin: 20px auto 100px;
  }
  .main-content {
    flex-direction: column;
    align-items: center;
  }

  .image-section {
    flex: none;
  }

  .upload-box {
    width: 180px;      /* 手機稍微小一點比較好看 */
    height: 260px;
  }

  .info-section {
    width: 100%;
  }
}

/* 標籤設計：增加一點點間距與可愛感 */
.label-text {
  color: #ff799f;
  font-weight: bold;
  font-size: 0.95rem;
  letter-spacing: 1px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* 在標籤前加一個小點點，增加精緻度 */
.label-text::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  background-color: #ff799f;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px rgba(255, 121, 159, 0.5);
}
</style>