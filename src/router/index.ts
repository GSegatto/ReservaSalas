
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/reservas',
    },
    {
      path: '/salas',
      name: 'salas',
      component: () => import('@/pages/SalasPage.vue'),
    },
    {
      path: '/reservas',
      name: 'reservas',
      component: () => import('@/pages/ReservasPage.vue'),
    },
    {
      path: '/reservas/nova',
      name: 'nova-reserva',
      component: () => import('@/pages/NovaReservaPage.vue'),
    },
    {
      path: '/reservas/:id',
      name: 'agenda-sala',
      component: () => import('@/pages/AgendaSalaPage.vue'),
      props: true,
    },
  ],
})

export default router
