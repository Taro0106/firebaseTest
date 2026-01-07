<script setup>
import { ref, onMounted } from 'vue'
import { auth, db } from '../firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Swal from 'sweetalert2'

const userData = ref({
  displayName: '',
  photoURL: '',
  totalCollections: 0,
  createdAt: null
})

const isEditing = ref(false)
const newName = ref('')
const loading = ref(true)
const isUploading = ref(false) // 🌟 新增上傳狀態

// --- Cloudinary 設定 (複用你的設定) ---
const cloudName = "dn6r2yt4y"; 
const uploadPreset = "avatar";

// 🌟 核心功能：上傳頭貼並更新資料庫
const uploadAvatar = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  try {
    // 1. 上傳到 Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    
    if (data.secure_url) {
      const newPhotoURL = data.secure_url
      
      // 2. 更新 Firestore 中的 users 資料
      const userRef = doc(db, "users", auth.currentUser.uid)
      await updateDoc(userRef, {
        photoURL: newPhotoURL
      })

      // 3. 更新本地狀態
      userData.value.photoURL = newPhotoURL
      
      Swal.fire({ icon: 'success', title: '頭貼更新成功！', timer: 1500, showConfirmButton: false })
    }
  } catch (error) {
    console.error(error)
    Swal.fire({ icon: 'error', title: '頭貼上傳失敗 Q_Q' })
  } finally {
    isUploading.value = false
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        userData.value = userSnap.data()
        newName.value = userData.value.displayName
      }
      loading.value = false
    }
  })
})

const handleUpdateProfile = async () => {
  if (!newName.value.trim()) return
  try {
    const userRef = doc(db, "users", auth.currentUser.uid)
    await updateDoc(userRef, { displayName: newName.value })
    userData.value.displayName = newName.value
    isEditing.value = false
    Swal.fire({ icon: 'success', title: '修改成功！', timer: 1500, showConfirmButton: false })
  } catch (error) {
    Swal.fire({ icon: 'error', title: '更新失敗' })
  }
}
</script>

<template>
  <div class="profile-container" v-if="!loading">
    <div class="profile-card">
      <div class="card-header"></div>
      
      <div class="profile-content">
        <div class="avatar-section">
          <label class="avatar-upload-label">
            <input type="file" @change="uploadAvatar" hidden accept="image/*" :disabled="isUploading" />
            
            <div class="avatar-wrapper">
              <img :src="userData.photoURL" class="profile-avatar" :class="{ 'uploading': isUploading }">
              
              <div class="avatar-hover-overlay">
                <i class="fa-solid fa-camera"></i>
                <span>更換頭貼</span>
              </div>
              
              <div v-if="isUploading" class="avatar-loading">
                <div class="spinner"></div>
              </div>
            </div>
          </label>
        </div>

        <div class="info-section">
          <div v-if="!isEditing" class="name-display">
            <h1>{{ userData.displayName }}</h1>
            <button @click="isEditing = true" class="edit-btn">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
          <div v-else class="name-edit">
            <input v-model="newName" class="edit-input" maxlength="12">
            <div class="edit-actions">
              <button @click="handleUpdateProfile" class="save-btn">儲存</button>
              <button @click="isEditing = false" class="cancel-btn">取消</button>
            </div>
          </div>
          <p class="uid-text">ID: {{ auth.currentUser.uid}}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ userData.totalCollections }}</span>
            <span class="stat-label">總收藏筆數</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ userData.createdAt?.toDate ? new Date(userData.createdAt.toDate()).toLocaleDateString() : '尚未記錄' }}</span>
            <span class="stat-label">加入日期</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 🌟 新增/修正的 CSS 樣式 */
.avatar-upload-label {
  cursor: pointer;
  display: inline-block;
  position: relative;
}

.avatar-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 5px solid white;
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}

.profile-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
}

.profile-avatar.uploading {
  filter: blur(2px) brightness(0.7);
}

/* 滑過效果 */
.avatar-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 0.8rem;
}

.avatar-hover-overlay i {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.avatar-upload-label:hover .avatar-hover-overlay {
  opacity: 1;
}

/* 上傳中的旋轉動畫 */
.avatar-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.3);
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #ffb6cb;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ... 其餘原本的 Profile 樣式 ... */
.profile-container { display: flex; justify-content: center; align-items: center; min-height: 80vh; padding: 20px; }
.profile-card { background: white; width: 100%; max-width: 450px; border-radius: 30px; overflow: hidden; box-shadow: 0 15px 35px rgba(255, 121, 159, 0.15); border: 2px solid #fff0f5; }
.card-header { height: 120px; background: linear-gradient(135deg, #ffb6cb 0%, #ff799f 100%); }
.profile-content { padding: 0 30px 40px; text-align: center; margin-top: -60px; }
.info-section { margin: 25px 0; }
.name-display { display: flex; align-items: center; justify-content: center; gap: 10px; }
.name-display h1 { font-size: 1.8rem; color: #5d4037; margin: 0; }
.edit-btn { background: none; border: none; color: #ffb6cb; cursor: pointer; font-size: 1.2rem; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px; }
.stat-item { background: #fffafb; padding: 20px; border-radius: 20px; border: 1px solid #fff0f5; }
.stat-value { display: block; font-size: 1.4rem; font-weight: 900; color: #ff799f; }
.stat-label { font-size: 0.8rem; color: #aaa; }
.edit-input { padding: 10px; border: 2px solid #ffe4e1; border-radius: 10px; text-align: center; font-size: 1.2rem; width: 80%; margin-bottom: 10px; }
.save-btn { background: #ff799f; color: white; border: none; padding: 8px 20px; border-radius: 10px; margin-right: 5px; cursor: pointer; }
.cancel-btn { background: #eee; border: none; padding: 8px 20px; border-radius: 10px; cursor: pointer; }
.uid-text { font-size: 0.7rem; color: #ccc; margin-top: 10px; }
</style>