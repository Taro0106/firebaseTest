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
  <div class="home-container">
    <TopNav/>
    <Hero/>

    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
    1<br>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;

  /* 🌸 主背景：淡奶白＋極柔粉 */
  background:
    radial-gradient(circle at 80% 20%, #fff3f6 0%, transparent 35%),
    radial-gradient(circle at 20% 80%, #f3f6ff 0%, transparent 40%),
    linear-gradient(180deg, #ffffff 0%, #fafafa 100%);

  position: relative;
  overflow-x: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

/* ✨ 柔霧裝飾（小顆、低存在感） */
.home-container::before,
.home-container::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  z-index: 0;
  filter: blur(80px);
  opacity: 0.35;
  pointer-events: none;
}

/* 左上柔粉霧 */
.home-container::before {
  width: 260px;
  height: 260px;
  background: #ffdfe6;
  top: 5%;
  left: -120px;
}

/* 右下淡藍霧 */
.home-container::after {
  width: 240px;
  height: 240px;
  background: #e8edff;
  bottom: 10%;
  right: -120px;
}


/* 針對 Chrome, Safari, 以及新版 Edge (WebKit) */
.home-container::-webkit-scrollbar {
  display: none;
}

</style>