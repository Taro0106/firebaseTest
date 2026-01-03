import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/List',
      name: 'List',
      component: () => import('../views/ListView.vue'),
    },
    {
      path: '/AddFavory',
      name: 'AddFavory',
      component: () => import('../views/AddFavoryView.vue'),
    },
    {
      path: '/category/:catName', 
      name: 'CategoryList',
      component: () => import('../views/ListView.vue') // 同樣指向 List.vue
    }
  ],
})

export default router
