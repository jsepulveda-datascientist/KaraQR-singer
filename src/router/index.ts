import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue'), name: 'home' },
      { path: '/login', component: () => import('../pages/LoginPage.vue'), name: 'login' },
      { path: '/anotarse', component: () => import('../pages/AnotarsePage.vue'), name: 'anotarse' },
      { path: '/reacciones', component: () => import('../pages/ReaccionesPage.vue'), name: 'reacciones' },
      // Mantener rutas anteriores por compatibilidad
      { path: '/queue', redirect: '/anotarse' },
      { path: '/profile', component: () => import('../pages/ProfilePage.vue'), name: 'profile' }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard para verificar autenticación
router.beforeEach((to, from, next) => {
  // Verificar si hay un usuario autenticado
  const savedUser = localStorage.getItem('karaqr-user')
  const isAuthenticated = !!savedUser
  
  // Si no está autenticado y no va al login, redirigir al login
  if (!isAuthenticated && to.name !== 'login') {
    // Mantener la URL original con tenant para después del login
    const tenantQuery = to.query.t || to.params.tenant
    const loginUrl = tenantQuery ? `/login?t=${tenantQuery}` : '/login'
    next(loginUrl)
    return
  }
  
  // Si está autenticado y va al login, redirigir al home
  if (isAuthenticated && to.name === 'login') {
    const tenantQuery = to.query.t
    const homeUrl = tenantQuery ? `/?t=${tenantQuery}` : '/'
    next(homeUrl)
    return
  }
  
  // Continuar normalmente
  next()
})

export default router