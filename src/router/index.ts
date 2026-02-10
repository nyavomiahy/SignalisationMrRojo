import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import Login from '@/views/Login.vue';
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/map'
  },
  {
  path: '/login',
  component: Login
},

  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/map'
      },
      {
        path: 'profile',
        component: () => import('@/views/Profile.vue')
      },
      {
        path: 'map',
        component: () => import('@/views/Map.vue')
      },
      {
        path: 'reports',
        component: () => import('@/views/Reports.vue')
      },
      {
        path: 'notifications',
        component: () => import('@/views/Notifications.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
