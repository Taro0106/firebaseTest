<script setup>
import { onMounted } from 'vue'
import { auth, provider, db } from '../firebase' // 🌟 記得匯入 db
import { signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore' // 🌟 匯入 Firestore 方法
import { useRouter } from 'vue-router'

const router = useRouter()

// 🌟 核心功能：同步使用者資料到 users 集合
const syncUserToDatabase = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // 新使用者：初始化資料，這是「名人堂」的數據基礎
    console.log("歡迎新收藏家！正在建立個人檔案...");
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      totalCollections: 0, // 初始化計數器
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    // 舊使用者：僅更新最後登入時間
    await setDoc(userRef, { 
      lastLogin: serverTimestamp(),
    }, { merge: true });
  }
}

onMounted(async () => {
  try {
    const result = await getRedirectResult(auth)
    if (result) {
      // --- 手機版登入成功 ---
      await syncUserToDatabase(result.user); // 🌟 先同步資料再跳轉
      console.log("登入成功:", result.user.displayName)
      router.push('/Home')
    }
  } catch (error) {
    console.error("重定向登入出錯:", error.code)
  }
})

const handleLogin = async () => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  try {
    if (isMobile) {
      // 手機版：跳轉
      await signInWithRedirect(auth, provider)
    } else {
      // 電腦版：彈窗
      await signInWithPopup(auth, provider)
      router.push('/Home')
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="brand-section">
      <div class="brand-content">
        <img src="../pic/logo2.png" alt="Logo" class="main-logo" />
        <p class="app-slogan">紀錄每一份心動的二次元回憶</p>
      </div>
    </div>

    <div class="auth-section">
      <div class="login-card">
        <h2>歡迎回來 🌸</h2>
        <p>請使用您的 Google 帳號登入以同步收藏</p>
        
        <button @click="handleLogin" class="google-login-btn">
          <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" class="google-icon" />
          使用 Google 帳號登入
        </button>

        <div class="footer-links">
          <span>繼續使用即代表同意條款</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: white;
}

/* 左側品牌區 */
.brand-section {
  flex: 1.2; /* 佔據稍微多一點的空間 */
  background: linear-gradient(135deg, #fff5f7 0%, #ffe4e1 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.brand-content {
  text-align: center;
}

.main-logo {
  width: 180px;
  filter: drop-shadow(0 10px 20px rgba(255, 182, 193, 0.4));
  margin-bottom: 20px;
}

.app-title {
  font-size: 3.5rem;
  color: #ff82ab;
  margin: 10px 0;
  letter-spacing: 2px;
}

.app-slogan {
  color: #5d4037;
  font-size: 1.2rem;
  opacity: 0.8;
}

/* 右側登入區 */
.auth-section {
  flex: 0.8;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: white;
}

.login-card {
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.login-card h2 {
  color: #5d4037;
  font-size: 2rem;
  margin-bottom: 10px;
}

.login-card p {
  color: #888;
  margin-bottom: 40px;
}

/* Google 按鈕樣式 */
.google-login-btn {
  width: 100%;
  padding: 15px;
  border: 2px solid #ffe4e1;
  background: white;
  border-radius: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 1.1rem;
  color: #5d4037;
  cursor: pointer;
  transition: 0.3s;
}

.google-login-btn:hover {
  background: #fff5f7;
  border-color: #ffb6c1;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 182, 193, 0.2);
}

.google-icon {
  width: 24px;
}

.footer-links {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #ccc;
}

/* --- 手機版自適應 --- */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column; /* 改為上下排列 */
  }

  .brand-section {
    flex: 0.4; /* 上面佔比縮小 */
    padding: 20px;
  }

  .main-logo { width: 100px; }
  .app-title { font-size: 2rem; }
  .app-slogan { font-size: 1rem; }

  .auth-section {
    flex: 0.6;
    padding: 30px 20px;
    border-radius: 30px 30px 0 0;
    margin-top: -30px; /* 讓白色卡片稍微疊在粉色背景上，更有層次感 */
  }
}
</style>