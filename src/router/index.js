import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/Myhome',
      name: 'Myhome',
      component: () => import('../views/MyhomeView.vue'),
      // 🌟 使用 children 來定義子頁面
      children: [
        {
          path: 'List', // 注意：子路由路徑通常不加 /，會自動繼承父路徑變成 /Myhome/List
          name: 'List',
          component: () => import('../views/ListView.vue'),
        },
        {
          path: 'AddFavory',
          name: 'AddFavory',
          component: () => import('../views/AddFavoryView.vue'),
        },
        {
          path: 'category/:catName', 
          name: 'CategoryList',
          component: () => import('../views/ListView.vue')
        },
        {
          path: 'PersonalData', 
          name: 'PersonalData',
          component: () => import('../views/PersonalDataView.vue')
        }
      ]
    },
    {
      path: '/Home',
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
  ],
})

export default router
