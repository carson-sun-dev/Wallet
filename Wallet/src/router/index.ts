import { createRouter, createWebHistory } from 'vue-router'
import TransactionDetail from '../components/views/TransactionDetail.vue'
import Home from '../components/views/Home.vue'
import ProfilePlaceholder from '../components/views/ProfilePlaceholder.vue'
import AboutPlaceholder from '../components/views/About.vue'
import Login from '@/components/register/Login.vue'
import Accounts from '../components/views/Accounts.vue'
import BudgetSettings from '../components/views/BudgetSettings.vue'
import Statistics from '../components/views/Statistics.vue'
import { useAuthStore } from '@/stores/auth'

const publicPaths = ['/', '/login', '/about']

const routes = [
  { path: '/', component: Login },
  { path: '/login', component: Login },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/all-transactions', component: TransactionDetail, meta: { requiresAuth: true } },
  { path: '/profile', component: ProfilePlaceholder, meta: { requiresAuth: true } },
  { path: '/accounts', component: Accounts, meta: { requiresAuth: true } },
  { path: '/budget', component: BudgetSettings, meta: { requiresAuth: true } },
  { path: '/statistics', component: Statistics, meta: { requiresAuth: true } },
  { path: '/about', component: AboutPlaceholder }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth)
  if (requiresAuth && !auth.isLoggedIn) {
    next('/login')
  } else if ((to.path === '/' || to.path === '/login') && auth.isLoggedIn) {
    next('/home')
  } else {
    next()
  }
})

export default router
