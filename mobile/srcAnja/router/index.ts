import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue';
import LoginPage from '@/views/LoginPage.vue';
import { getCurrentUserFromStorage } from '@/services/userService';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/tabs/',
    component: TabsPage,
    meta: { requiresAuth: true },
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
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Garde de navigation
router.beforeEach((to, from, next) => {
  const isAuthenticated = getCurrentUserFromStorage() !== null;
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    if (to.path === '/login' && isAuthenticated) {
      next('/tabs/map');
    } else {
      next();
    }
  }
})

export default router